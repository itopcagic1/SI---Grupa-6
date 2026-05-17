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

// Optimizovana verzija: dohvata sve postojece u jednom upitu,
// zatim paralelno radi update/create umjesto N sekvencijalnih upita
async function upsertVrijednosti(tx, model, parentField, parentId, vrijednosti) {
  // 1 upit za sve postojece zapise
  const postojece = await tx[model].findMany({
    where: { [parentField]: parentId }
  });

  const postojeceMap = new Map(
    postojece.map(p => [p.tipStatistikeId, p])
  );

  const toUpdate = [];
  const toCreate = [];

  for (const item of vrijednosti) {
    const exists = postojeceMap.get(item.tipStatistikeId);
    if (exists) {
      toUpdate.push({ id: exists.vrijednostId, vrijednost: item.vrijednost });
    } else {
      toCreate.push({
        [parentField]: parentId,
        tipStatistikeId: item.tipStatistikeId,
        vrijednost: item.vrijednost
      });
    }
  }

  // Sve operacije izvrsavamo paralelno
  await Promise.all([
    ...toUpdate.map(u => tx[model].update({
      where: { vrijednostId: u.id },
      data: { vrijednost: u.vrijednost }
    })),
    toCreate.length > 0
      ? tx[model].createMany({ data: toCreate })
      : Promise.resolve()
  ]);
}

async function snimiStatistikuIgraca(utakmicaId, data, korisnik) {
  const parsedUtakmicaId = parsePositiveInt(utakmicaId, 'utakmicaId');
  const korisnikId = parsePositiveInt(data.korisnikId, 'korisnikId');
  const timId = data.timId ? parsePositiveInt(data.timId, 'timId') : null;
  const vrijednosti = normalizeVrijednosti(data.vrijednosti);

  // Cuva se van transakcije da mozemo raditi findUnique nakon sto se transakcija zatvori
  let statistikaIgracaId;

  await prisma.$transaction(async (tx) => {
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

    statistikaIgracaId = statistika.statistikaIgracaId;

    await upsertVrijednosti(tx, 'vrijednostStatistikeIgraca', 'statistikaIgracaId', statistikaIgracaId, vrijednosti);
    await validateStatistikaKonzistentnost(tx, parsedUtakmicaId);

  }, { timeout: 15000 });

  // findUnique se izvrsava NAKON sto je transakcija uspjesno zatvorena
  return prisma.statistikaIgracaNaUtakmici.findUnique({
    where: { statistikaIgracaId },
    include: {
      korisnik: { select: { korisnikId: true, punoIme: true } },
      tim: { select: { timId: true, naziv: true } },
      vrijednosti: { include: { tipStatistike: true } }
    }
  });
}

async function snimiStatistikuTima(utakmicaId, data, korisnik) {
  const parsedUtakmicaId = parsePositiveInt(utakmicaId, 'utakmicaId');
  const timId = parsePositiveInt(data.timId, 'timId');
  const vrijednosti = normalizeVrijednosti(data.vrijednosti);

  // Cuva se van transakcije da mozemo raditi findUnique nakon sto se transakcija zatvori
  let statistikaTimaId;

  await prisma.$transaction(async (tx) => {
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

    statistikaTimaId = statistika.statistikaTimaId;

    await upsertVrijednosti(tx, 'vrijednostStatistikeTima', 'statistikaTimaId', statistikaTimaId, vrijednosti);
    await validateStatistikaKonzistentnost(tx, parsedUtakmicaId);

  }, { timeout: 15000 });

  // findUnique se izvrsava NAKON sto je transakcija uspjesno zatvorena
  return prisma.statistikaTimaNaUtakmici.findUnique({
    where: { statistikaTimaId },
    include: {
      tim: { select: { timId: true, naziv: true } },
      vrijednosti: { include: { tipStatistike: true } }
    }
  });
}

