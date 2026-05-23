const prisma = require('../config/db');

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

  const mojRezervacije = await prisma.rezervacija.findMany({
    where: {
      zahtjev: { korisnikId },
      status: 'POTVRDJENA',
    },
    select: { terminId: true },
  });

  const mojiTerminIds = mojRezervacije.map((r) => r.terminId);

  return prisma.terminObjekta.findMany({
    where: {
      vrijemePocetka: { gt: now },
      OR: [
        { status: SLOBODAN },
        {
          status: REZERVISAN,
          terminId: { in: mojiTerminIds },
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
};

const assertNotDuplicateReservation = async (terminId, korisnikId) => {
  const zahtjev = await prisma.zahtjevZaRezervaciju.findFirst({
    where: {
      korisnikId,
      terminId,
      status: { in: ['CEKANJE', 'ODOBRENO'] },
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
      status: 'CEKANJE',
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

  return { poruka: 'Rezervacija je uspješno otkazana.' };
};

module.exports = {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
};