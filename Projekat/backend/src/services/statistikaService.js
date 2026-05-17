const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validateStatistikaKonzistentnost } = require('./statistikaConsistencyService');

function parsePositiveInt(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} mora biti pozitivan cijeli broj.`);
    error.status = 400;
    throw error;
  }
  return parsed;
}

function normalizeVrijednosti(vrijednosti) {
  if (!Array.isArray(vrijednosti) || vrijednosti.length === 0) {
    const error = new Error('Vrijednosti statistike su obavezne.');
    error.status = 400;
    throw error;
  }

  return vrijednosti.map((item) => ({
    tipStatistikeId: parsePositiveInt(item.tipStatistikeId, 'tipStatistikeId'),
    vrijednost: Number(item.vrijednost)
  })).map((item) => {
    if (!Number.isFinite(item.vrijednost) || item.vrijednost < 0) {
      const error = new Error('Vrijednost statistike mora biti nenegativan broj.');
      error.status = 400;
      throw error;
    }
    return item;
  });
}

function assertAuthorized(utakmica, korisnik) {
  if (
    korisnik.uloga !== 'ADMINISTRATOR' &&
    (korisnik.uloga !== 'ORGANIZATOR' || utakmica.takmicenje.organizatorId !== korisnik.korisnikId)
  ) {
    const error = new Error('Nemate ovlaštenje za unos statistike za ovu utakmicu.');
    error.status = 403;
    throw error;
  }
}

async function getTipoviStatistike(sportId) {
  const parsedSportId = parsePositiveInt(sportId, 'sportId');

  return prisma.tipStatistike.findMany({
    where: { sportId: parsedSportId },
    orderBy: { nazivStatistike: 'asc' }
  });
}

async function getUtakmicaZaStatistiku(tx, utakmicaId) {
  const utakmica = await tx.utakmica.findUnique({
    where: { utakmicaId },
    include: {
      takmicenje: {
        select: {
          takmicenjeId: true,
          sportId: true,
          organizatorId: true
        }
      }
    }
  });

  if (!utakmica) {
    const error = new Error('Utakmica nije pronađena.');
    error.status = 404;
    throw error;
  }

  return utakmica;
}

async function validateTipoviZaSport(tx, sportId, vrijednosti) {
  const tipIds = [...new Set(vrijednosti.map((item) => item.tipStatistikeId))];
  if (tipIds.length !== vrijednosti.length) {
    const error = new Error('Isti tip statistike ne smije biti poslan više puta.');
    error.status = 400;
    throw error;
  }

  const tipovi = await tx.tipStatistike.findMany({
    where: {
      tipStatistikeId: { in: tipIds },
      sportId
    },
    select: { tipStatistikeId: true }
  });

  if (tipovi.length !== tipIds.length) {
    const error = new Error('Statistika ne odgovara sportu ove utakmice.');
    error.status = 400;
    throw error;
  }
}

async function upsertVrijednosti(tx, model, parentField, parentId, vrijednosti) {
  const sacuvane = [];

  for (const item of vrijednosti) {
    const postojeca = await tx[model].findFirst({
      where: {
        [parentField]: parentId,
        tipStatistikeId: item.tipStatistikeId
      }
    });

    if (postojeca) {
      sacuvane.push(await tx[model].update({
        where: { vrijednostId: postojeca.vrijednostId },
        data: { vrijednost: item.vrijednost }
      }));
    } else {
      sacuvane.push(await tx[model].create({
        data: {
          [parentField]: parentId,
          tipStatistikeId: item.tipStatistikeId,
          vrijednost: item.vrijednost
        }
      }));
    }
  }

  return sacuvane;
}

async function snimiStatistikuIgraca(utakmicaId, data, korisnik) {
  const parsedUtakmicaId = parsePositiveInt(utakmicaId, 'utakmicaId');
  const korisnikId = parsePositiveInt(data.korisnikId, 'korisnikId');
  const timId = data.timId ? parsePositiveInt(data.timId, 'timId') : null;
  const vrijednosti = normalizeVrijednosti(data.vrijednosti);

  return prisma.$transaction(async (tx) => {
    const utakmica = await getUtakmicaZaStatistiku(tx, parsedUtakmicaId);
    assertAuthorized(utakmica, korisnik);
    await validateTipoviZaSport(tx, utakmica.takmicenje.sportId, vrijednosti);

    const dozvoljeniTimovi = [utakmica.domaciTimId, utakmica.gostujuciTimId];
    if (timId && !dozvoljeniTimovi.includes(timId)) {
      const error = new Error('Tim nije učesnik ove utakmice.');
      error.status = 400;
      throw error;
    }

    const clanstvo = await tx.clanstvoTima.findFirst({
      where: {
        korisnikId,
        timId: timId ? timId : { in: dozvoljeniTimovi },
        status: 'ACTIVE'
      }
    });

    if (!clanstvo) {
      const error = new Error('Igrač mora biti aktivan član jednog od timova na utakmici.');
      error.status = 400;
      throw error;
    }

    const statistika = await tx.statistikaIgracaNaUtakmici.findFirst({
      where: {
        utakmicaId: parsedUtakmicaId,
        korisnikId,
        timId: clanstvo.timId
      }
    }) || await tx.statistikaIgracaNaUtakmici.create({
      data: {
        utakmicaId: parsedUtakmicaId,
        korisnikId,
        timId: clanstvo.timId
      }
    });

    await upsertVrijednosti(tx, 'vrijednostStatistikeIgraca', 'statistikaIgracaId', statistika.statistikaIgracaId, vrijednosti);
    await validateStatistikaKonzistentnost(tx, parsedUtakmicaId);

    return tx.statistikaIgracaNaUtakmici.findUnique({
      where: { statistikaIgracaId: statistika.statistikaIgracaId },
      include: {
        korisnik: { select: { korisnikId: true, punoIme: true } },
        tim: { select: { timId: true, naziv: true } },
        vrijednosti: { include: { tipStatistike: true } }
      }
    });
  });
}

async function snimiStatistikuTima(utakmicaId, data, korisnik) {
  const parsedUtakmicaId = parsePositiveInt(utakmicaId, 'utakmicaId');
  const timId = parsePositiveInt(data.timId, 'timId');
  const vrijednosti = normalizeVrijednosti(data.vrijednosti);

  return prisma.$transaction(async (tx) => {
    const utakmica = await getUtakmicaZaStatistiku(tx, parsedUtakmicaId);
    assertAuthorized(utakmica, korisnik);
    await validateTipoviZaSport(tx, utakmica.takmicenje.sportId, vrijednosti);

    if (![utakmica.domaciTimId, utakmica.gostujuciTimId].includes(timId)) {
      const error = new Error('Tim nije učesnik ove utakmice.');
      error.status = 400;
      throw error;
    }

    const statistika = await tx.statistikaTimaNaUtakmici.findFirst({
      where: {
        utakmicaId: parsedUtakmicaId,
        timId
      }
    }) || await tx.statistikaTimaNaUtakmici.create({
      data: {
        utakmicaId: parsedUtakmicaId,
        timId
      }
    });

    await upsertVrijednosti(tx, 'vrijednostStatistikeTima', 'statistikaTimaId', statistika.statistikaTimaId, vrijednosti);
    await validateStatistikaKonzistentnost(tx, parsedUtakmicaId);

    return tx.statistikaTimaNaUtakmici.findUnique({
      where: { statistikaTimaId: statistika.statistikaTimaId },
      include: {
        tim: { select: { timId: true, naziv: true } },
        vrijednosti: { include: { tipStatistike: true } }
      }
    });
  });
}

module.exports = {
  getTipoviStatistike,
  snimiStatistikuIgraca,
  snimiStatistikuTima
};
