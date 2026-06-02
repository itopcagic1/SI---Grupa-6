const {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
  cancelPendingIndividualRequestService,
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
  const noviStatus = noviBroj >= PRAG_NEPOUZDANOSTI ? 'NEPOUZDAN' : ('AKTIVAN');

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

    const korisnikIzBaze = await prisma.korisnik.findUnique({
      where: { korisnikId: korisnikId },
      select: { statusPouzdanosti: true }
    });

    const isTrusted = korisnikIzBaze?.statusPouzdanosti !== 'NEPOUZDAN';

    const result = await createIndividualReservationService(
      termId,
      {
        id: korisnikId,
        korisnikId: korisnikId,
        statusPouzdanosti: korisnikIzBaze?.statusPouzdanosti
      },
      isTrusted
    );

    // Ako je korisnik pouzdan i termin je odmah potvrđen
    if (result.tip === 'REZERVISANO') {
      return res.status(200).json({
        poruka: 'Termin je uspješno rezervisan.',
        status: 'POTVRDJENA'
      });
    }

    // Ako korisnik ima 3 ili više prekršaja, ide u Bull queue i na čekanje
    const reservationId = result.zahtjev?.zahtjevId;
    const termStartTime = result.termin?.vrijemePocetka;
    const delayMilliseconds = calculateTimeoutMilliseconds(termStartTime);

    reservationQueue.add(
      'check-reservation-timeout',
      { reservationId, termId },
      { delay: delayMilliseconds }
    ).catch((queueError) => {
      console.error('Greska pri zakazivanju provjere pending rezervacije:', queueError);
    });

    return res.status(202).json({
      poruka: 'Vaš zahtjev je poslan na listu čekanja zbog pravila pouzdanosti računa (3 ili više kaznena profila). Vlasnik objekta mora ručno odobriti termin.',
      status: 'NA_CEKANJU',
      zahtjevId: reservationId,
      terminId: termId,
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

    await cancelIndividualReservationService(terminId, korisnikId);

    if (preostaloSati < 24) {
      const { noviBroj } = await zabiljeziPrekrsaj(korisnikId);
      return res.json({
        upozorenje: 'PREKRSAJ',
        brojPrekrsaja: noviBroj,
        maxDozvoljeno: PRAG_NEPOUZDANOSTI,
        poruka: `Otkazali ste unutar 24h. Broj prekršaja: ${noviBroj}/${PRAG_NEPOUZDANOSTI}.`
      });
    }

    const trenutniBroj = await dohvatiTrenutniBrojPrekrsaja(korisnikId);
    return res.json({
      brojPrekrsaja: trenutniBroj,
      maxDozvoljeno: PRAG_NEPOUZDANOSTI,
      poruka: 'Uspješno otkazano na vrijeme. Termin je ponovo slobodan.'
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

const otkaziZahtjevZaIndividualnuRezervaciju = async (req, res) => {
  try {
    const zahtjevId = parseInt(req.params.id);
    const korisnikId = parseInt(req.user.korisnikId || req.user.id);

    if (isNaN(zahtjevId)) {
      return res.status(400).json({ greska: 'INVALID_ID', poruka: 'ID zahtjeva nije validan.' });
    }

    const rezultat = await cancelPendingIndividualRequestService(zahtjevId, korisnikId);
    return res.json(rezultat);
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
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
    const idParam = String(req.params.id);
    const korisnikId = req.user.korisnikId || req.user.id;

    // SLUČAJ A: Ako frontend šalje ID zahtjeva sa prefiksom 'zahtjev-'
    if (idParam.startsWith('zahtjev-')) {
      const zahtjevId = parseInt(idParam.split('-')[1], 10);

      if (isNaN(zahtjevId)) {
        return res.status(400).json({ greska: 'INVALID_ID', poruka: 'ID zahtjeva nije ispravan.' });
      }

      // Pronađi zahtjev u bazi
      const zahtjev = await prisma.zahtjevZaRezervaciju.findUnique({
        where: { zahtjevId: zahtjevId }
      });

      if (!zahtjev) {
        return res.status(404).json({ greska: 'ZAHTJEV_NIJE_PRONADJEN', poruka: 'Zahtjev nije pronađen.' });
      }
      await prisma.$transaction([
        prisma.terminObjekta.update({
          where: { terminId: zahtjev.terminId },
          data: { status: 'SLOBODAN' }
        }),
        prisma.zahtjevZaRezervaciju.update({
          where: { zahtjevId: zahtjevId },
          data: { status: 'ODBIJENO', datumObrade: new Date() }
        })
      ]);

      return res.json({ message: 'Zahtjev za grupni trening je uspješno povučen.' });
    }

    // SLUČAJ B: Standardno otkazivanje potvrđenog treninga preko brojčanog ID-ja
    const treningId = parseInt(idParam, 10);

    if (isNaN(treningId)) {
      return res.status(400).json({ greska: 'INVALID_ID', poruka: 'ID treninga nije validan broj.' });
    }

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
      const { noviBroj } = await zabiljeziPrekrsaj(korisnikId);
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
    console.error("Greška pri otkazivanju grupnog treninga:", error);
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

const getOwnerPendingRequests = async (req, res) => {
  try {
    const zahtjeviNaCekanju = await prisma.zahtjevZaRezervaciju.findMany({
      where: {
        status: { in: ['NA_CEKANJU', 'CEKANJE'] },
        terminObjekta: {
          sportskiObjekat: {
            vlasnikId: req.user.korisnikId,
          },
        },
      },
      include: {
        terminObjekta: {
          include: { sportskiObjekat: true },
        },
        korisnik: {
          select: { punoIme: true, email: true, uloga: true },
        },
      },
    });

    const formatiraniZahtjevi = zahtjeviNaCekanju.map((z) => {
     const jeGrupni = z.terminObjekta?.tipTermina === 'GRUPNI' || z.korisnik?.uloga === 'TRENER';
      return {
        id: z.zahtjevId,
        tip: jeGrupni ? 'GRUPNI' : 'INDIVIDUALNI',
        status: z.status,
        korisnik: z.korisnik?.punoIme || z.korisnik?.email || 'Nepoznat korisnik',
        objekat: z.terminObjekta?.sportskiObjekat?.naziv || 'Sportski objekat',
        vrijemePocetka: z.terminObjekta?.vrijemePocetka,
        razlog: '',
        // Šaljemo i maksimalanBrojIgraca ako postoji na zahtjevu (za grupne)
        maksimalanBrojIgraca: z.maksimalanBrojIgraca || null,
      };
    });

    return res.json({ zahtjevi: formatiraniZahtjevi });
  } catch (error) {
    return res.status(500).json({ greska: 'SERVER_ERROR', poruka: error.message });
  }
};

const ownerApprovePendingReservation = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
  const zahtjev = await prisma.zahtjevZaRezervaciju.findUnique({ where: { zahtjevId: id } });

    if (!zahtjev) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Zahtjev nije pronađen.' });
    }
 const terminInfo = await prisma.terminObjekta.findUnique({
      where: { terminId: zahtjev.terminId },
      select: { tipTermina: true },
    });
    const korisnikInfo = await prisma.korisnik.findUnique({
      where: { korisnikId: zahtjev.korisnikId },
      select: { uloga: true },
    });
    const jeGrupniZahtjev = terminInfo?.tipTermina === 'GRUPNI' || korisnikInfo?.uloga === 'TRENER';

    await prisma.$transaction(async (tx) => {
      // 1. Ažuriraj zahtjev na ODOBRENO
      await tx.zahtjevZaRezervaciju.update({
        where: { zahtjevId: id },
        data: { status: 'ODOBRENO', datumObrade: new Date() },
      });

     
      await tx.rezervacija.create({
        data: {
          zahtjevId: id,
          terminId: zahtjev.terminId,
          status: 'POTVRDJENA',
          datumPotvrde: new Date(),
        },
      });

      if (jeGrupniZahtjev) {
          await tx.terminObjekta.update({
          where: { terminId: zahtjev.terminId },
          data: { status: 'ZAUZET', tipTermina: 'GRUPNI' },
        });
      } else {
        await tx.terminObjekta.update({
          where: { terminId: zahtjev.terminId },
          data: { status: 'ZAUZET' },
        });
      }
    });

    return res.json({ message: jeGrupniZahtjev ? 'Grupni trening je uspješno odobren.' : 'Rezervacija je uspješno potvrđena.' });
  } catch (error) {
    return res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

const ownerRejectPendingReservation = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const zahtjev = await prisma.zahtjevZaRezervaciju.findUnique({ where: { zahtjevId: id } });

    if (!zahtjev) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Zahtjev nije pronađen.' });
    }

    await prisma.zahtjevZaRezervaciju.update({
      where: { zahtjevId: id },
      data: { status: 'ODBIJENO', datumObrade: new Date() },
    });

    return res.json({ message: 'Zahtjev za rezervaciju je odbijen.' });
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
  otkaziZahtjevZaIndividualnuRezervaciju,
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
