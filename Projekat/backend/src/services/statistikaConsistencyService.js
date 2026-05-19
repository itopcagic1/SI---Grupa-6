const { classifyStatistikaTip, getSportKey } = require('../utils/statistikaMeta');

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function emptyTotals() {
  return {
    player: {},
    team: {}
  };
}

function addToBucket(bucket, category, value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return;
  bucket[category] = (bucket[category] || 0) + parsed;
}

function getTotal(bucket, category) {
  return Number(bucket[category] || 0);
}

function hasTotal(bucket, category) {
  return Object.prototype.hasOwnProperty.call(bucket, category);
}

function getResultScoreForTeam(utakmica, timId, overrideResult) {
  if (!overrideResult && !utakmica.rezultatUtakmice) return null;

  const rezultatDomacin = overrideResult?.rezultatDomacin ?? utakmica.rezultatUtakmice?.rezultatDomacin;
  const rezultatGost = overrideResult?.rezultatGost ?? utakmica.rezultatUtakmice?.rezultatGost;

  if (utakmica.domaciTimId === timId) return Number(rezultatDomacin);
  if (utakmica.gostujuciTimId === timId) return Number(rezultatGost);

  return null;
}

function getResultCategoryForSport(sportKey) {
  if (['football', 'handball', 'iceHockey'].includes(sportKey)) return 'goals';
  if (sportKey === 'basketball') return 'points';
  return null;
}

function assertMax(value, max, message) {
  if (value > max) {
    throw validationError(message);
  }
}

function assertMinExclusive(value, min, message) {
  if (value <= min) {
    throw validationError(message);
  }
}

function validateIndividualValue({ sportKey, scope, category, value }) {
  if (!Number.isFinite(value) || value < 0) {
    throw validationError('Vrijednost statistike mora biti nenegativan broj.');
  }

  const isInteger = Number.isInteger(value);
  if (scope === 'player') {
    if (sportKey === 'football' && category === 'redCards' && ![0, 1].includes(value)) {
      throw validationError('Crveni karton za igraca moze biti samo 0 ili 1.');
    }
    if (sportKey === 'football' && category === 'yellowCards' && ![0, 1, 2].includes(value)) {
      throw validationError('Zuti kartoni za igraca mogu biti samo 0, 1 ili 2.');
    }
    if (sportKey === 'handball' && category === 'redCards' && ![0, 1].includes(value)) {
      throw validationError('Crveni karton za igraca moze biti samo 0 ili 1.');
    }
    if (sportKey === 'handball' && category === 'yellowCards' && ![0, 1, 2].includes(value)) {
      throw validationError('Zuti kartoni za igraca mogu biti samo 0, 1 ili 2.');
    }
    if (sportKey === 'basketball' && category === 'fouls' && value > 6) {
      throw validationError('Licne greske igraca u kosarci ne mogu biti vece od 6.');
    }
    if (sportKey === 'swimming' && category === 'position') {
      if (!isInteger || value <= 0) {
        throw validationError('Pozicija u plivanju mora biti pozitivan cijeli broj.');
      }
    }
    if (sportKey === 'swimming' && category === 'raceTime') {
      assertMinExclusive(value, 0, 'Vrijeme trke mora biti pozitivan broj.');
    }
    if (sportKey === 'swimming' && category === 'personalBestIndicator' && ![0, 1].includes(value)) {
      throw validationError('Indikator licnog rekorda mora biti 0 ili 1.');
    }
  }

  if (scope === 'team') {
    if (sportKey === 'football' && category === 'yellowCards') {
      assertMax(value, 11, 'Timski zuti kartoni u fudbalu ne mogu biti veci od 11.');
    }
    if (sportKey === 'football' && category === 'redCards') {
      assertMax(value, 4, 'Timski crveni kartoni u fudbalu ne mogu biti veci od 4.');
    }
    if (sportKey === 'handball' && category === 'yellowCards') {
      assertMax(value, 11, 'Timski zuti kartoni u rukometu ne mogu biti veci od 11.');
    }
    if (sportKey === 'handball' && category === 'redCards') {
      assertMax(value, 4, 'Timski crveni kartoni u rukometu ne mogu biti veci od 4.');
    }
    if (sportKey === 'basketball' && category === 'fouls') {
      assertMax(value, 40, 'Timski prekrsaji u kosarci ne mogu biti veci od 40.');
    }
    if (category === 'possession') {
      if (!isInteger || value < 0 || value > 100) {
        throw validationError('Posjed lopte mora biti cijeli broj izmedju 0 i 100.');
      }
    }
    if (sportKey === 'swimming' && category === 'medalsWon' && value < 0) {
      throw validationError('Broj medalja ne moze biti negativan.');
    }
  }
}

