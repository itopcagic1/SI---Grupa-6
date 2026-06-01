const prisma = require('../config/db');
const { notifyTerminOslobodjen } = require('./listaCekanjaNotifier');

const SLOBODAN = 'SLOBODAN';
const REZERVISAN = 'ZAUZET';

function parsePositiveId(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} mora biti pozitivan cijeli broj.`);
    error.status = 400;
    error.code = 'NEVALIDAN_ID';
    throw error;
  }
  return parsed;
}

function serviceError(message, status = 400, code = 'NEOVLASTEN') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}


const getAllTermsService = async (korisnikId) => {
  const now = new Date();

  const [mojRezervacije, mojeStavkeListeCekanja] = await Promise.all([
    prisma.rezervacija.findMany({
      where: {
        zahtjev: { korisnikId },
        status: 'POTVRDJENA',
      },
      select: { terminId: true },
    }),
    prisma.stavkaListeCekanja?.findMany
      ? prisma.stavkaListeCekanja.findMany({
        where: {
          zahtjev: { korisnikId },
          OR: [
            { statusStavke: null },
            { statusStavke: 'AKTIVNA' },
            { statusStavke: 'ACTIVE' },
          ],
        },
        select: {
          zahtjev: {
            select: { terminId: true },
          },
        },
      })
      : Promise.resolve([]),
  ]);

  const mojiTerminIdsArray = mojRezervacije.map((r) => r.terminId);
  const termini = await prisma.terminObjekta.findMany({
    where: {
      vrijemePocetka: { gt: now },
      OR: [
        { status: SLOBODAN },
        { status: REZERVISAN },
        {
          status: REZERVISAN,
          terminId: { in: mojiTerminIdsArray },
        },
      ],
    },
    orderBy: { vrijemePocetka: 'asc' },
    include: {
      sportskiObjekat: {
        select: { objekatId: true, naziv: true, adresa: true, opis: true },
      },
    },
  });

  const mojiTerminIds = new Set(mojiTerminIdsArray);
  const terminiNaListiCekanja = new Set(
    mojeStavkeListeCekanja.map((stavka) => stavka.zahtjev.terminId)
  );

  return termini.map((termin) => ({
    ...termin,
    jeMojaRezervacija: mojiTerminIds.has(termin.terminId),
    naListiCekanja: terminiNaListiCekanja.has(termin.terminId),
  }));
};

const assertNotDuplicateReservation = async (terminId, korisnikId) => {
  const zahtjev = await prisma.zahtjevZaRezervaciju.findFirst({
    where: {
      korisnikId,
      terminId,
      status: { in: ['NA_CEKANJU', 'CEKANJE', 'ODOBRENO'] },
    },
  });

  if (zahtjev) {
    throw serviceError(
      'Već imate aktivan zahtjev ili rezervaciju za ovaj termin.',
      409,
      'DUPLI_TERMIN'
    );
  }
};

const createIndividualReservationService = async (terminIdValue, korisnik, isTrusted) => {
  const terminId = parsePositiveId(terminIdValue, 'terminId');

  const termin = await prisma.terminObjekta.findUnique({
    where: { terminId },
    include: {
      sportskiObjekat: { select: { objekatId: true, naziv: true } },
    },
  });

  if (
    !termin ||
    termin.status !== SLOBODAN ||
    new Date(termin.vrijemePocetka) <= new Date()
  ) {
    throw serviceError('Termin nije dostupan za rezervaciju.', 404, 'TERMIN_NIJE_DOSTUPAN');
  }

  await assertNotDuplicateReservation(terminId, korisnik.korisnikId);

  if (isTrusted) {
    const [zahtjev] = await prisma.$transaction(async (tx) => {
      const noviZahtjev = await tx.zahtjevZaRezervaciju.create({
        data: {
          terminId,
          korisnikId: korisnik.korisnikId,
          status: 'ODOBRENO',
          datumSlanja: new Date(),
          datumObrade: new Date(),
        },
      });

      await tx.rezervacija.create({
        data: {
          zahtjevId: noviZahtjev.zahtjevId,
          terminId,
          status: 'POTVRDJENA',
          datumPotvrde: new Date(),
        },
      });

      await tx.terminObjekta.update({
        where: { terminId },
        data: { status: REZERVISAN },
      });

      return [noviZahtjev];
    });

    return { tip: 'REZERVISANO', zahtjev, termin };
  }

  const zahtjev = await prisma.zahtjevZaRezervaciju.create({
    data: {
      terminId,
      korisnikId: korisnik.korisnikId,
      status: 'NA_CEKANJU',
      datumSlanja: new Date(),
    },
  });

  return { tip: 'NA_CEKANJU', zahtjev, termin };
};

const cancelIndividualReservationService = async (terminIdValue, korisnikId) => {
  const terminId = parsePositiveId(terminIdValue, 'terminId');

  const rezervacija = await prisma.rezervacija.findFirst({
    where: {
      terminId,
      status: 'POTVRDJENA',
      zahtjev: { korisnikId },
    },
    include: {
      zahtjev: true,
    },
  });

  if (!rezervacija) {
    throw serviceError(
      'Nemate aktivnu rezervaciju za ovaj termin.',
      404,
      'REZERVACIJA_NIJE_PRONADJENA'
    );
  }

  const termin = await prisma.terminObjekta.findUnique({
    where: { terminId },
  });

  if (!termin || new Date(termin.vrijemePocetka) <= new Date()) {
    throw serviceError(
      'Nije moguće otkazati termin koji je već počeo ili prošao.',
      400,
      'TERMIN_VEC_PROSAO'
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.rezervacija.update({
      where: { rezervacijaId: rezervacija.rezervacijaId },
      data: { status: 'OTKAZANA' },
    });

    await tx.zahtjevZaRezervaciju.update({
      where: { zahtjevId: rezervacija.zahtjevId },
      data: { status: 'OTKAZANO' },
    });

    await tx.terminObjekta.update({
      where: { terminId },
      data: { status: SLOBODAN },
    });
  });

  await notifyTerminOslobodjen(terminId);

  return { poruka: 'Rezervacija je uspješno otkazana.' };
};

// POPRAVLJENA I SIGURNA FUNKCIJA
const getMojeRezervacijeService = async (korisnikId) => {
  // Rješenje za Timezone: Gledamo od početka današnjeg dana (00:00) kako sustav ne bi sakrio današnje termine
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);

  // Provjeravamo ulogu korisnika (ako je TRENER, povući ćemo i njegove poslane grupne treninge koji čekaju)
  const korisnik = await prisma.korisnik.findUnique({ where: { korisnikId } });
  const isTrener = korisnik?.uloga === 'TRENER';

  const [potvrdjeneIndividualne, zahtjeviNaCekanju, grupnePrijave, trenerZahtjeviNaCekanju] = await Promise.all([
    // 1. Sve POTVRĐENE individualne rezervacije igrača
    prisma.rezervacija.findMany({
      where: {
        zahtjev: { korisnikId },
        status: 'POTVRDJENA',
        terminObjekta: { vrijemePocetka: { gte: danas } }
      },
      include: {
        terminObjekta: { include: { sportskiObjekat: true } }
      }
    }),

    // 2. Svi INDIVIDUALNI zahtjevi igrača koji su još na čekanju ('PENDING' ili 'NA_CEKANJU')
    prisma.zahtjevZaRezervaciju.findMany({
      where: {
        korisnikId,
        status: { in: ['NA_CEKANJU', 'CEKANJE', 'PENDING'] },
        terminObjekta: { vrijemePocetka: { gte: danas } }
      },
      include: {
        terminObjekta: { include: { sportskiObjekat: true } }
      }
    }),

    // 3. Grupni treninzi na koje se ulogirani igrač prijavio (Potvrđeni)
    prisma.prijavaGrupnogTreninga.findMany({
      where: { 
        korisnikId,
        grupniTrening: {
          terminObjekta: { vrijemePocetka: { gte: danas } }
        }
      },
      include: {
        grupniTrening: {
          include: {
            terminObjekta: { include: { sportskiObjekat: true } },
            trener: { select: { punoIme: true } },
          },
        },
      },
    }),

    // 4. Ako je korisnik TRENER -> povuci grupne treninge koje je pokrenuo, a vlasnik ih još nije odobrio
    isTrener ? prisma.zahtjevZaRezervaciju.findMany({
      where: {
        korisnikId,
        status: { in: ['NA_CEKANJU', 'CEKANJE', 'PENDING'] },
        terminObjekta: { vrijemePocetka: { gte: danas } }
      },
      include: {
        terminObjekta: { include: { sportskiObjekat: true } }
      }
    }) : []
  ]);

  // Spajamo sve u jedan unificirani niz za Frontend
  return [
    // Mapiranje potvrđenih individualnih rezervacija
    ...potvrdjeneIndividualne.map((r) => ({
      tip: 'INDIVIDUALNI',
      status: 'POTVRDJENA',
      datumKreiranja: r.datumPotvrde,
      vrijemePocetka: r.terminObjekta.vrijemePocetka,
      vrijemeZavrsetka: r.terminObjekta.vrijemeZavrsetka,
      objekat: r.terminObjekta.sportskiObjekat?.naziv || 'Sportski objekat',
      adresa: r.terminObjekta.sportskiObjekat?.adresa,
      terminId: r.terminId,
      rezervacijaId: r.rezervacijaId,
    })),

    // Mapiranje individualnih zahtjeva na čekanju
    ...zahtjeviNaCekanju.map((z) => ({
      tip: 'INDIVIDUALNI',
      status: 'NA_CEKANJU',
      datumKreiranja: z.datumSlanja,
      vrijemePocetka: z.terminObjekta.vrijemePocetka,
      vrijemeZavrsetka: z.terminObjekta.vrijemeZavrsetka,
      objekat: z.terminObjekta.sportskiObjekat?.naziv || 'Sportski objekat',
      adresa: z.terminObjekta.sportskiObjekat?.adresa,
      terminId: z.terminId,
      zahtjevId: z.zahtjevId,
    })),

    // Mapiranje grupnih treninga na kojima je igrač potvrđen
    ...grupnePrijave.map((p) => ({
      tip: 'GRUPNI',
      status: 'POTVRDJENA',
      naziv: p.grupniTrening.naziv || 'Grupni trening',
      datumKreiranja: p.datumPrijave,
      vrijemePocetka: p.grupniTrening.terminObjekta.vrijemePocetka,
      vrijemeZavrsetka: p.grupniTrening.terminObjekta.vrijemeZavrsetka,
      objekat: p.grupniTrening.terminObjekta.sportskiObjekat?.naziv || 'Sportski objekat',
      adresa: p.grupniTrening.terminObjekta.sportskiObjekat?.adresa,
      trener: p.grupniTrening.trener?.punoIme,
      terminId: p.grupniTrening.terminObjekta.terminId,
      treningId: p.grupniTrening.treningId,
    })),

    // Mapiranje grupnih treninga koje je kreirao TRENER, a još čekaju odobrenje vlasnika objekta
    ...trenerZahtjeviNaCekanju.map((z) => ({
      tip: 'GRUPNI',
      status: 'NA_CEKANJU',
      naziv: 'Kreiranje grupnog treninga (Čeka odobrenje)',
      datumKreiranja: z.datumSlanja,
      vrijemePocetka: z.terminObjekta.vrijemePocetka,
      vrijemeZavrsetka: z.terminObjekta.vrijemeZavrsetka,
      objekat: z.terminObjekta.sportskiObjekat?.naziv || 'Sportski objekat',
      adresa: z.terminObjekta.sportskiObjekat?.adresa,
      terminId: z.terminId,
      zahtjevId: z.zahtjevId,
    }))
  ].sort((a, b) => new Date(a.vrijemePocetka) - new Date(b.vrijemePocetka));
};

module.exports = {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
  getMojeRezervacijeService,
};