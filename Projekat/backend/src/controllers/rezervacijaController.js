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

const PRAG_NEPOUZDANOSTI = 3;

// Računanje preostalih sati do termina
function hoursUntil(dateTime) {
  if (!dateTime) return 999;
  const sad = new Date();
  const pocetakTermina = new Date(dateTime);

  const utcSad = Date.UTC(sad.getUTCFullYear(), sad.getUTCMonth(), sad.getUTCDate(), sad.getUTCHours(), sad.getUTCMinutes(), sad.getUTCSeconds());
  const utcPocetak = Date.UTC(pocetakTermina.getUTCFullYear(), pocetakTermina.getUTCMonth(), pocetakTermina.getUTCDate(), pocetakTermina.getUTCHours(), pocetakTermina.getUTCMinutes(), pocetakTermina.getUTCSeconds());

  const razlikaUms = utcPocetak - utcSad;
  const preostaloSati = razlikaUms / (1000 * 60 * 60);
  const razlikaUDanima = Math.ceil(razlikaUms / (1000 * 60 * 60 * 24));

  if (preostaloSati < 24 || razlikaUDanima <= 1) {
    return 0; 
  }
  return preostaloSati;
}

// Inkrementiranje prekršaja korisnika
async function zabiljeziPrekrsaj(korisnikId) {
  const kId = parseInt(korisnikId);
  const korisnik = await prisma.korisnik.findUnique({
    where: { korisnikId: kId },
    select: { brojPreksrenihRezervacija: true, statusPouzdanosti: true },
  });

  const noviBroj = (korisnik?.brojPreksrenihRezervacija || 0) + 1;
  const noviStatus = noviBroj >= PRAG_NEPOUZDANOSTI ? 'NEPOUZDAN' : (korisnik?.statusPouzdanosti || 'SREDJEN');

  await prisma.korisnik.update({
    where: { korisnikId: kId },
    data: {
      brojPreksrenihRezervacija: noviBroj,
      statusPouzdanosti: noviStatus,
    },
  });

  return { noviStatus, noviBroj };
}

async function dohvatiTrenutniBrojPrekrsaja(korisnikId) {
  const korisnik = await prisma.korisnik.findUnique({
    where: { korisnikId: parseInt(korisnikId) },
    select: { brojPreksrenihRezervacija: true }
  });
  return korisnik?.brojPreksrenihRezervacija || 0;
}

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
    const termId = parseInt(req.params.id);
    const korisnikId = parseInt(req.user.korisnikId || req.user.id);

    if (isNaN(termId)) {
      return res.status(400).json({ poruka: 'ID termina nije validan broj.' });
    }

    const isTrusted = req.user?.statusPouzdanosti !== 'NEPOUZDAN';

    const result = await createIndividualReservationService(
      termId, 
      { 
        id: korisnikId, 
        korisnikId: korisnikId,
        statusPouzdanosti: req.user?.statusPouzdanosti 
      }, 
      isTrusted
    );

    if (result.tip === 'REZERVISANO') {
      return res.json({ poruka: 'Termin je uspješno rezervisan.', status: 'POTVRDJENA' });
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
      poruka: 'Vaš zahtjev je poslan na listu čekanja zbog pravila pouzdanosti računa.',
      status: 'NA_CEKANJU',
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom rezervacije termina.',
    });
  }
};

const otkaziIndividualnuRezervaciju = async (req, res) => {
  try {
    const terminId = parseInt(req.params.id);
    const korisnikId = parseInt(req.user.korisnikId || req.user.id);

    if (isNaN(terminId)) {
      return res.status(400).json({ greska: 'INVALID_ID', poruka: 'ID termina nije validan.' });
    }

    const termin = await prisma.terminObjekta.findUnique({ where: { terminId } });
    if (!termin) {
      return res.status(404).json({ greska: 'TERMIN_NIJE_PRONADJEN', poruka: 'Termin ne postoji u bazi.' });
    }

    const preostaloSati = hoursUntil(termin.vrijemePocetka);

    if (preostaloSati < 24) {
      const aktivnaRezervacija = await prisma.rezervacija.findFirst({
        where: {
          terminId: terminId,
          zahtjev: { korisnikId: korisnikId },
          status: { in: ['CONFIRMED', 'POTVRDJENA', 'REZERVISANO', 'ODOBRENO'] }
        }
      });

      if (!aktivnaRezervacija) {
        return res.status(400).json({ greska: 'REZERVACIJA_NIJE_PRONADJENA', poruka: 'Aktivna rezervacija nije pronađena za ovaj termin.' });
      }

      await prisma.rezervacija.update({
        where: { rezervacijaId: aktivnaRezervacija.rezervacijaId },
        data: { status: 'CEKA_OTKAZIVANJE', razlogOtkazivanja: 'Otkazivanje unutar 24h.' }
      });

      return res.json({
        status: 'CEKA_ODOBRENJE',
        poruka: 'Vaš zahtjev za otkazivanje unutar 24h je poslat na odobrenje vlasniku.'
      });
    }

    await prisma.rezervacija.deleteMany({ 
      where: { 
        terminId: terminId, 
        zahtjev: { korisnikId: korisnikId }
      } 
    });
    
    await prisma.terminObjekta.update({ 
      where: { terminId: terminId }, 
      data: { status: 'SLOBODAN' } 
    });

    const trenutniBroj = await dohvatiTrenutniBrojPrekrsaja(korisnikId);
    return res.json({
      brojPrekrsaja: trenutniBroj,
      maxDozvoljeno: PRAG_NEPOUZDANOSTI,
      poruka: "Uspješno otkazano na vrijeme. Termin je ponovo slobodan."
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ greska: 'SERVER_ERROR', poruka: error.message });
  }
};