async function dohvatiAgregiranuStatistikuIgraca(korisnikId, takmicenjeId, sezona) {
  const parsedKorisnikId = parsePositiveInt(korisnikId, 'korisnikId');

  const where = {
    korisnikId: parsedKorisnikId
  };

  if (takmicenjeId) {
    where.utakmica = {
      takmicenjeId: parsePositiveInt(takmicenjeId, 'takmicenjeId')
    };
  }

  if (sezona) {
    where.utakmica = {
      ...(where.utakmica || {}),
      takmicenje: {
        sezona
      }
    };
  }

  const statistike = await prisma.statistikaIgracaNaUtakmici.findMany({
    where,
    include: {
      korisnik: {
        select: {
          korisnikId: true,
          punoIme: true
        }
      },
      tim: {
        select: {
          timId: true,
          naziv: true
        }
      },
      utakmica: {
        select: {
          takmicenjeId: true,
          takmicenje: {
            select: {
              naziv: true,
              sezona: true,
              sportId: true
            }
          }
        }
      },
      vrijednosti: {
        include: {
          tipStatistike: {
            select: {
              tipStatistikeId: true,
              nazivStatistike: true
            }
          }
        }
      }
    }
  });

  const agregirano = {};

  statistike.forEach(stat => {
    stat.vrijednosti.forEach(vrij => {
      const tipId = vrij.tipStatistike.tipStatistikeId;
      if (!agregirano[tipId]) {
        agregirano[tipId] = {
          tipStatistikeId: tipId,
          nazivStatistike: vrij.tipStatistike.nazivStatistike,
          ukupno: 0,
          brojUtakmica: 0
        };
      }
      agregirano[tipId].ukupno += vrij.vrijednost;
    });
  });

  const brojUtakmica = new Set(statistike.map(s => s.statistikaIgracaId)).size;

  return {
    igrac: statistike[0]?.korisnik || null,
    tim: statistike[0]?.tim || null,
    takmicenje: statistike[0]?.utakmica?.takmicenje || null,
    brojUtakmica,
    statistike: Object.values(agregirano)
  };
}

async function dohvatiAgregiranuStatistikuTima(timId, takmicenjeId, sezona) {
  const parsedTimId = parsePositiveInt(timId, 'timId');

  const where = {
    timId: parsedTimId
  };

  if (takmicenjeId) {
    where.utakmica = {
      takmicenjeId: parsePositiveInt(takmicenjeId, 'takmicenjeId')
    };
  }

  if (sezona) {
    where.utakmica = {
      ...(where.utakmica || {}),
      takmicenje: {
        sezona
      }
    };
  }

  const statistike = await prisma.statistikaTimaNaUtakmici.findMany({
    where,
    include: {
      tim: {
        select: {
          timId: true,
          naziv: true,
          logoUrl: true,
          sport: {
            select: {
              sportId: true,
              naziv: true
            }
          }
        }
      },
      utakmica: {
        select: {
          takmicenjeId: true,
          takmicenje: {
            select: {
              naziv: true,
              sezona: true
            }
          }
        }
      },
      vrijednosti: {
        include: {
          tipStatistike: {
            select: {
              tipStatistikeId: true,
              nazivStatistike: true
            }
          }
        }
      }
    }
  });

  const agregirano = {};

  statistike.forEach(stat => {
    stat.vrijednosti.forEach(vrij => {
      const tipId = vrij.tipStatistike.tipStatistikeId;
      if (!agregirano[tipId]) {
        agregirano[tipId] = {
          tipStatistikeId: tipId,
          nazivStatistike: vrij.tipStatistike.nazivStatistike,
          ukupno: 0
        };
      }
      agregirano[tipId].ukupno += vrij.vrijednost;
    });
  });

  const brojUtakmica = statistike.length;

  return {
    tim: statistike[0]?.tim || null,
    takmicenje: statistike[0]?.utakmica?.takmicenje || null,
    brojUtakmica,
    statistike: Object.values(agregirano)
  };
}

