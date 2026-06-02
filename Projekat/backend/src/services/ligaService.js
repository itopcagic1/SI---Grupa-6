const prisma = require('../config/db');

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

  const postojecaLiga = await prisma.takmicenje.findFirst({
    where: {
      naziv,
      sportId: Number(sportId),
    },
  });

  if (postojecaLiga) {
    const error = new Error('Liga sa ovim nazivom već postoji za odabrani sport.');
    error.status = 409;
    error.code = 'DUPLIKAT_LIGE';
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

async function dohvatiSveLige({ sportId, status, sezona, simple = false } = {}) {
  const where = {};

  if (sportId) where.sportId = Number(sportId);
  if (status) where.status = status;
  if (sezona) where.sezona = sezona;

  if (simple) {
    return await prisma.takmicenje.findMany({
      where,
      select: {
        takmicenjeId: true,
        naziv: true,
        sportId: true
      },
      orderBy: { takmicenjeId: 'desc' },
    });
  }

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
      ucesniciTakmicenja: {
        include: {
          tim: { select: { timId: true, naziv: true } }
        }
      },
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
    const sport = await prisma.sport.findUnique({
      where: { sportId: Number(sportId) }
    });

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
  const takmicenjeIdNumber = Number(takmicenjeId);

  const liga = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: takmicenjeIdNumber },
  });

  if (!liga) {
    const error = new Error('Liga sa zadanim ID-em ne postoji');
    error.status = 404;
    error.code = 'LIGA_NIJE_PRONADJENA';
    throw error;
  }

  // Organizator može brisati samo svoju ligu, administrator može sve
  if (korisnikUloga !== 'ADMINISTRATOR' && liga.organizatorId !== korisnikId) {
    const error = new Error('Nemate dozvolu za brisanje ove lige');
    error.status = 403;
    error.code = 'ZABRANJEN_PRISTUP';
    throw error;
  }

  await prisma.$transaction(async (tx) => {
    // 1. Dohvati sve utakmice iz ove lige
    const utakmice = await tx.utakmica.findMany({
      where: { takmicenjeId: takmicenjeIdNumber },
      select: { utakmicaId: true }
    });

    const utakmicaIds = utakmice.map((utakmica) => utakmica.utakmicaId);

    if (utakmicaIds.length > 0) {
      // 2. Dohvati statistike timova vezane za utakmice
      const statistikeTimova = await tx.statistikaTimaNaUtakmici.findMany({
        where: { utakmicaId: { in: utakmicaIds } },
        select: { statistikaTimaId: true }
      });

      const statistikaTimaIds = statistikeTimova.map((statistika) => statistika.statistikaTimaId);

      // 3. Dohvati statistike igrača vezane za utakmice
      const statistikeIgraca = await tx.statistikaIgracaNaUtakmici.findMany({
        where: { utakmicaId: { in: utakmicaIds } },
        select: { statistikaIgracaId: true }
      });

      const statistikaIgracaIds = statistikeIgraca.map((statistika) => statistika.statistikaIgracaId);

      // 4. Prvo briši vrijednosti statistika timova
      if (statistikaTimaIds.length > 0) {
        await tx.vrijednostStatistikeTima.deleteMany({
          where: { statistikaTimaId: { in: statistikaTimaIds } }
        });
      }

      // 5. Prvo briši vrijednosti statistika igrača
      if (statistikaIgracaIds.length > 0) {
        await tx.vrijednostStatistikeIgraca.deleteMany({
          where: { statistikaIgracaId: { in: statistikaIgracaIds } }
        });
      }

      // 6. Briši parent statistike timova
      await tx.statistikaTimaNaUtakmici.deleteMany({
        where: { utakmicaId: { in: utakmicaIds } }
      });

      // 7. Briši parent statistike igrača
      await tx.statistikaIgracaNaUtakmici.deleteMany({
        where: { utakmicaId: { in: utakmicaIds } }
      });

      // 8. Briši rezultate utakmica
      await tx.rezultatUtakmice.deleteMany({
        where: { utakmicaId: { in: utakmicaIds } }
      });

      // 9. Briši utakmice
      // Ovim se oslobađaju termini/raspored objekta, jer utakmice više ne postoje.
      await tx.utakmica.deleteMany({
        where: { utakmicaId: { in: utakmicaIds } }
      });
    }

    // 10. Briši plasmane/tabelu za ovu ligu
    await tx.plasmanNaTabeli.deleteMany({
      where: { takmicenjeId: takmicenjeIdNumber }
    });

    // 11. Briši učešća timova u ovoj ligi
    await tx.ucesceUTakmicenju.deleteMany({
      where: { takmicenjeId: takmicenjeIdNumber }
    });

    // 12. Na kraju briši samu ligu
    await tx.takmicenje.delete({
      where: { takmicenjeId: takmicenjeIdNumber }
    });
  });

  return { takmicenjeId: takmicenjeIdNumber };
}

async function dodajTimULigu(takmicenjeId, timId, korisnikId) {
  // Dohvati ligu i tim pa provjeri sport
  const [liga, tim] = await Promise.all([
    prisma.takmicenje.findUnique({ where: { takmicenjeId: Number(takmicenjeId) } }),
    prisma.tim.findUnique({ where: { timId: Number(timId) } }),
  ]);

  if (!liga) {
    const error = new Error('Liga sa zadanim ID-em ne postoji');
    error.status = 404;
    error.code = 'LIGA_NIJE_PRONADJENA';
    throw error;
  }

  if (!tim) {
    const error = new Error('Tim sa zadanim ID-em ne postoji');
    error.status = 404;
    error.code = 'TIM_NIJE_PRONADJEN';
    throw error;
  }

  if (liga.sportId !== tim.sportId) {
    const error = new Error('Tim ne pripada sportu ove lige.');
    error.status = 400;
    throw error;
  }

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
      takmicenje: { connect: { takmicenjeId: Number(takmicenjeId) } },
      tim: { connect: { timId: Number(timId) } },
      prijavioKorisnik: { connect: { korisnikId: Number(korisnikId) } },
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
    where: { ucesceUTakmicenjuId: postojeci.ucesceUTakmicenjuId },
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