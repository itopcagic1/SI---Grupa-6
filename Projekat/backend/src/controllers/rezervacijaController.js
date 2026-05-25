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

// Sigurna funkcija za računanje preostalih sati
function hoursUntil(dateTime) {
  if (!dateTime) return 999; 

  const sad = new Date();
  const pocetakTermina = new Date(dateTime);

  const utcSad = Date.UTC(sad.getUTCFullYear(), sad.getUTCMonth(), sad.getUTCDate(), sad.getUTCHours(), sad.getUTCMinutes(), sad.getUTCSeconds());
  const utcPocetak = Date.UTC(pocetakTermina.getUTCFullYear(), pocetakTermina.getUTCMonth(), pocetakTermina.getUTCDate(), pocetakTermina.getUTCHours(), pocetakTermina.getUTCMinutes(), pocetakTermina.getUTCSeconds());

  const razlikaUms = utcPocetak - utcSad;
  const preostaloSati = razlikaUms / (1000 * 60 * 60);

  const razlikaUDanima = Math.ceil(razlikaUms / (1000 * 60 * 60 * 24));

  console.log(`\n🕵️‍♂️ [DEBUG KAZNA]`);
  console.log(`Poračunato sati do treninga: ${preostaloSati}`);
  console.log(`Kalendarska razlika u danima: ${razlikaUDanima}`);
  console.log(`Da li se kažnjava? (sati < 24 ili dani <= 1): ${preostaloSati < 24 || razlikaUDanima <= 1}\n`);

  if (preostaloSati < 24 || razlikaUDanima <= 1) {
    return 0; 
  }

  return preostaloSati;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Inkrementiraj prekršaj i vrati trenutno stanje
// ─────────────────────────────────────────────────────────────────────────────
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

  console.log(`\n🚨 [KAZNA] Korisnik ${kId} -> Prekršaj #${noviBroj}/3, Status: ${noviStatus}\n`);

  return { noviStatus, noviBroj };
}

async function dohvatiTrenutniBrojPrekrsaja(korisnikId) {
  const korisnik = await prisma.korisnik.findUnique({
    where: { korisnikId: parseInt(korisnikId) }, 
    select: { brojPreksrenihRezervacija: true }
  });
  return korisnik?.brojPreksrenihRezervacija || 0;
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
// IGRAC: Otkazivanje individualnog termina -> IDE NA ČEKANJE AKO JE < 24h
// ─────────────────────────────────────────────────────────────────────────────
const otkaziIndividualnuRezervaciju = async (req, res) => {
  try {
    const terminId = parseInt(req.params.id);
    const korisnikId = req.user.korisnikId || req.user.id;

    const termin = await prisma.terminObjekta.findUnique({ 
      where: { terminId },
      include: { rezervacije: true }
    });
    
    if (!termin) {
      return res.status(404).json({ greska: 'TERMIN_NIJE_PRONADJEN', poruka: 'Termin nije pronađen.' });
    }

    const preostaloSati = hoursUntil(termin.vrijemePocetka);

    if (preostaloSati < 24) {
     const aktivnaRezervacija = await prisma.rezervacija.findFirst({
  where: {
    terminId: terminId,
    zahtjev: {
      korisnikId: parseInt(korisnikId)
    },
    status: { in: ['CONFIRMED', 'POTVRDJENA'] }
  }
});

      if (!aktivnaRezervacija) {
        return res.status(400).json({ greska: 'REZERVACIJA_NIJE_PRONADJENA', poruka: 'Nije pronađena aktivna rezervacija za ovaj termin.' });
      }

      await prisma.rezervacija.update({
        where: { rezervacijaId: aktivnaRezervacija.rezervacijaId },
        data: { status: 'CEKA_OTKAZIVANJE', razlogOtkazivanja: 'Korisnik želi otkazati unutar 24h' }
      });

      return res.json({
        status: 'CEKA_ODOBRENJE',
        poruka: 'Vaš zahtjev za otkazivanje unutar 24h je poslat na čekanje vlasniku. Dok vlasnik ne odobri, termin je i dalje Vaš.'
      });
    }

    const rezultat = await cancelIndividualReservationService(terminId, korisnikId);
    const trenutniBroj = await dohvatiTrenutniBrojPrekrsaja(korisnikId);
    return res.json({
      ...rezultat,
      brojPrekrsaja: trenutniBroj,
      maxDozvoljeno: PRAG_NEPOUZDANOSTI,
      poruka: "Uspješno otkazano na vrijeme. Nemate prekršaj za ovo otkazivanje."
    });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom otkazivanja rezervacije.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GRUPNI TRENINZI (Kreiranje i Prijava)
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
  try { res.json({ treninzi: await getTrenerGrupniTreninziService(req.user.korisnikId) }); } 
  catch (error) { res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message }); }
};