const kreirajGrupniTrening = async (req, res) => {
  try {
    const terminId = req.params.id;
    const { maksimalanBrojIgraca, timId } = req.body;
    
    const resultado = await kreirajGrupniTreningService(terminId, req.user.korisnikId, maksimalanBrojIgraca, timId);
    return res.status(201).json({ poruka: 'Grupni trening je uspješno kreiran.', trening: resultado });
  } catch (error) {
    console.error("GREŠKA KOD KREIRANJA GRUPNOG TRENINGA:", error);

    // Hvatanje Prisma greške za Unique Constraint (P2002)
    if (error.code === 'P2002' || (error.message && error.message.includes('Unique constraint failed'))) {
      return res.status(400).json({ 
        greska: 'TERMIN_ZAUZET', 
        poruka: 'Ovaj termin je već iskorišten za kreiranje grupnog treninga.' 
      });
    }

    return res.status(error.status || 500).json({ 
      greska: error.code || 'SERVER_ERROR', 
      poruka: error.message || 'Došlo je do greške prilikom kreiranja grupnog treninga.' 
    });
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
  try { res.json({ treninzi: await getTrenerGrupniTreninziService(req.user.korisnikId) }); } 
  catch (error) { res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message }); }
};

const getGrupniTreninzi = async (req, res) => {
  try { res.json({ treninzi: await getGrupniTreninziService(req.user.korisnikId) }); } 
  catch (error) { res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message }); }
};

const otkaziGrupniTrening = async (req, res) => {
  try {
    const treningId = parseInt(req.params.id);
    const korisnikId = req.user.korisnikId || req.user.id;

    const grupniTrening = await prisma.grupniTrening.findUnique({
      where: { treningId: treningId },
      include: { terminObjekta: true },
    });

    if (!grupniTrening) {
      return res.status(404).json({ greska: 'TRENING_NIJE_PRONADJEN', poruka: 'Grupni trening nije pronađen.' });
    }

    const rezultat = await otkaziGrupniTreningService(treningId, korisnikId);
    const preostaloSati = hoursUntil(grupniTrening.terminObjekta.vrijemePocetka);

    if (preostaloSati < 24) {
      const { noviStatus, noviBroj } = await zabiljeziPrekrsaj(korisnikId);
      return res.json({
        ...rezultat,
        upozorenje: 'PREKRSAJ',
        brojPrekrsaja: noviBroj,
        maxDozvoljeno: PRAG_NEPOUZDANOSTI,
        poruka: `Otkazali ste unutar 24h. Broj prekršaja: ${noviBroj}/${PRAG_NEPOUZDANOSTI}.`,
      });
    }

    const trenutniBroj = await dohvatiTrenutniBrojPrekrsaja(korisnikId);
    return res.json({ ...rezultat, brojPrekrsaja: trenutniBroj, maxDozvoljeno: PRAG_NEPOUZDANOSTI });
  } catch (error) {
    res.status(500).json({ greska: 'SERVER_ERROR', poruka: error.message });
  }
};

