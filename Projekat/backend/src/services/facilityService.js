const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DOZVOLJENA_TRAJANJA_TERMINA = [60, 90, 120];
const DOZVOLJENA_PONAVLJANJA = ['JEDNOM', 'SEDMICNO', 'MJESECNO'];

function serviceError(message, status, code) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function parsePositiveId(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw serviceError(`${fieldName} mora biti pozitivan cijeli broj.`, 400, 'NEVALIDAN_ID');
  }
  return parsed;
}

function parseDate(value, fieldName) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw serviceError(`${fieldName} mora biti validan datum.`, 400, 'NEVALIDAN_DATUM');
  }
  return date;
}

function parseTrajanje(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw serviceError('Trajanje mora biti pozitivan broj.', 400, 'NEVALIDNO_TRAJANJE');
  }
  if (!DOZVOLJENA_TRAJANJA_TERMINA.includes(parsed)) {
    throw serviceError('Trajanje termina mora biti 60, 90 ili 120 minuta.', 400, 'NEVALIDNO_TRAJANJE');
  }
  return parsed;
}

function parsePonavljanje(value) {
  const ponavljanje = value || 'JEDNOM';
  if (!DOZVOLJENA_PONAVLJANJA.includes(ponavljanje)) {
    throw serviceError('Ponavljanje mora biti JEDNOM, SEDMICNO ili MJESECNO.', 400, 'NEVALIDNO_PONAVLJANJE');
  }
  return ponavljanje;
}

function parseBrojPonavljanja(value) {
  if (value === undefined || value === null || value === '') return 1;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw serviceError('Broj ponavljanja mora biti pozitivan cijeli broj.', 400, 'NEVALIDAN_BROJ_PONAVLJANJA');
  }
  return parsed;
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function generisiTerminePayload({ objekatId, vrijemePocetka, trajanje, ponavljanje, brojPonavljanja }) {
  const termini = [];

  for (let i = 0; i < brojPonavljanja; i += 1) {
    let pocetak = new Date(vrijemePocetka);

    if (ponavljanje === 'SEDMICNO') {
      pocetak.setDate(pocetak.getDate() + i * 7);
    }

    if (ponavljanje === 'MJESECNO') {
      pocetak = addMonths(pocetak, i);
    }

    const kraj = new Date(pocetak.getTime() + trajanje * 60 * 1000);

    termini.push({
      objekatId,
      vrijemePocetka: pocetak,
      vrijemeZavrsetka: kraj,
      tipTermina: ponavljanje,
      status: 'SLOBODAN'
    });
  }

  return termini;
}

async function assertVlasnikObjekta(objekatId, korisnik) {
  const objekat = await prisma.sportskiObjekat.findUnique({
    where: { objekatId }
  });

  if (!objekat) {
    throw serviceError('Sportski objekat nije pronadjen.', 404, 'OBJEKAT_NIJE_PRONADJEN');
  }

  if (korisnik?.uloga !== 'VLASNIK' || objekat.vlasnikId !== korisnik.korisnikId) {
    throw serviceError('Nemate pravo kreirati termine za ovaj sportski objekat.', 403, 'NISTE_VLASNIK_OBJEKTA');
  }

  return objekat;
}

async function assertNemaPreklapanja(objekatId, termini, ignoredTerminId = null) {
  for (const termin of termini) {
    const where = {
      objekatId,
      vrijemePocetka: { lt: termin.vrijemeZavrsetka },
      vrijemeZavrsetka: { gt: termin.vrijemePocetka }
    };

    if (ignoredTerminId) {
      where.NOT = { terminId: ignoredTerminId };
    }

    const preklapanje = await prisma.terminObjekta.findFirst({
      where
    });

    if (preklapanje) {
      throw serviceError('Termin se preklapa sa postojecim terminom objekta.', 400, 'TERMIN_SE_PREKLAPA');
    }
  }
}

async function getTerminZaVlasnika(terminId, korisnik) {
  const termin = await prisma.terminObjekta.findUnique({
    where: { terminId },
    include: {
      sportskiObjekat: true
    }
  });

  if (!termin) {
    throw serviceError('Termin nije pronadjen.', 404, 'TERMIN_NIJE_PRONADJEN');
  }

  if (korisnik?.uloga !== 'VLASNIK' || termin.sportskiObjekat.vlasnikId !== korisnik.korisnikId) {
    throw serviceError('Nemate pravo upravljati ovim terminom.', 403, 'NISTE_VLASNIK_TERMINA');
  }

  return termin;
}

const createFacilityService = async (data, ownerId) => {
  return await prisma.sportskiObjekat.create({
    data: {
      vlasnikId: parseInt(ownerId), // Poveznica sa modelom Korisnik
      naziv: data.naziv,
      adresa: data.adresa || null,
      opis: data.opis || null,
      kapacitet: data.kapacitet ? parseInt(data.kapacitet) : null,
      status: data.status || "AKTIVAN" // Podrazumijevano aktivan pri kreiranju
    }
  });
};

const getAllFacilitiesService = async (filters, ownerId) => {
  const searchStatus = filters.status || "AKTIVAN";

  return await prisma.sportskiObjekat.findMany({
    where: {
      vlasnikId: parseInt(ownerId), 
      status: searchStatus,
      adresa: filters.grad ? { contains: filters.grad, mode: 'insensitive' } : undefined
    },
    include: {
      vlasnik: {
        select: { punoIme: true, email: true }
      }
    }
  });
};

