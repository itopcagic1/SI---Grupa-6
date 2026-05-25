const {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
} = require('../services/rezervacijaService');
const { getMojeRezervacijeService } = require('../services/rezervacijaService');
const {
  kreirajGrupniTreningService,
  prijaviSeNaGrupniTreningService,
  getTrenerGrupniTreninziService,
  getGrupniTreninziService,
  otkaziGrupniTreningService,
  odjaviSeSaGrupnogTreningaService,
  getTrenerNotifikacijeService,
} = require('../services/grupneRezervacijeService');

const { reservationQueue } = require('../queues/reservationQueue');
const { calculateTimeoutMilliseconds } = require('../utils/timeoutCalculator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Helper: precizna razlika u satima bez truncatiranja i timezone problema
function hoursUntil(dateTime) {
  return (new Date(dateTime).getTime() - Date.now()) / (1000 * 60 * 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// ZAJEDNIČKI HELPER: Broji ISTORIJU otkazivanja korisnika u KONKRETNOM objektu
// ─────────────────────────────────────────────────────────────────────────────
async function primijeniKaznuAkoTrebaUObjektu(korisnikId, objekatId, kontekst) {
  try {
    const konvertovanKorisnikId = parseInt(korisnikId);
    const konvertovanObjekatId = parseInt(objekatId);

    // Brojimo sve rezervacije ovog korisnika (preko zahtjeva) u ovom objektu koje su otkazane
    const brojOtkazanih = await prisma.rezervacija.count({
      where: {
        zahtjev: {
          korisnikId: konvertovanKorisnikId
        },
        status: { in: ['CANCELLED', 'OTKAZANO', 'REJECTED', 'OTKAZANA'] },
        terminObjekta: {
          objekatId: konvertovanObjekatId
        }
      }
    });

    console.log(`[KAZNA PROVJERA - ${kontekst}] Korisnik ${konvertovanKorisnikId} u objektu ${konvertovanObjekatId} ima ukupno ${brojOtkazanih} otkazivanja.`);

    // 3 prekršaja u istom objektu -> prelazak u status NEPOUZDAN
    if (brojOtkazanih >= 3) {
      await prisma.korisnik.update({
        where: { korisnikId: konvertovanKorisnikId },
        data: {
          statusPouzdanosti: 'NEPOUZDAN',
          brojPreksrenihRezervacija: brojOtkazanih // Koristi tačan naziv polja iz tvoje šeme
        }
      });
      console.log(`[KAZNA BAN] Korisnik ${konvertovanKorisnikId} je postao NEPOUZDAN zbog prekršaja u objektu ${konvertovanObjekatId}!`);
    } else {
      await prisma.korisnik.update({
        where: { korisnikId: konvertovanKorisnikId },
        data: {
          brojPreksrenihRezervacija: brojOtkazanih
        }
      });
    }
  } catch (error) {
    console.error(`[KAZNA CRASH - ${kontekst}] Greška pri obračunavanju kazne:`, error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

const getFreeIndividualTerms = async (req, res) => {
  try {
    const termini = await getAllTermsService(req.user.korisnikId);
    res.json({ termini });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju termina.',
    });
  }
};

const kreirajIndividualnuRezervaciju = async (req, res) => {
  try {
    const termId = req.params.id;
    const isTrusted = req.user?.statusPouzdanosti !== 'NEPOUZDAN';

    const result = await createIndividualReservationService(termId, req.user, isTrusted);

    if (result.tip === 'REZERVISANO') {
      return res.json({
        poruka: 'Termin je uspješno rezervisan.',
        status: 'POTVRDJENA',
      });
    }

    const reservationId = result.reservationId;
    const termStartTime = result.termStartTime;
    const delayMilliseconds = calculateTimeoutMilliseconds(termStartTime);

    await reservationQueue.add(
      'check-reservation-timeout',
      { reservationId, termId },
      { delay: delayMilliseconds }
    );

    return res.json({
      poruka: 'Vaš zahtjev je poslan na čekanje i biće obrađen od strane administratora zbog statusa računa.',
      status: 'NA_CEKANJU',
    });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom rezervacije termina.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. INDIVIDUALNO OTKAZIVANJE (Prebrojava istoriju u tom objektu)
// ─────────────────────────────────────────────────────────────────────────────
const otkaziIndividualnuRezervaciju = async (req, res) => {
  try {
    const terminIdKonvertovan = parseInt(req.params.id);
    const korisnikId = req.user.korisnikId || req.user.id;

    const termin = await prisma.terminObjekta.findUnique({
      where: { terminId: terminIdKonvertovan }
    });

    // Pokrećemo tvoj servis koji otkazuje rezervaciju
    const rezultat = await cancelIndividualReservationService(terminIdKonvertovan, korisnikId);

    if (termin) {
      const hoursLeft = hoursUntil(termin.vrijemePocetka);

      if (hoursLeft < 24) {
        // Pokrećemo helper koji ažurira bazu podataka
        await primijeniKaznuAkoTrebaUObjektu(korisnikId, termin.objekatId, 'INDIVIDUALNA');
        
        // Provjeravamo svjež status korisnika iz baze nakon kazne
        const osvjezeniKorisnik = await prisma.korisnik.findUnique({
          where: { korisnikId: parseInt(korisnikId) }
        });

        // Ako je korisnik upravo postao NEPOUZDAN, presrećemo standardni odgovor i šaljemo upozorenje!
        if (osvjezeniKorisnik && osvjezeniKorisnik.statusPouzdanosti === 'NEPOUZDAN') {
          return res.json({
            ...rezultat,
            upozorenje: "KAZNA_ZABRANA",
            poruka: "Otkazali ste termin 3 puta unutar 24h u ovom objektu. Vaš nalog je prebačen u status 'NEPOUZDAN' i svaki naredni zahtjev će ići na listu čekanja kod administratora!"
          });
        }
      }
    }

    return res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom otkazivanja rezervacije.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VLASNIČKE FUNKCIJE (Prilagođene tvojoj šemi)
// ─────────────────────────────────────────────────────────────────────────────
const ownerCancelReservation = async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Razlog otkazivanja je obavezan.' });
    }

    const reservation = await prisma.rezervacija.findUnique({
      where: { rezervacijaId: reservationId },
      include: { terminObjekta: true },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Rezervacija nije pronađena.' });
    }

    if (reservation.status !== 'CONFIRMED' && reservation.status !== 'POTVRDJENA') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Samo potvrđene rezervacije se mogu otkazati.' });
    }

    const hoursLeft = hoursUntil(reservation.terminObjekta.vrijemePocetka);

    if (hoursLeft < 24) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Otkazivanje mora biti bar 24h ranije.' });
    }

    await prisma.rezervacija.update({
      where: { rezervacijaId: reservationId },
      data: { status: 'CANCELLED', razlogOtkazivanja: reason },
    });

    return res.json({ message: 'Rezervacija uspješno otkazana od strane vlasnika.' });
  } catch (error) {
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

const ownerApprovePendingReservation = async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    await prisma.rezervacija.update({ where: { rezervacijaId: reservationId }, data: { status: 'CONFIRMED' } });
    return res.json({ message: 'Zahtjev odobren.' });
  } catch (error) {
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

const ownerRejectPendingReservation = async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    const reservation = await prisma.rezervacija.findUnique({ where: { rezervacijaId: reservationId } });
    if (reservation) {
      await prisma.rezervacija.update({ where: { rezervacijaId: reservationId }, data: { status: 'REJECTED' } });
    }
    return res.json({ message: 'Zahtjev odbijen.' });
  } catch (error) {
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GRUPNI TRENINZI (Prilagođeni tvojoj šemi)
// ─────────────────────────────────────────────────────────────────────────────
const kreirajGrupniTrening = async (req, res) => {
  try {
    const terminId = req.params.id;
    const { maksimalanBrojIgraca, timId } = req.body;
    const resultado = await kreirajGrupniTreningService(terminId, req.user.korisnikId, maksimalanBrojIgraca, timId);
    res.status(201).json({ poruka: 'Grupni trening je uspješno kreiran.', trening: resultado });
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

const prijaviSeNaGrupniTrening = async (req, res) => {
  try {
    const id = req.params.id;
    const rezultat = await prijaviSeNaGrupniTreningService(id, req.user.korisnikId);
    res.status(200).json({ poruka: 'Uspješno ste se prijavili.', prijava: rezultat });
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

const getTrenerGrupniTreninzi = async (req, res) => {
  try {
    const treninzi = await getTrenerGrupniTreninziService(req.user.korisnikId);
    res.json({ treninzi });
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

const getGrupniTreninzi = async (req, res) => {
  try {
    const treninzi = await getGrupniTreninziService(req.user.korisnikId);
    res.json({ treninzi });
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

const otkaziGrupniTrening = async (req, res) => {
  try {
    const treningIdKonvertovan = parseInt(req.params.id);
    const korisnikId = req.user.korisnikId || req.user.id;

    const grupniTrening = await prisma.grupniTrening.findUnique({
      where: { treningId: treningIdKonvertovan },
      include: { terminObjekta: true }
    });

    const rezultat = await otkaziGrupniTreningService(treningIdKonvertovan, korisnikId);

    if (grupniTrening && grupniTrening.terminObjekta) {
      const hoursLeft = hoursUntil(grupniTrening.terminObjekta.vrijemePocetka);

      if (hoursLeft < 24) {
        await primijeniKaznuAkoTrebaUObjektu(korisnikId, grupniTrening.terminObjekta.objekatId, 'OTKAZI_GRUPNI');

        const osvjezeniKorisnik = await prisma.korisnik.findUnique({
          where: { korisnikId: parseInt(korisnikId) }
        });

        if (osvjezeniKorisnik && osvjezeniKorisnik.statusPouzdanosti === 'NEPOUZDAN') {
          return res.json({
            ...rezultat,
            upozorenje: "KAZNA_ZABRANA",
            poruka: "Otkazali ste termin 3 puta unutar 24h u ovom objektu. Vaš nalog je prebačen u status 'NEPOUZDAN' i svaki naredni zahtjev će ići na listu čekanja kod administratora!"
          });
        }
      }
    }

    return res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

const odjaviSeSaGrupnogTreninga = async (req, res) => {
  try {
    const treningIdKonvertovan = parseInt(req.params.id);
    const { razlog } = req.body || {};
    const korisnikId = req.user.korisnikId || req.user.id;

    const grupniTrening = await prisma.grupniTrening.findUnique({
      where: { treningId: treningIdKonvertovan },
      include: { terminObjekta: true }
    });

    const rezultat = await odjaviSeSaGrupnogTreningaService(treningIdKonvertovan, korisnikId, razlog);

    if (grupniTrening && grupniTrening.terminObjekta) {
      const hoursLeft = hoursUntil(grupniTrening.terminObjekta.vrijemePocetka);

      if (hoursLeft < 24) {
        await primijeniKaznuAkoTrebaUObjektu(korisnikId, grupniTrening.terminObjekta.objekatId, 'ODJAVA_GRUPNI');

        const osvjezeniKorisnik = await prisma.korisnik.findUnique({
          where: { korisnikId: parseInt(korisnikId) }
        });

        if (osvjezeniKorisnik && osvjezeniKorisnik.statusPouzdanosti === 'NEPOUZDAN') {
          return res.json({
            ...rezultat,
            upozorenje: "KAZNA_ZABRANA",
            poruka: "Odjavili ste se 3 puta unutar 24h u ovom objektu. Vaš nalog je prebačen u status 'NEPOUZDAN' i svaki naredni zahtjev će ići na listu čekanja kod administratora!"
          });
        }
      }
    }

    return res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const getTrenerNotifikacije = async (req, res) => {
  try {
    const notifikacije = await getTrenerNotifikacijeService(req.user.korisnikId);
    res.json({ notifikacije });
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

const getMojeRezervacije = async (req, res) => {
  try {
    const rezervacije = await getMojeRezervacijeService(req.user.korisnikId);
    res.json({ rezervacije });
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

module.exports = {
  getFreeIndividualTerms,
  kreirajIndividualnuRezervaciju,
  otkaziIndividualnuRezervaciju,
  kreirajGrupniTrening,
  prijaviSeNaGrupniTrening,
  getTrenerGrupniTreninzi,
  getGrupniTreninzi,
  otkaziGrupniTrening,
  odjaviSeSaGrupnogTreninga,
  getTrenerNotifikacije,
  ownerCancelReservation,
  ownerApprovePendingReservation,
  ownerRejectPendingReservation,
  getMojeRezervacije,
};