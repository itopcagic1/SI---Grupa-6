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

module.exports = {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
};