async function dohvatiTopStrijelce(takmicenjeId, tipStatistikeId, limit = 10) {
  const parsedTakmicenjeId = parsePositiveInt(takmicenjeId, 'takmicenjeId');

  const takmicenje = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: parsedTakmicenjeId },
    select: { takmicenjeId: true, naziv: true, sezona: true, sportId: true }
  });

  if (!takmicenje) {
    const error = new Error('Takmičenje nije pronađeno.');
    error.status = 404;
    throw error;
  }

  let tipStatistike = null;
  let vrijednosti = [];

  if (tipStatistikeId) {
    const parsedTipStatistikeId = parsePositiveInt(tipStatistikeId, 'tipStatistikeId');

    tipStatistike = await prisma.tipStatistike.findUnique({
      where: { tipStatistikeId: parsedTipStatistikeId },
      select: { tipStatistikeId: true, nazivStatistike: true }
    });

    if (!tipStatistike) {
      const error = new Error('Tip statistike nije pronađen.');
      error.status = 404;
      throw error;
    }

    vrijednosti = await prisma.vrijednostStatistikeIgraca.findMany({
      where: {
        tipStatistikeId: parsedTipStatistikeId,
        statistikaIgraca: {
          utakmica: {
            takmicenjeId: parsedTakmicenjeId
          }
        }
      },
      include: {
        statistikaIgraca: {
          include: {
            korisnik: { select: { korisnikId: true, punoIme: true } },
            tim: { select: { timId: true, naziv: true, logoUrl: true } }
          }
        }
      }
    });
  } else {
    const [golTip, asistTip] = await Promise.all([
      prisma.tipStatistike.findFirst({
        where: {
          sportId: takmicenje.sportId,
          nazivStatistike: { contains: 'gol', mode: 'insensitive' }
        },
        select: { tipStatistikeId: true, nazivStatistike: true }
      }),
      prisma.tipStatistike.findFirst({
        where: {
          sportId: takmicenje.sportId,
          nazivStatistike: { contains: 'asist', mode: 'insensitive' }
        },
        select: { tipStatistikeId: true, nazivStatistike: true }
      })
    ]);

    const tipIds = [golTip, asistTip].filter(Boolean).map((tip) => tip.tipStatistikeId);
    tipStatistike = { tipStatistikeId: null, nazivStatistike: 'Golovi + asistencije (prosjek)' };

    if (tipIds.length > 0) {
      vrijednosti = await prisma.vrijednostStatistikeIgraca.findMany({
        where: {
          tipStatistikeId: { in: tipIds },
          statistikaIgraca: {
            utakmica: {
              takmicenjeId: parsedTakmicenjeId
            }
          }
        },
        include: {
          statistikaIgraca: {
            include: {
              korisnik: { select: { korisnikId: true, punoIme: true } },
              tim: { select: { timId: true, naziv: true, logoUrl: true } }
            }
          }
        }
      });
    }
  }

  const poIgracu = {};

  for (const vrij of vrijednosti) {
    const statistikaIgraca = vrij.statistikaIgraca;
    const korisnikId = statistikaIgraca.korisnik?.korisnikId;
    if (!korisnikId) continue;

    if (!poIgracu[korisnikId]) {
      poIgracu[korisnikId] = {
        igrac: statistikaIgraca.korisnik,
        tim: statistikaIgraca.tim,
        ukupno: 0,
        utakmice: new Set()
      };
    }

    poIgracu[korisnikId].ukupno += vrij.vrijednost;
    poIgracu[korisnikId].utakmice.add(statistikaIgraca.statistikaIgracaId);
  }

  const topStrijelci = Object.values(poIgracu)
    .map((entry) => ({
      ...entry,
      prosjek: entry.utakmice.size > 0 ? entry.ukupno / entry.utakmice.size : 0
    }))
    .sort((a, b) => {
      if (tipStatistikeId) {
        return b.ukupno - a.ukupno;
      }
      return b.prosjek - a.prosjek;
    })
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      igrac: entry.igrac,
      tim: entry.tim,
      vrijednost: tipStatistikeId ? entry.ukupno : Number(entry.prosjek.toFixed(2))
    }));

  return {
    takmicenje,
    tipStatistike,
    topStrijelci
  };
}

async function dohvatiTakmicenjaIgraca(korisnikId) {
  const parsedKorisnikId = parsePositiveInt(korisnikId, 'korisnikId');


  const statistike = await prisma.statistikaIgracaNaUtakmici.findMany({
    where: {
      korisnikId: parsedKorisnikId
    },
    select: {
      utakmica: {
        select: {
          takmicenje: {
            select: {
              takmicenjeId: true,
              naziv: true,
              sezona: true,
              sportId: true
            }
          }
        }
      }
    }
  });

 
  const seen = new Set();
  const takmicenja = [];

  for (const stat of statistike) {
    const t = stat.utakmica?.takmicenje;
    if (t && !seen.has(t.takmicenjeId)) {
      seen.add(t.takmicenjeId);
      takmicenja.push(t);
    }
  }

  return takmicenja.sort((a, b) => a.naziv.localeCompare(b.naziv));
}
async function dohvatiTakmicenjaTima(timId) {
  const parsedTimId = parsePositiveInt(timId, 'timId');

  const statistike = await prisma.statistikaTimaNaUtakmici.findMany({
    where: { timId: parsedTimId },
    select: {
      utakmica: {
        select: {
          takmicenje: {
            select: {
              takmicenjeId: true,
              naziv: true,
              sezona: true,
              sportId: true
            }
          }
        }
      }
    }
  });

  const seen = new Set();
  const takmicenja = [];

  for (const stat of statistike) {
    const t = stat.utakmica?.takmicenje;
    if (t && !seen.has(t.takmicenjeId)) {
      seen.add(t.takmicenjeId);
      takmicenja.push(t);
    }
  }

  return takmicenja.sort((a, b) => a.naziv.localeCompare(b.naziv));
}

module.exports = {
  getTipoviStatistike,
  snimiStatistikuIgraca,
  snimiStatistikuTima,
  dohvatiAgregiranuStatistikuIgraca,
  dohvatiAgregiranuStatistikuTima,
  dohvatiTopStrijelce,
  dohvatiTakmicenjaIgraca,
  dohvatiTakmicenjaTima
};