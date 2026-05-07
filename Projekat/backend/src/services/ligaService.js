const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function kreirajLigu({ naziv, sportId, sezona, opis, datumPocetka, datumZavrsetka, tipTakmicenja }, organizatorId) {
  const sport = await prisma.sport.findUnique({
    where: { sportId: Number(sportId) },
  });

  if (!sport) {
    const error = new Error('Sport sa zadanim ID-em ne postoji');
    error.status = 404;
    error.code = 'SPORT_NIJE_PRONADJEN';
    throw error;
  }

  const liga = await prisma.takmicenje.create({
    data: {
      naziv,
      sportId: Number(sportId),
      organizatorId,
      sezona: sezona || null,
      opis: opis || null,
      datumPocetka: datumPocetka ? new Date(datumPocetka) : null,
      datumZavrsetka: datumZavrsetka ? new Date(datumZavrsetka) : null,
      tipTakmicenja: tipTakmicenja || null,
      status: 'AKTIVNA',
    },
    include: {
      sport: { select: { sportId: true, naziv: true } },
      organizator: { select: { korisnikId: true, punoIme: true, email: true } },
    },
  });

  return liga;
}

async function dohvatiSveLige({ sportId, status, sezona } = {}) {
  const where = {};

  if (sportId) where.sportId = Number(sportId);
  if (status) where.status = status;
  if (sezona) where.sezona = sezona;

  const lige = await prisma.takmicenje.findMany({
    where,
    include: {
      sport: { select: { sportId: true, naziv: true } },
      organizator: { select: { korisnikId: true, punoIme: true, email: true } },
      _count: {
        select: {
          utakmice: true,
          ucesniciTakmicenja: true,
        },
      },
    },
    orderBy: { takmicenjeId: 'desc' },
  });

  return lige;
}

async function dohvatiLiguPoId(takmicenjeId) {
  const liga = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: Number(takmicenjeId) },
    include: {
      sport: { select: { sportId: true, naziv: true } },
      organizator: { select: { korisnikId: true, punoIme: true, email: true } },
      plasmaniNaTabeli: {
        include: {
          tim: { select: { timId: true, naziv: true, logoUrl: true } },
        },
        orderBy: { trenutnaPozicija: 'asc' },
      },
      _count: {
        select: {
          utakmice: true,
          ucesniciTakmicenja: true,
        },
      },
    },
  });

  if (!liga) {
    const error = new Error('Liga sa zadanim ID-em ne postoji');
    error.status = 404;
    error.code = 'LIGA_NIJE_PRONADJENA';
    throw error;
  }

  return liga;
}

async function izmijeniLigu(takmicenjeId, podaci, korisnikId, korisnikUloga) {
  const liga = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: Number(takmicenjeId) },
  });

  if (!liga) {
    const error = new Error('Liga sa zadanim ID-em ne postoji');
    error.status = 404;
    error.code = 'LIGA_NIJE_PRONADJENA';
    throw error;
  }

  // Organizator može mijenjati samo svoju ligu, administrator može sve
  if (korisnikUloga !== 'ADMINISTRATOR' && liga.organizatorId !== korisnikId) {
    const error = new Error('Nemate dozvolu za izmjenu ove lige');
    error.status = 403;
    error.code = 'ZABRANJEN_PRISTUP';
    throw error;
  }

  const { naziv, sportId, sezona, opis, datumPocetka, datumZavrsetka, tipTakmicenja, status } = podaci;

  const azuriranaPodaci = {};
  if (naziv !== undefined) azuriranaPodaci.naziv = naziv;
  if (sezona !== undefined) azuriranaPodaci.sezona = sezona;
  if (opis !== undefined) azuriranaPodaci.opis = opis;
  if (datumPocetka !== undefined) azuriranaPodaci.datumPocetka = datumPocetka ? new Date(datumPocetka) : null;
  if (datumZavrsetka !== undefined) azuriranaPodaci.datumZavrsetka = datumZavrsetka ? new Date(datumZavrsetka) : null;
  if (tipTakmicenja !== undefined) azuriranaPodaci.tipTakmicenja = tipTakmicenja;
  if (status !== undefined) azuriranaPodaci.status = status;

  if (sportId !== undefined) {
    const sport = await prisma.sport.findUnique({ where: { sportId: Number(sportId) } });
    if (!sport) {
      const error = new Error('Sport sa zadanim ID-em ne postoji');
      error.status = 404;
      error.code = 'SPORT_NIJE_PRONADJEN';
      throw error;
    }
    azuriranaPodaci.sportId = Number(sportId);
  }

  const azuriranaLiga = await prisma.takmicenje.update({
    where: { takmicenjeId: Number(takmicenjeId) },
    data: azuriranaPodaci,
    include: {
      sport: { select: { sportId: true, naziv: true } },
      organizator: { select: { korisnikId: true, punoIme: true, email: true } },
    },
  });

  return azuriranaLiga;
}

async function obrisiLigu(takmicenjeId, korisnikId, korisnikUloga) {
  const liga = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: Number(takmicenjeId) },
    include: {
      _count: { select: { utakmice: true } },
    },
  });

  if (!liga) {
    const error = new Error('Liga sa zadanim ID-em ne postoji');
    error.status = 404;
    error.code = 'LIGA_NIJE_PRONADJENA';
    throw error;
  }

  if (korisnikUloga !== 'ADMINISTRATOR' && liga.organizatorId !== korisnikId) {
    const error = new Error('Nemate dozvolu za brisanje ove lige');
    error.status = 403;
    error.code = 'ZABRANJEN_PRISTUP';
    throw error;
  }

  if (liga._count.utakmice > 0) {
    const error = new Error('Ne možete obrisati ligu koja ima utakmice. Prvo obrišite utakmice.');
    error.status = 409;
    error.code = 'LIGA_IMA_UTAKMICE';
    throw error;
  }

  await prisma.takmicenje.delete({
    where: { takmicenjeId: Number(takmicenjeId) },
  });

  return { takmicenjeId: Number(takmicenjeId) };
}

async function dodajTimULigu(takmicenjeId, timId) {
  const postojeci = await prisma.ucesceUTakmicenju.findFirst({
    where: {
      takmicenjeId: Number(takmicenjeId),
      timId: Number(timId),
    },
  });

  if (postojeci) {
    const error = new Error('Tim je već dodan u ovu ligu.');
    error.status = 409;
    throw error;
  }

  return await prisma.ucesceUTakmicenju.create({
    data: {
      takmicenjeId: Number(takmicenjeId),
      timId: Number(timId),
    },
    include: {
      tim: { select: { timId: true, naziv: true } },
    },
  });
}

async function ukloniTimIzLige(takmicenjeId, timId) {
  const postojeci = await prisma.ucesceUTakmicenju.findFirst({
    where: {
      takmicenjeId: Number(takmicenjeId),
      timId: Number(timId),
    },
  });

  if (!postojeci) {
    const error = new Error('Tim nije pronađen u ovoj ligi.');
    error.status = 404;
    throw error;
  }

  return await prisma.ucesceUTakmicenju.delete({
    where: { ucesceId: postojeci.ucesceId },
  });
}

module.exports = {
  kreirajLigu,
  dohvatiSveLige,
  dohvatiLiguPoId,
  izmijeniLigu,
  obrisiLigu,
  dodajTimULigu,     
  ukloniTimIzLige,    
};