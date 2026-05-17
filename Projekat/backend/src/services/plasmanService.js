function calculatePoints(goalsFor, goalsAgainst) {
  if (goalsFor > goalsAgainst) return { points: 3, win: 1, draw: 0, loss: 0 };
  if (goalsFor === goalsAgainst) return { points: 1, win: 0, draw: 1, loss: 0 };
  return { points: 0, win: 0, draw: 0, loss: 1 };
}

async function updatePlasman(tx, takmicenjeId, timId, points, win, draw, loss) {
  const plasman = await tx.plasmanNaTabeli.findUnique({
    where: {
      timId_takmicenjeId: {
        timId,
        takmicenjeId
      }
    }
  });

  if (plasman) {
    return tx.plasmanNaTabeli.update({
      where: { plasmanNaTabeliId: plasman.plasmanNaTabeliId },
      data: {
        brojPobjeda: plasman.brojPobjeda + win,
        brojNerijesenih: plasman.brojNerijesenih + draw,
        brojPoraza: plasman.brojPoraza + loss,
        ukupniBodovi: plasman.ukupniBodovi + points
      }
    });
  }

  return tx.plasmanNaTabeli.create({
    data: {
      timId,
      takmicenjeId,
      brojPobjeda: win,
      brojNerijesenih: draw,
      brojPoraza: loss,
      ukupniBodovi: points
    }
  });
}

async function applyMatchResultToTabela(tx, utakmica, rezultatDomacin, rezultatGost, multiplier = 1) {
  const domacinStats = calculatePoints(rezultatDomacin, rezultatGost);
  const gostStats = calculatePoints(rezultatGost, rezultatDomacin);

  await updatePlasman(
    tx,
    utakmica.takmicenjeId,
    utakmica.domaciTimId,
    domacinStats.points * multiplier,
    domacinStats.win * multiplier,
    domacinStats.draw * multiplier,
    domacinStats.loss * multiplier
  );

  await updatePlasman(
    tx,
    utakmica.takmicenjeId,
    utakmica.gostujuciTimId,
    gostStats.points * multiplier,
    gostStats.win * multiplier,
    gostStats.draw * multiplier,
    gostStats.loss * multiplier
  );
}

module.exports = {
  calculatePoints,
  updatePlasman,
  applyMatchResultToTabela
};