const getGrupniTreninzi = async (req, res) => {
  try { res.json({ treninzi: await getGrupniTreninziService(req.user.korisnikId) }); } 
  catch (error) { res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message }); }
};

// ─────────────────────────────────────────────────────────────────────────────
// TRENER: Otkazivanje grupnog treninga -> IDE NA ČEKANJE AKO JE < 24h
// ─────────────────────────────────────────────────────────────────────────────
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

    const preostaloSati = hoursUntil(grupniTrening.terminObjekta.vrijemePocetka);

    if (preostaloSati < 24) {
      if (req.user?.statusPouzdanosti === 'NEPOUZDAN') {
        return res.status(403).json({
          greska: 'ZABRANJENO_OTKAZIVANJE',
          poruka: 'Vaš nalog je označen kao NEPOUZDAN. Nemate pravo otkazivanja treninga unutar 24h.'
        });
      }

      await prisma.grupniTrening.update({
        where: { treningId: treningId },
        data: { status: 'CEKA_OTKAZIVANJE', razlogOtkazivanja: 'Trener želi otkazati unutar 24h' }
      });

      return res.json({
        status: 'CEKA_ODOBRENJE',
        poruka: 'Vaš zahtjev za otkazivanje grupnog treninga unutar 24h je poslat vlasniku na odobrenje. Trening je aktivan dok se ne odobri.'
      });
    }

    const rezultat = await otkaziGrupniTreningService(treningId, korisnikId);
    const trenutniBroj = await dohvatiTrenutniBrojPrekrsaja(korisnikId);
    
    return res.json({ 
      ...rezultat, 
      brojPrekrsaja: trenutniBroj, 
      maxDozvoljeno: PRAG_NEPOUZDANOSTI,
      poruka: "Uspješno otkazan grupni trening."
    });
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// IGRAC: Odjava sa grupnog treninga -> IDE NA ČEKANJE AKO JE < 24h
// ─────────────────────────────────────────────────────────────────────────────
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
      const prijava = await prisma.prijavaNaTrening.findFirst({
        where: {
          treningId: treningId,
          korisnikId: parseInt(korisnikId)
        }
      });

      if (!prijava) {
        return res.status(404).json({ greska: 'PRIJAVA_NIJE_PRONADJENA', poruka: 'Niste prijavljeni na ovaj grupni trening.' });
      }

      await prisma.prijavaNaTrening.update({
        where: { prijavaId: prijava.prijavaId },
        data: { status: 'CEKA_ODJAVU', razlogOdjave: razlog || 'Nije naveden razlog' }
      });

      return res.json({
        status: 'CEKA_ODOBRENJE',
        poruka: 'Vaš zahtjev za odjavu sa grupnog treninga unutar 24h poslat je vlasniku na odobrenje.'
      });
    }

    const rezultat = await odjaviSeSaGrupnogTreningaService(treningId, korisnikId, razlog);
    const trenutniBroj = await dohvatiTrenutniBrojPrekrsaja(korisnikId);
    return res.json({ 
      ...rezultat, 
      brojPrekrsaja: trenutniBroj, 
      maxDozvoljeno: PRAG_NEPOUZDANOSTI,
      poruka: "Uspješno ste se odjavili sa grupnog treninga na vrijeme."
    });
  } catch (error) {
    res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VLASNICKE FUNKCIJE
// ─────────────────────────────────────────────────────────────────────────────
const ownerCancelReservation = async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    const { reason } = req.body;
    if (!reason || reason.trim() === '') return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Razlog otkazivanja je obavezan.' });

    const reservation = await prisma.rezervacija.findUnique({ where: { rezervacijaId: reservationId }, include: { terminObjekta: true } });
    if (!reservation) return res.status(404).json({ error: 'NOT_FOUND', message: 'Rezervacija nije pronađena.' });
    if (reservation.status !== 'CONFIRMED' && reservation.status !== 'POTVRDJENA') return res.status(400).json({ error: 'BAD_REQUEST', message: 'Samo potvrđene rezervacije se mogu otkazati.' });
    if (hoursUntil(reservation.terminObjekta.vrijemePocetka) < 24) return res.status(403).json({ error: 'FORBIDDEN', message: 'Otkazivanje mora biti bar 24h ranije.' });

    await prisma.rezervacija.update({ where: { rezervacijaId: reservationId }, data: { status: 'CANCELLED', razlogOtkazivanja: reason } });
    return res.json({ message: 'Rezervacija uspješno otkazana od strane vlasnika.' });
  } catch (error) { res.status(500).json({ error: 'SERVER_ERROR', message: error.message }); }
};