function assertPlayerTotalNotGreaterThanTeamTotal(teamTotals, category, message) {
  if (hasTotal(teamTotals.team, category) && getTotal(teamTotals.player, category) > getTotal(teamTotals.team, category)) {
    throw validationError(message);
  }
}

function validateSportTotals(sportKey, totalsByTeam, utakmica, overrideResult) {
  const resultCategory = getResultCategoryForSport(sportKey) || 'goals';
  const allTeamTotals = Array.from(totalsByTeam.entries());

  for (const [timId, totals] of allTeamTotals) {
    const playerGoals = getTotal(totals.player, 'goals');
    const playerAssists = getTotal(totals.player, 'assists');
    const teamGoals = getTotal(totals.team, 'goals');
    const teamAssists = getTotal(totals.team, 'assists');
    const resultValue = resultCategory ? getResultScoreForTeam(utakmica, timId, overrideResult) : null;

    if (sportKey === 'football') {
      if (resultValue !== null) {
        if (playerGoals > resultValue) throw validationError('Zbir golova igraca ne moze biti veci od rezultata tima.');
        if (playerAssists > resultValue) throw validationError('Broj asistencija ne moze biti veci od broja golova tima.');
        if (hasTotal(totals.team, 'goals') && teamGoals > resultValue) {
          throw validationError('Timski golovi ne mogu biti veci od rezultata tima.');
        }
        if (hasTotal(totals.team, 'assists') && teamAssists > resultValue) {
          throw validationError('Timske asistencije ne mogu biti vece od broja golova tima.');
        }
      }

      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'goals', 'Zbir golova igraca ne moze biti veci od timskih golova.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'assists', 'Zbir asistencija igraca ne moze biti veci od timskih asistencija.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'yellowCards', 'Zbir zutih kartona igraca ne moze biti veci od timskih zutih kartona.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'redCards', 'Zbir crvenih kartona igraca ne moze biti veci od timskih crvenih kartona.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'penaltyGoals', 'Zbir golova iz penala igraca ne moze biti veci od timskih golova iz penala.');
    }

    if (sportKey === 'unknown') {
      if (resultValue !== null) {
        if (playerGoals > resultValue) throw validationError('Zbir golova igraca ne moze biti veci od rezultata tima.');
        if (playerAssists > resultValue) throw validationError('Broj asistencija ne moze biti veci od broja golova tima.');
        if (hasTotal(totals.team, 'goals') && teamGoals > resultValue) {
          throw validationError('Timski golovi ne mogu biti veci od rezultata tima.');
        }
        if (hasTotal(totals.team, 'assists') && teamAssists > resultValue) {
          throw validationError('Timske asistencije ne mogu biti vece od broja golova tima.');
        }
      }

      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'goals', 'Zbir golova igraca ne moze biti veci od timskih golova.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'assists', 'Zbir asistencija igraca ne moze biti veci od timskih asistencija.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'yellowCards', 'Zbir zutih kartona igraca ne moze biti veci od timskih zutih kartona.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'redCards', 'Zbir crvenih kartona igraca ne moze biti veci od timskih crvenih kartona.');
    }

    if (sportKey === 'basketball') {
      if (resultValue !== null) {
        if (getTotal(totals.player, 'points') > resultValue) throw validationError('Zbir poena igraca ne moze biti veci od rezultata tima.');
        if (hasTotal(totals.team, 'points') && getTotal(totals.team, 'points') > resultValue) {
          throw validationError('Timski poeni ne mogu biti veci od rezultata tima.');
        }
      }

      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'points', 'Zbir poena igraca ne moze biti veci od timskih poena.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'assists', 'Zbir asistencija igraca ne moze biti veci od timskih asistencija.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'rebounds', 'Zbir skokova igraca ne moze biti veci od timskih skokova.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'fouls', 'Zbir prekrsaja igraca ne moze biti veci od timskih prekrsaja.');
    }

    if (sportKey === 'volleyball') {
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'points', 'Zbir poena igraca ne moze biti veci od timskih poena.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'aces', 'Zbir aseva igraca ne moze biti veci od timskih aseva.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'blocks', 'Zbir blokova igraca ne moze biti veci od timskih blokova.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'errors', 'Zbir gresaka igraca ne moze biti veci od timskih gresaka.');
    }

    if (sportKey === 'tennis') {
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'aces', 'Zbir aseva igraca ne moze biti veci od timskih aseva.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'doubleFaults', 'Zbir duplih gresaka igraca ne moze biti veci od timskih duplih gresaka.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'winners', 'Zbir winnera igraca ne moze biti veci od timskih winnera.');
    }

    if (sportKey === 'handball') {
      if (resultValue !== null) {
        if (getTotal(totals.player, 'goals') > resultValue) throw validationError('Zbir golova igraca ne moze biti veci od rezultata tima.');
        if (hasTotal(totals.team, 'goals') && getTotal(totals.team, 'goals') > resultValue) {
          throw validationError('Timski golovi ne mogu biti veci od rezultata tima.');
        }
      }

      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'goals', 'Zbir golova igraca ne moze biti veci od timskih golova.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'assists', 'Zbir asistencija igraca ne moze biti veci od timskih asistencija.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'saves', 'Zbir odbrana igraca ne moze biti veci od timskih odbrana.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'fouls', 'Zbir prekrsaja igraca ne moze biti veci od timskih prekrsaja.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'yellowCards', 'Zbir zutih kartona igraca ne moze biti veci od timskih zutih kartona.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'redCards', 'Zbir crvenih kartona igraca ne moze biti veci od timskih crvenih kartona.');
    }

    if (sportKey === 'iceHockey') {
      if (resultValue !== null) {
        if (getTotal(totals.player, 'goals') > resultValue) throw validationError('Zbir golova igraca ne moze biti veci od rezultata tima.');
        if (hasTotal(totals.team, 'goals') && getTotal(totals.team, 'goals') > resultValue) {
          throw validationError('Timski golovi ne mogu biti veci od rezultata tima.');
        }
      }

      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'goals', 'Zbir golova igraca ne moze biti veci od timskih golova.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'penaltyMinutes', 'Zbir kaznenih minuta igraca ne moze biti veci od timskih kaznenih minuta.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'shotsOnGoal', 'Zbir suteva na gol igraca ne moze biti veci od timskih suteva na gol.');
      assertPlayerTotalNotGreaterThanTeamTotal(totals, 'saves', 'Zbir odbrana igraca ne moze biti veci od timskih odbrana.');
    }
  }

  if (sportKey === 'football') {
    const [firstTeam] = allTeamTotals;
    const [secondTeam] = allTeamTotals.slice(1);
    const firstHas = firstTeam ? hasTotal(firstTeam[1].team, 'possession') : false;
    const secondHas = secondTeam ? hasTotal(secondTeam[1].team, 'possession') : false;

    if (firstHas && secondHas) {
      const sum = getTotal(firstTeam[1].team, 'possession') + getTotal(secondTeam[1].team, 'possession');
      if (Math.abs(sum - 100) > 1) {
        throw validationError('Posjed lopte oba tima zajedno mora biti priblizno 100%.');
      }
    }
  }
}

