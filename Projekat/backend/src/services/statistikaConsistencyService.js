function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizeName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function classifyTip(nazivStatistike) {
  const naziv = normalizeName(nazivStatistike);

  if (naziv.includes('asist')) return 'assists';
  if (naziv.includes('zuti') && naziv.includes('kart')) return 'yellowCards';
  if (naziv.includes('crveni') && naziv.includes('kart')) return 'redCards';
  if (naziv.includes('gol')) return 'goals';

  return null;
}

function emptyTotals() {
  return {
    playerGoals: 0,
    playerAssists: 0,
    playerYellowCards: 0,
    playerRedCards: 0,
    teamGoals: null,
    teamAssists: null,
    teamYellowCards: null,
    teamRedCards: null
  };
}

function addValue(current, value) {
  const parsed = Number(value);
  return current + (Number.isFinite(parsed) ? parsed : 0);
}

function setTeamTotal(current, value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return current;
  return current === null ? parsed : current + parsed;
}

function getResultGoals(utakmica, timId, overrideResult) {
  if (!overrideResult && !utakmica.rezultatUtakmice) return null;

  const rezultatDomacin = overrideResult?.rezultatDomacin ?? utakmica.rezultatUtakmice?.rezultatDomacin;
  const rezultatGost = overrideResult?.rezultatGost ?? utakmica.rezultatUtakmice?.rezultatGost;

  if (utakmica.domaciTimId === timId) return Number(rezultatDomacin);
  if (utakmica.gostujuciTimId === timId) return Number(rezultatGost);

  return null;
}

async function validateStatistikaKonzistentnost(tx, utakmicaId, overrideResult = null) {
  const utakmica = await tx.utakmica.findUnique({
    where: { utakmicaId },
    include: {
      rezultatUtakmice: true,
      statistikeIgraca: {
        include: {
          vrijednosti: { include: { tipStatistike: true } }
        }
      },
      statistikeTimova: {
        include: {
          vrijednosti: { include: { tipStatistike: true } }
        }
      }
    }
  });

  if (!utakmica) {
    throw validationError('Utakmica nije pronadjena.');
  }

  const totalsByTeam = new Map([
    [utakmica.domaciTimId, emptyTotals()],
    [utakmica.gostujuciTimId, emptyTotals()]
  ]);

  for (const statistika of utakmica.statistikeIgraca || []) {
    const totals = totalsByTeam.get(statistika.timId);
    if (!totals) continue;

    for (const vrijednost of statistika.vrijednosti || []) {
      const category = classifyTip(vrijednost.tipStatistike?.nazivStatistike);
      if (category === 'goals') totals.playerGoals = addValue(totals.playerGoals, vrijednost.vrijednost);
      if (category === 'assists') totals.playerAssists = addValue(totals.playerAssists, vrijednost.vrijednost);
      if (category === 'yellowCards') totals.playerYellowCards = addValue(totals.playerYellowCards, vrijednost.vrijednost);
      if (category === 'redCards') totals.playerRedCards = addValue(totals.playerRedCards, vrijednost.vrijednost);
    }
  }

  for (const statistika of utakmica.statistikeTimova || []) {
    const totals = totalsByTeam.get(statistika.timId);
    if (!totals) continue;

    for (const vrijednost of statistika.vrijednosti || []) {
      const category = classifyTip(vrijednost.tipStatistike?.nazivStatistike);
      if (category === 'goals') totals.teamGoals = setTeamTotal(totals.teamGoals, vrijednost.vrijednost);
      if (category === 'assists') totals.teamAssists = setTeamTotal(totals.teamAssists, vrijednost.vrijednost);
      if (category === 'yellowCards') totals.teamYellowCards = setTeamTotal(totals.teamYellowCards, vrijednost.vrijednost);
      if (category === 'redCards') totals.teamRedCards = setTeamTotal(totals.teamRedCards, vrijednost.vrijednost);
    }
  }

  for (const [timId, totals] of totalsByTeam.entries()) {
    const resultGoals = getResultGoals(utakmica, timId, overrideResult);

    if (resultGoals !== null) {
      if (totals.playerGoals > resultGoals) {
        throw validationError('Zbir golova igraca ne moze biti veci od rezultata tima.');
      }

      if (totals.playerAssists > resultGoals) {
        throw validationError('Broj asistencija ne moze biti veci od broja golova tima.');
      }

      if (totals.teamGoals !== null && totals.teamGoals > resultGoals) {
        throw validationError('Timski golovi ne mogu biti veci od rezultata tima.');
      }

      if (totals.teamAssists !== null && totals.teamAssists > resultGoals) {
        throw validationError('Timske asistencije ne mogu biti vece od broja golova tima.');
      }
    }

    if (totals.teamGoals !== null && totals.playerGoals > totals.teamGoals) {
      throw validationError('Zbir golova igraca ne moze biti veci od timskih golova.');
    }

    if (totals.teamAssists !== null && totals.playerAssists > totals.teamAssists) {
      throw validationError('Zbir asistencija igraca ne moze biti veci od timskih asistencija.');
    }

    if (totals.teamYellowCards !== null && totals.playerYellowCards > totals.teamYellowCards) {
      throw validationError('Zbir zutih kartona igraca ne moze biti veci od timskih zutih kartona.');
    }

    if (totals.teamRedCards !== null && totals.playerRedCards > totals.teamRedCards) {
      throw validationError('Zbir crvenih kartona igraca ne moze biti veci od timskih crvenih kartona.');
    }
  }
}

module.exports = {
  classifyTip,
  validateStatistikaKonzistentnost
};
