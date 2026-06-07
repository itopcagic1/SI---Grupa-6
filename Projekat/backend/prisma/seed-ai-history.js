const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');

const SEASONS = [
  {
    naziv: 'AI Historical Football League 2023/2024',
    sezona: '2023/2024',
    start: new Date('2023-08-12T15:00:00.000Z')
  },
  {
    naziv: 'AI Historical Football League 2024/2025',
    sezona: '2024/2025',
    start: new Date('2024-08-10T15:00:00.000Z')
  },
  {
    naziv: 'AI Historical Football League 2025/2026',
    sezona: '2025/2026',
    start: new Date('2025-08-09T15:00:00.000Z')
  }
];

const TEAM_TIERS = {
  strong: ['FC Manchester City', 'FC Liverpool', 'FC Bayern Munich', 'FC Arsenal'],
  middle: ['Chelsea F.C.', 'AC Milan', 'FC Manchester United', 'AS Roma'],
  weak: ['FC Ateltico Madrid', 'SK Sturm Graz']
};

const REQUIRED_FOOTBALL_STATS = [
  'Golovi',
  'Asistencije',
  'Zuti kartoni',
  'Crveni kartoni',
  'Prekrsaji',
  'Posjed lopte'
];

const summary = {
  mode: APPLY ? 'APPLY' : 'DRY_RUN',
  created: {
    teams: 0,
    competitions: 0,
    participations: 0,
    matches: 0,
    results: 0,
    teamStats: 0,
    teamStatValues: 0,
    standings: 0
  },
  existing: {
    competitions: 0,
    participations: 0,
    matches: 0,
    results: 0,
    teamStats: 0,
    teamStatValues: 0,
    standings: 0
  },
  competitions: [],
  warnings: []
};

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getTier(naziv) {
  if (TEAM_TIERS.strong.includes(naziv)) return 'strong';
  if (TEAM_TIERS.middle.includes(naziv)) return 'middle';
  return 'weak';
}

function getStrength(naziv) {
  const tier = getTier(naziv);
  if (tier === 'strong') return 78;
  if (tier === 'middle') return 66;
  return 54;
}