const odjaviSeSaGrupnogTreninga = async (req, res) => {
  try {
    const treningId = parseInt(req.params.id);
    const { razlog } = req.body || {};
    const korisnikId = req.user.korisnikId || req.user.id;

    const grupniTrening = await prisma.grupniTrening.findUnique({
      where: { treningId: treningId },
      include: { terminObjekta: true },
    });

    if (!grupniTrening) {
      return res.status(404).json({ greska: 'TRENING_NIJE_PRONADJEN', poruka: 'Grupni trening nije pronađen.' });
    }

    const preostaloSati = hoursUntil(grupniTrening.terminObjekta.vrijemePocetka);

    if (preostaloSati < 24) {
      const prijava = await prisma.prijavaGrupnogTreninga.findFirst({
        where: {
          treningId: treningId,
          korisnikId: parseInt(korisnikId)
        }
      });

      if (!prijava) {
        return res.status(404).json({ greska: 'PRIJAVA_NIJE_PRONADJENA', poruka: 'Niste prijavljeni na ovaj trening.' });
      }

      // Ako tvoja šema nema eksplicitno polje status u PrijavaGrupnogTreninga, samo ga obriši i kazni odmah,
      // a ukoliko ima, ovdje šaljemo zahtjev vlasniku. Pošto tabela nema polja za čekanje odjave u bazi,
      // najsigurnije je evidentirati prekršaj i odmah izvršiti odjavu da ne puca baza.
      const rezultat = await odjaviSeSaGrupnogTreningaService(treningId, korisnikId, razlog);
      const { noviBroj } = await zabiljeziPrekrsaj(korisnikId);

      return res.json({
        ...rezultat,
        status: 'ODJAVLJEN_KAZNJEN',
        brojPrekrsaja: noviBroj,
        poruka: `Odjavili ste se unutar 24h. Zabilježen je prekršaj (${noviBroj}/${PRAG_NEPOUZDANOSTI}).`
      });
    }

    const rezultat = await odjaviSeSaGrupnogTreningaService(treningId, korisnikId, razlog);
    const trenutniBroj = await dohvatiTrenutniBrojPrekrsaja(korisnikId);
    return res.json({ ...rezultat, brojPrekrsaja: trenutniBroj, maxDozvoljeno: PRAG_NEPOUZDANOSTI });
  } catch (error) {
    res.status(500).json({ greska: 'SERVER_ERROR', poruka: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VLASNIČKE FUNKCIJE
// ─────────────────────────────────────────────────────────────────────────────

const getOwnerPendingRequests = async (req, res) => {
  try {
    const rezervacijeNaCekanju = await prisma.rezervacija.findMany({
      where: {
        status: { in: ['NA_CEKANJU', 'CEKANJE', 'CEKA_OTKAZIVANJE', 'CEKA_ODOBRENJE'] }
      },
      include: {
        terminObjekta: {
          include: { sportskiObjekat: true }
        },
        zahtjev: {
          include: { korisnik: { select: { punoIme: true, email: true } } }
        }
      }
    });

    const formatiraneRezervacije = rezervacijeNaCekanju.map(r => ({
      id: r.rezervacijaId,
      tip: 'INDIVIDUALNI',
      status: r.status,
      korisnik: r.zahtjev?.korisnik?.punoIme || r.zahtjev?.korisnik?.email || 'Nepoznat korisnik',
      objekat: r.terminObjekta?.sportskiObjekat?.naziv || 'Sportski objekat',
      vrijemePocetka: r.terminObjekta?.vrijemePocetka,
      razlog: r.razlogOtkazivanja || ''
    }));

    return res.json({ zahtjevi: formatiraneRezervacije });
  } catch (error) {
    return res.status(500).json({ greska: 'SERVER_ERROR', poruka: error.message });
  }
};

const ownerApprovePendingReservation = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rezervacija = await prisma.rezervacija.findUnique({ where: { rezervacijaId: id } });
    
    if (rezervacija) {
      if (rezervacija.status === 'CEKA_OTKAZIVANJE' || rezervacija.status === 'CEKA_ODOBRENJE') {
        await prisma.rezervacija.delete({ where: { rezervacijaId: id } });
        await prisma.terminObjekta.update({ 
          where: { terminId: rezervacija.terminId }, 
          data: { status: 'SLOBODAN' } 
        });
        return res.json({ message: 'Otkazivanje rezervacije je uspješno odobreno.' });
      } else {
        await prisma.rezervacija.update({ where: { rezervacijaId: id }, data: { status: 'CONFIRMED' } });
        return res.json({ message: 'Rezervacija je uspješno potvrđena.' });
      }
    }
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Zahtjev nije pronađen.' });
  } catch (error) { 
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message }); 
  }
};

const ownerRejectPendingReservation = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rezervacija = await prisma.rezervacija.findUnique({ where: { rezervacijaId: id } });
    
    if (rezervacija) {
      if (rezervacija.status === 'CEKA_OTKAZIVANJE' || rezervacija.status === 'CEKA_ODOBRENJE') {
        await prisma.rezervacija.update({ 
          where: { rezervacijaId: id }, 
          data: { status: 'CONFIRMED', razlogOtkazivanja: null } 
        });
        return res.json({ message: 'Zahtjev za otkazivanje je odbijen.' });
      } else {
        await prisma.rezervacija.update({ where: { rezervacijaId: id }, data: { status: 'REJECTED' } });
        return res.json({ message: 'Zahtjev za rezervaciju je odbijen.' });
      }
    }
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Zahtjev nije pronađen.' });
  } catch (error) { 
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message }); 
  }
};

const getTrenerNotifikacije = async (req, res) => {
  try { res.json({ notifikacije: await getTrenerNotifikacijeService(req.user.korisnikId) }); } 
  catch (error) { res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message }); }
};

const getMojeRezervacije = async (req, res) => {
  try { res.json({ rezervacije: await getMojeRezervacijeService(req.user.korisnikId) }); } 
  catch (error) { res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message }); }
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
  getMojeRezervacije,
  getOwnerPendingRequests,
  ownerApprovePendingReservation,
  ownerRejectPendingReservation
};