async function validateStatistikaKonzistentnost(tx, utakmicaId, overrideResult = null) {
  const utakmica = await tx.utakmica.findUnique({
    where: { utakmicaId },
    include: {
      takmicenje: {
        select: {
          sport: {
            select: {
              naziv: true
            }
          }
        }
      },
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

  const sportKey = getSportKey(utakmica.takmicenje?.sport?.naziv);
  const totalsByTeam = new Map([
    [utakmica.domaciTimId, emptyTotals()],
    [utakmica.gostujuciTimId, emptyTotals()]
  ]);

  for (const statistika of utakmica.statistikeIgraca || []) {
    const totals = totalsByTeam.get(statistika.timId);
    if (!totals) continue;

    for (const vrijednost of statistika.vrijednosti || []) {
      const category = classifyStatistikaTip(vrijednost.tipStatistike?.nazivStatistike);
      const parsedValue = Number(vrijednost.vrijednost);

      validateIndividualValue({
        sportKey,
        scope: 'player',
        category,
        value: parsedValue
      });

      if (category !== 'other') {
        addToBucket(totals.player, category, parsedValue);
      }
    }
  }

  for (const statistika of utakmica.statistikeTimova || []) {
    const totals = totalsByTeam.get(statistika.timId);
    if (!totals) continue;

    for (const vrijednost of statistika.vrijednosti || []) {
      const category = classifyStatistikaTip(vrijednost.tipStatistike?.nazivStatistike);
      const parsedValue = Number(vrijednost.vrijednost);

      validateIndividualValue({
        sportKey,
        scope: 'team',
        category,
        value: parsedValue
      });

      if (category !== 'other') {
        addToBucket(totals.team, category, parsedValue);
      }
    }
  }

  validateSportTotals(sportKey, totalsByTeam, utakmica, overrideResult);
}

module.exports = {
  classifyTip: classifyStatistikaTip,
  validateStatistikaKonzistentnost
};