const ownerApprovePendingReservation = async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    await prisma.rezervacija.update({ where: { rezervacijaId: reservationId }, data: { status: 'CONFIRMED' } });
    return res.json({ message: 'Zahtjev odobren.' });
  } catch (error) { res.status(500).json({ error: 'SERVER_ERROR', message: error.message }); }
};

const ownerRejectPendingReservation = async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    const reservation = await prisma.rezervacija.findUnique({ where: { rezervacijaId: reservationId } });
    if (reservation) await prisma.rezervacija.update({ where: { rezervacijaId: reservationId }, data: { status: 'REJECTED' } });
    return res.json({ message: 'Zahtjev odbijen.' });
  } catch (error) { res.status(500).json({ error: 'SERVER_ERROR', message: error.message }); }
};

const getTrenerNotifikacije = async (req, res) => {
  try { res.json({ notifikacije: await getTrenerNotifikacijeService(req.user.korisnikId) }); } 
  catch (error) { res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message }); }
};

const getMojeRezervacije = async (req, res) => {
  try { res.json({ rezervacije: await getMojeRezervacijeService(req.user.korisnikId) }); } 
  catch (error) { res.status(error.status || 500).json({ greska: error.code || 'SERVER_ERROR', poruka: error.message }); }
};

// VLASNIK: Odobrava otkazivanje unutar 24h (Korisnik dobija kaznu, termin se oslobađa)
const ownerApproveCancellationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ include zahtjev da dobiješ korisnikId
    const rezervacija = await prisma.rezervacija.findUnique({
      where: { rezervacijaId: parseInt(id) },
      include: { zahtjev: true }  // ← DODAJ OVO
    });

    if (!rezervacija) return res.status(404).json({ message: 'Zahtjev nije pronađen.' });

    await prisma.rezervacija.update({
      where: { rezervacijaId: rezervacija.rezervacijaId },
      data: { status: 'CANCELLED' }
    });

    await prisma.terminObjekta.update({
      where: { terminId: rezervacija.terminId },
      data: { status: 'SLOBODAN' }
    });

    // ✅ korisnikId dolazi iz zahtjev relacije
    const { noviStatus, noviBroj } = await zabiljeziPrekrsaj(rezervacija.zahtjev.korisnikId);

    return res.json({ message: `Otkazivanje odobreno. Korisniku dodijeljen prekršaj (${noviBroj}/3).` });
  } catch (error) {
    console.error('❌ ownerApproveCancellationRequest:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// VLASNIK: SVI zahtjevi na čekanju (Sada skuplja i Individualne, i Grupne, i Prijave)
// ─────────────────────────────────────────────────────────────────────────────
const getOwnerPendingRequests = async (req, res) => {
  try {
    // 1. Individualne rezervacije na čekanju i otkazivanja
    const individualne = await prisma.rezervacija.findMany({
      where: { status: { in: ['NA_CEKANJU', 'CEKA_OTKAZIVANJE'] } },
      include: { korisnik: true, terminObjekta: true },
    });

    // 2. Grupni treninzi koje trener želi otkazati unutar 24h
    const grupniTreninzi = await prisma.grupniTrening.findMany({
      where: { status: 'CEKA_OTKAZIVANJE' },
      include: { terminObjekta: true, trener: true }
    });

    // 3. Prijave igrača koji se žele odjaviti sa grupnih treninga unutar 24h
    const prijaveGrupne = await prisma.prijavaNaTrening.findMany({
      where: { status: 'CEKA_ODJAVU' },
      include: { korisnik: true, grupniTrening: { include: { terminObjekta: true } } }
    });

    // Mapiramo i ujedinjujemo sve u jedinstvenu listu prilagođenu za prikaz na ekranu vlasnika
    const sviZahtjevi = [
      ...individualne.map(r => ({
        id: r.rezervacijaId,
        tip: 'INDIVIDUALNA',
        status: r.status,
        korisnik: `${r.korisnik?.ime || ''} ${r.korisnik?.prezime || ''}`,
        detalji: r.terminObjekta?.naziv || 'Individualni termin',
        vrijeme: r.terminObjekta?.vrijemePocetka,
        razlog: r.razlogOtkazivanja || 'Zahtjev za obradu'
      })),
      ...grupniTreninzi.map(gt => ({
        id: gt.treningId,
        tip: 'GRUPNI_TRENING_OTKAZIVANJE',
        status: gt.status,
        korisnik: `Trener: ${gt.trener?.ime || ''} ${gt.trener?.prezime || 'Trener'}`,
        detalji: `Otkazivanje grupnog treninga - ${gt.terminObjekta?.naziv || ''}`,
        vrijeme: gt.terminObjekta?.vrijemePocetka,
        razlog: gt.razlogOtkazivanja || 'Trener otkazuje unutar 24h'
      })),
      ...prijaveGrupne.map(p => ({
        id: p.prijavaId,
        tip: 'GRUPNA_PRIJAVA_ODJAVA',
        status: p.status,
        korisnik: `${p.korisnik?.ime || ''} ${p.korisnik?.prezime || ''}`,
        detalji: `Odjava sa grupnog treninga - ${p.grupniTrening?.terminObjekta?.naziv || ''}`,
        vrijeme: p.grupniTrening?.terminObjekta?.vrijemePocetka,
        razlog: p.razlogOdjave || 'Igrač se odjavljuje unutar 24h'
      }))
    ];

    // Sortiramo po datumu/vremenu tako da najnovije akcije idu na vrh
    sviZahtjevi.sort((a, b) => new Date(b.vrijeme) - new Date(a.vrijeme));

    return res.json({ zahtjevi: sviZahtjevi });
  } catch (error) {
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

// VLASNIK: Odbija otkazivanje unutar 24h (Termin ostaje potvrđen, nema kazne ali korisnik mora doći)
const ownerRejectCancellationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const rezervacija = await prisma.rezervacija.findUnique({ where: { rezervacijaId: parseInt(id) } });

    if (!rezervacija) return res.status(404).json({ message: 'Zahtjev nije pronađen.' });

    await prisma.rezervacija.update({
      where: { rezervacijaId: rezervacija.rezervacijaId },
      data: { status: 'CONFIRMED' }
    });

    return res.json({ message: 'Zahtjev za otkazivanje odbijen. Termin ostaje rezervisan.' });
  } catch (error) {
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
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
  ownerApproveCancellationRequest,
  ownerRejectCancellationRequest,
  getOwnerPendingRequests
};