function deterministicHash(...parts) {
  const input = parts.join('|');
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function randomUnit(seed, salt) {
  return deterministicHash(seed, salt) / 0xffffffff;
}

function weightedGoalCount(base, seed, salt) {
  const adjusted = Math.max(0.2, Math.min(3.4, base));
  const r = randomUnit(seed, salt);

  if (r < 0.10) return 0;
  if (r < 0.34) return Math.max(0, Math.round(adjusted - 1));
  if (r < 0.68) return Math.round(adjusted);
  if (r < 0.90) return Math.round(adjusted + 1);
  if (r < 0.98) return Math.round(adjusted + 2);
  return Math.round(adjusted + 3);
}

function generateScore(homeTeam, awayTeam, seasonIndex, roundIndex, matchIndex) {
  const seed = `${seasonIndex}-${roundIndex}-${matchIndex}-${homeTeam.timId}-${awayTeam.timId}`;
  const homeStrength = getStrength(homeTeam.naziv);
  const awayStrength = getStrength(awayTeam.naziv);
  const diff = homeStrength - awayStrength;
  const homeAdvantage = 0.28;

  let homeBase = 1.25 + homeAdvantage + diff / 45;
  let awayBase = 1.05 - diff / 55;

  if (getTier(homeTeam.naziv) === 'strong') homeBase += 0.28;
  if (getTier(awayTeam.naziv) === 'strong') awayBase += 0.22;
  if (getTier(homeTeam.naziv) === 'weak') homeBase -= 0.18;
  if (getTier(awayTeam.naziv) === 'weak') awayBase -= 0.16;

  let home = weightedGoalCount(homeBase, seed, 'home');
  let away = weightedGoalCount(awayBase, seed, 'away');

  if (Math.abs(home - away) > 4) {
    if (home > away) home = away + 4;
    else away = home + 4;
  }

  const shouldNudgeStrongTeam = randomUnit(seed, 'nudge') < 0.28;
  if (shouldNudgeStrongTeam && getTier(homeTeam.naziv) === 'strong' && home <= away) {
    home = away + 1;
  }
  if (shouldNudgeStrongTeam && getTier(awayTeam.naziv) === 'strong' && away <= home) {
    away = home + 1;
  }

  return {
    rezultatDomacin: Math.max(0, home),
    rezultatGost: Math.max(0, away)
  };
}

function generateTeamStats(goalsFor, goalsAgainst, isHome, seed) {
  const possessionBase = 50 + (goalsFor - goalsAgainst) * 4 + (isHome ? 3 : -3);
  const possessionNoise = Math.floor(randomUnit(seed, 'possession') * 9) - 4;
  const possession = Math.max(35, Math.min(65, Math.round(possessionBase + possessionNoise)));
  const assists = Math.max(0, goalsFor - (randomUnit(seed, 'assist-drop') < 0.28 ? 1 : 0));
  const yellowCards = Math.floor(randomUnit(seed, 'yellow') * 4);
  const redCards = randomUnit(seed, 'red') < 0.04 ? 1 : 0;
  const fouls = 7 + Math.floor(randomUnit(seed, 'fouls') * 13) + yellowCards + redCards * 2;

  return {
    goals: goalsFor,
    assists: Math.min(assists, goalsFor),
    yellowCards,
    redCards,
    fouls: Math.min(fouls, 22),
    possession
  };
}

function roundRobin(teams, seasonStart) {
  const matches = [];
  const slots = [...teams];

  if (slots.length % 2 !== 0) slots.push(null);

  const fixed = slots[0];
  let rotating = slots.slice(1);
  const rounds = slots.length - 1;

  for (let round = 0; round < rounds; round += 1) {
    const current = [fixed, ...rotating];
    let dailyMatchIndex = 0;

    for (let i = 0; i < current.length / 2; i += 1) {
      const first = current[i];
      const second = current[current.length - 1 - i];
      if (!first || !second) continue;

      const flip = round % 2 === 1;
      const home = flip ? second : first;
      const away = flip ? first : second;
      const kickoff = new Date(seasonStart);
      kickoff.setUTCDate(seasonStart.getUTCDate() + round * 7);
      kickoff.setUTCHours(15 + dailyMatchIndex * 2, 0, 0, 0);

      matches.push({
        round,
        matchIndex: dailyMatchIndex,
        domaciTim: home,
        gostujuciTim: away,
        vrijemePocetka: kickoff
      });
      dailyMatchIndex += 1;
    }

    rotating = [
      rotating[rotating.length - 1],
      ...rotating.slice(0, rotating.length - 1)
    ];
  }

  return matches;
}

async function findOrganizer() {
  const organizer = await prisma.korisnik.findFirst({
    where: { uloga: 'ORGANIZATOR' },
    orderBy: { korisnikId: 'asc' }
  });

  if (organizer) return organizer;

  return prisma.korisnik.findFirst({
    where: { uloga: 'ADMINISTRATOR' },
    orderBy: { korisnikId: 'asc' }
  });
}

async function ensureCompetition(season, sportId, organizerId) {
  const existing = await prisma.takmicenje.findFirst({
    where: {
      naziv: season.naziv,
      sezona: season.sezona,
      sportId
    }
  });

  if (existing) {
    summary.existing.competitions += 1;
    summary.competitions.push({
      takmicenjeId: existing.takmicenjeId,
      naziv: existing.naziv,
      sezona: existing.sezona,
      action: 'existing'
    });
    return existing;
  }

  summary.created.competitions += 1;
  summary.competitions.push({
    takmicenjeId: APPLY ? undefined : '(dry-run)',
    naziv: season.naziv,
    sezona: season.sezona,
    action: 'create'
  });

  if (!APPLY) {
    return {
      takmicenjeId: `dry-${season.sezona}`,
      naziv: season.naziv,
      sezona: season.sezona,
      sportId,
      organizatorId: organizerId
    };
  }

  return prisma.takmicenje.create({
    data: {
      naziv: season.naziv,
      sezona: season.sezona,
      sportId,
      organizatorId: organizerId,
      status: 'ZAVRSENA',
      opis: 'Historijski dataset generisan za AI trening predikcija utakmica.',
      datumPocetka: season.start,
      datumZavrsetka: new Date(new Date(season.start).setUTCDate(season.start.getUTCDate() + 70)),
      tipTakmicenja: 'Liga'
    }
  });
}

async function ensureParticipation(takmicenje, tim, organizerId) {
  const existing = typeof takmicenje.takmicenjeId === 'number'
    ? await prisma.ucesceUTakmicenju.findFirst({
      where: {
        takmicenjeId: takmicenje.takmicenjeId,
        timId: tim.timId
      }
    })
    : null;

  if (existing) {
    summary.existing.participations += 1;
    return existing;
  }

  summary.created.participations += 1;

  if (!APPLY) return null;

  return prisma.ucesceUTakmicenju.create({
    data: {
      takmicenjeId: takmicenje.takmicenjeId,
      timId: tim.timId,
      prijavioKorisnikId: organizerId,
      statusPrijave: 'ODOBRENA',
      datumOdobrenja: new Date()
    }
  });
}

async function ensureMatch(takmicenje, match) {
  const existing = typeof takmicenje.takmicenjeId === 'number'
    ? await prisma.utakmica.findFirst({
      where: {
        takmicenjeId: takmicenje.takmicenjeId,
        domaciTimId: match.domaciTim.timId,
        gostujuciTimId: match.gostujuciTim.timId,
        vrijemePocetka: match.vrijemePocetka
      }
    })
    : null;

  if (existing) {
    summary.existing.matches += 1;
    return existing;
  }

  summary.created.matches += 1;

  if (!APPLY) {
    return {
      utakmicaId: `dry-${takmicenje.takmicenjeId}-${match.domaciTim.timId}-${match.gostujuciTim.timId}-${match.round}`,
      takmicenjeId: takmicenje.takmicenjeId,
      domaciTimId: match.domaciTim.timId,
      gostujuciTimId: match.gostujuciTim.timId
    };
  }

  return prisma.utakmica.create({
    data: {
      takmicenjeId: takmicenje.takmicenjeId,
      domaciTimId: match.domaciTim.timId,
      gostujuciTimId: match.gostujuciTim.timId,
      vrijemePocetka: match.vrijemePocetka,
      vrijemeZavrsetka: new Date(match.vrijemePocetka.getTime() + 105 * 60 * 1000),
      status: 'Zavrseno',
      lokacijaOpis: 'AI historijski stadion'
    }
  });
}

async function ensureResult(utakmica, score, organizerId) {
  const existing = typeof utakmica.utakmicaId === 'number'
    ? await prisma.rezultatUtakmice.findUnique({
      where: { utakmicaId: utakmica.utakmicaId }
    })
    : null;

  if (existing) {
    summary.existing.results += 1;
    return existing;
  }

  summary.created.results += 1;

  if (!APPLY) return null;

  return prisma.rezultatUtakmice.create({
    data: {
      utakmicaId: utakmica.utakmicaId,
      rezultatDomacin: score.rezultatDomacin,
      rezultatGost: score.rezultatGost,
      unioKorisnikId: organizerId,
      datumUnosa: new Date(utakmica.vrijemePocetka.getTime() + 120 * 60 * 1000)
    }
  });
}

async function ensureTeamStats(utakmica, timId) {
  const existing = typeof utakmica.utakmicaId === 'number'
    ? await prisma.statistikaTimaNaUtakmici.findFirst({
      where: {
        utakmicaId: utakmica.utakmicaId,
        timId
      }
    })
    : null;

  if (existing) {
    summary.existing.teamStats += 1;
    return existing;
  }

  summary.created.teamStats += 1;

  if (!APPLY) {
    return {
      statistikaTimaId: `dry-${utakmica.utakmicaId}-${timId}`,
      utakmicaId: utakmica.utakmicaId,
      timId
    };
  }

  return prisma.statistikaTimaNaUtakmici.create({
    data: {
      utakmicaId: utakmica.utakmicaId,
      timId
    }
  });
}

async function ensureTeamStatValue(statistikaTima, tipStatistikeId, vrijednost) {
  const existing = typeof statistikaTima.statistikaTimaId === 'number'
    ? await prisma.vrijednostStatistikeTima.findFirst({
      where: {
        statistikaTimaId: statistikaTima.statistikaTimaId,
        tipStatistikeId
      }
    })
    : null;

  if (existing) {
    summary.existing.teamStatValues += 1;
    return existing;
  }

  summary.created.teamStatValues += 1;

  if (!APPLY) return null;

  return prisma.vrijednostStatistikeTima.create({
    data: {
      statistikaTimaId: statistikaTima.statistikaTimaId,
      tipStatistikeId,
      vrijednost
    }
  });
}

function applyScoreToTable(table, timId, goalsFor, goalsAgainst) {
  const row = table.get(timId) || {
    timId,
    brojPobjeda: 0,
    brojNerijesenih: 0,
    brojPoraza: 0,
    ukupniBodovi: 0,
    datiGolovi: 0,
    primljeniGolovi: 0,
    golRazlika: 0
  };

  if (goalsFor > goalsAgainst) {
    row.brojPobjeda += 1;
    row.ukupniBodovi += 3;
  } else if (goalsFor === goalsAgainst) {
    row.brojNerijesenih += 1;
    row.ukupniBodovi += 1;
  } else {
    row.brojPoraza += 1;
  }

  row.datiGolovi += goalsFor;
  row.primljeniGolovi += goalsAgainst;
  row.golRazlika = row.datiGolovi - row.primljeniGolovi;
  table.set(timId, row);
}

async function ensureStandings(takmicenje, table) {
  const sorted = Array.from(table.values()).sort((a, b) => {
    if (b.ukupniBodovi !== a.ukupniBodovi) return b.ukupniBodovi - a.ukupniBodovi;
    if (b.golRazlika !== a.golRazlika) return b.golRazlika - a.golRazlika;
    if (b.datiGolovi !== a.datiGolovi) return b.datiGolovi - a.datiGolovi;
    return a.timId - b.timId;
  });

  for (let index = 0; index < sorted.length; index += 1) {
    const row = sorted[index];
    const existing = typeof takmicenje.takmicenjeId === 'number'
      ? await prisma.plasmanNaTabeli.findFirst({
        where: {
          takmicenjeId: takmicenje.takmicenjeId,
          timId: row.timId
        }
      })
      : null;

    if (existing) {
      summary.existing.standings += 1;

      if (APPLY) {
        await prisma.plasmanNaTabeli.update({
          where: { plasmanNaTabeliId: existing.plasmanNaTabeliId },
          data: {
            brojPobjeda: row.brojPobjeda,
            brojNerijesenih: row.brojNerijesenih,
            brojPoraza: row.brojPoraza,
            ukupniBodovi: row.ukupniBodovi,
            trenutnaPozicija: index + 1
          }
        });
      }
    } else {
      summary.created.standings += 1;

      if (APPLY) {
        await prisma.plasmanNaTabeli.create({
          data: {
            takmicenjeId: takmicenje.takmicenjeId,
            timId: row.timId,
            brojPobjeda: row.brojPobjeda,
            brojNerijesenih: row.brojNerijesenih,
            brojPoraza: row.brojPoraza,
            ukupniBodovi: row.ukupniBodovi,
            trenutnaPozicija: index + 1
          }
        });
      }
    }
  }
}

async function main() {
  const football = await prisma.sport.findFirst({
    where: { naziv: { contains: 'fudbal', mode: 'insensitive' } }
  });

  if (!football) {
    throw new Error('Sport Fudbal nije pronađen. Prekidam bez izmjena.');
  }

  const organizer = await findOrganizer();
  if (!organizer) {
    throw new Error('Nema ORGANIZATOR ili ADMINISTRATOR korisnika za FK polja. Prekidam bez izmjena.');
  }

  const teams = await prisma.tim.findMany({
    where: {
      sportId: football.sportId,
      naziv: {
        in: [...TEAM_TIERS.strong, ...TEAM_TIERS.middle, ...TEAM_TIERS.weak]
      }
    },
    orderBy: { timId: 'asc' }
  });

  if (teams.length < 8) {
    throw new Error(`Pronađeno je samo ${teams.length} fudbalskih timova. Ova skripta ne kreira dodatne timove automatski.`);
  }

  const selectedTeams = teams.slice(0, 10);
  const missingTeams = [...TEAM_TIERS.strong, ...TEAM_TIERS.middle, ...TEAM_TIERS.weak]
    .filter((name) => !selectedTeams.some((team) => team.naziv === name));

  if (missingTeams.length > 0) {
    summary.warnings.push(`Nisu pronađeni svi planirani timovi: ${missingTeams.join(', ')}`);
  }

  const statTypes = await prisma.tipStatistike.findMany({
    where: { sportId: football.sportId }
  });
  const statByName = new Map(statTypes.map((type) => [normalize(type.nazivStatistike), type]));
  const missingStats = REQUIRED_FOOTBALL_STATS.filter((name) => !statByName.has(normalize(name)));

  if (missingStats.length > 0) {
    throw new Error(`Nedostaju fudbalski TipStatistike zapisi: ${missingStats.join(', ')}. Prekidam bez izmjena.`);
  }

  for (let seasonIndex = 0; seasonIndex < SEASONS.length; seasonIndex += 1) {
    const season = SEASONS[seasonIndex];
    const takmicenje = await ensureCompetition(season, football.sportId, organizer.korisnikId);

    for (const tim of selectedTeams) {
      await ensureParticipation(takmicenje, tim, organizer.korisnikId);
    }

    const table = new Map(selectedTeams.map((tim) => [tim.timId, {
      timId: tim.timId,
      brojPobjeda: 0,
      brojNerijesenih: 0,
      brojPoraza: 0,
      ukupniBodovi: 0,
      datiGolovi: 0,
      primljeniGolovi: 0,
      golRazlika: 0
    }]));

    const matches = roundRobin(selectedTeams, season.start);

    for (const match of matches) {
      const score = generateScore(match.domaciTim, match.gostujuciTim, seasonIndex, match.round, match.matchIndex);
      const utakmica = await ensureMatch(takmicenje, match);
      await ensureResult(utakmica, score, organizer.korisnikId);

      const homeStats = generateTeamStats(
        score.rezultatDomacin,
        score.rezultatGost,
        true,
        `${season.sezona}-${match.round}-${match.matchIndex}-home`
      );
      const awayStats = generateTeamStats(
        score.rezultatGost,
        score.rezultatDomacin,
        false,
        `${season.sezona}-${match.round}-${match.matchIndex}-away`
      );
      awayStats.possession = 100 - homeStats.possession;

      const homeStatRecord = await ensureTeamStats(utakmica, match.domaciTim.timId);
      const awayStatRecord = await ensureTeamStats(utakmica, match.gostujuciTim.timId);

      const statPayloads = [
        [homeStatRecord, homeStats],
        [awayStatRecord, awayStats]
      ];

      for (const [record, values] of statPayloads) {
        await ensureTeamStatValue(record, statByName.get(normalize('Golovi')).tipStatistikeId, values.goals);
        await ensureTeamStatValue(record, statByName.get(normalize('Asistencije')).tipStatistikeId, values.assists);
        await ensureTeamStatValue(record, statByName.get(normalize('Zuti kartoni')).tipStatistikeId, values.yellowCards);
        await ensureTeamStatValue(record, statByName.get(normalize('Crveni kartoni')).tipStatistikeId, values.redCards);
        await ensureTeamStatValue(record, statByName.get(normalize('Prekrsaji')).tipStatistikeId, values.fouls);
        await ensureTeamStatValue(record, statByName.get(normalize('Posjed lopte')).tipStatistikeId, values.possession);
      }

      applyScoreToTable(table, match.domaciTim.timId, score.rezultatDomacin, score.rezultatGost);
      applyScoreToTable(table, match.gostujuciTim.timId, score.rezultatGost, score.rezultatDomacin);
    }

    await ensureStandings(takmicenje, table);
  }

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