const getFacilityByIdService = async (id) => {
  return await prisma.sportskiObjekat.findUnique({
    where: { objekatId: parseInt(id) },
    include: {
      vlasnik: { select: { punoIme: true, email: true } }
    }
  });
};

const updateFacilityService = async (id, data, currentUserId) => {
  const facility = await prisma.sportskiObjekat.findUnique({ where: { objekatId: parseInt(id) } });
  if (!facility) throw new Error("Sportski objekat ne postoji u bazi.");

  return await prisma.sportskiObjekat.update({
    where: { objekatId: parseInt(id) },
    data: {
      naziv: data.naziv,
      adresa: data.adresa,
      opis: data.opis,
      kapacitet: data.kapacitet ? parseInt(data.kapacitet) : null,
      status: data.status // Omogućava i ručnu promjenu statusa kroz formu
    }
  });
};

const deleteFacilityService = async (id, currentUserId) => {
  const facility = await prisma.sportskiObjekat.findUnique({ where: { objekatId: parseInt(id) } });
  if (!facility) throw new Error("Sportski objekat ne postoji.");

  // Izvršavanje zahtijevanog soft-delete-a (status = NEAKTIVAN) umjesto brisanja iz baze
  return await prisma.sportskiObjekat.update({
    where: { objekatId: parseInt(id) },
    data: { status: "NEAKTIVAN" }
  });
};

const createFacilityTermsService = async (objekatIdParam, data, korisnik) => {
  const objekatId = parsePositiveId(objekatIdParam, 'objekatId');
  await assertVlasnikObjekta(objekatId, korisnik);

  const vrijemePocetka = parseDate(data.vrijemePocetka, 'vrijemePocetka');
  const trajanje = parseTrajanje(data.trajanje);
  const ponavljanje = parsePonavljanje(data.ponavljanje);
  const brojPonavljanja = parseBrojPonavljanja(data.brojPonavljanja);

  const terminiZaKreiranje = generisiTerminePayload({
    objekatId,
    vrijemePocetka,
    trajanje,
    ponavljanje,
    brojPonavljanja
  });

  await assertNemaPreklapanja(objekatId, terminiZaKreiranje);

  return prisma.$transaction(async (tx) => {
    const kreiraniTermini = [];

    for (const termin of terminiZaKreiranje) {
      const kreiraniTermin = await tx.terminObjekta.create({ data: termin });
      kreiraniTermini.push(kreiraniTermin);
    }

    return kreiraniTermini;
  });
};

const getFacilityTermsService = async (objekatIdParam, filters = {}) => {
  const objekatId = parsePositiveId(objekatIdParam, 'objekatId');
  const objekat = await prisma.sportskiObjekat.findUnique({
    where: { objekatId },
    select: { objekatId: true }
  });

  if (!objekat) {
    throw serviceError('Sportski objekat nije pronadjen.', 404, 'OBJEKAT_NIJE_PRONADJEN');
  }

  const od = filters.od ? parseDate(filters.od, 'od') : null;
  const doDatum = filters.do ? parseDate(filters.do, 'do') : null;

  if ((od && !doDatum) || (!od && doDatum)) {
    throw serviceError('Za datumski opseg potrebno je poslati i od i do parametar.', 400, 'NEPOTPUN_DATUMSKI_OPSEG');
  }

  if (od && doDatum && od >= doDatum) {
    throw serviceError('Parametar od mora biti prije parametra do.', 400, 'NEVALIDAN_DATUMSKI_OPSEG');
  }

  const where = { objekatId };

  if (od && doDatum) {
    where.vrijemePocetka = { lt: doDatum };
    where.vrijemeZavrsetka = { gt: od };
  }

  return prisma.terminObjekta.findMany({
    where,
    orderBy: { vrijemePocetka: 'asc' }
  });
};

const updateFacilityTermService = async (terminIdParam, data, korisnik) => {
  const terminId = parsePositiveId(terminIdParam, 'terminId');
  const termin = await getTerminZaVlasnika(terminId, korisnik);

  const vrijemePocetka = data.vrijemePocetka
    ? parseDate(data.vrijemePocetka, 'vrijemePocetka')
    : termin.vrijemePocetka;

  const postojeceTrajanje = Math.round((termin.vrijemeZavrsetka.getTime() - termin.vrijemePocetka.getTime()) / 60000);
  const trajanje = data.trajanje !== undefined ? parseTrajanje(data.trajanje) : parseTrajanje(postojeceTrajanje);
  const vrijemeZavrsetka = new Date(vrijemePocetka.getTime() + trajanje * 60 * 1000);

  await assertNemaPreklapanja(
    termin.objekatId,
    [{ vrijemePocetka, vrijemeZavrsetka }],
    terminId
  );

  return prisma.terminObjekta.update({
    where: { terminId },
    data: {
      vrijemePocetka,
      vrijemeZavrsetka
    }
  });
};

const blockFacilityTermService = async (terminIdParam, korisnik) => {
  const terminId = parsePositiveId(terminIdParam, 'terminId');
  await getTerminZaVlasnika(terminId, korisnik);

  return prisma.terminObjekta.update({
    where: { terminId },
    data: {
      tipTermina: 'BLOKIRAN',
      status: 'BLOKIRAN'
    }
  });
};

module.exports = {
  createFacilityService,
  getAllFacilitiesService,
  getFacilityByIdService,
  updateFacilityService,
  deleteFacilityService,
  createFacilityTermsService,
  getFacilityTermsService,
  updateFacilityTermService,
  blockFacilityTermService,
  DOZVOLJENA_TRAJANJA_TERMINA,
  DOZVOLJENA_PONAVLJANJA
};
