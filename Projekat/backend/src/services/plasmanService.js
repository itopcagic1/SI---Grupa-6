function calculatePoints(goalsFor, goalsAgainst) {
  if (goalsFor > goalsAgainst) {
    return { points: 3, win: 1, draw: 0, loss: 0 };
  }

  if (goalsFor === goalsAgainst) {
    return { points: 1, win: 0, draw: 1, loss: 0 };
  }

  return { points: 0, win: 0, draw: 0, loss: 1 };
}

function createEmptyStats(timId) {
  return {
    timId,
    brojPobjeda: 0,
    brojNerijesenih: 0,
    brojPoraza: 0,
    ukupniBodovi: 0,
    datiGolovi: 0,
    primljeniGolovi: 0,
    golRazlika: 0
  };
}

async function recomputeTabelaZaTakmicenje(tx, takmicenjeId) {
  const takmicenjeIdNumber = Number(takmicenjeId);

  // 1. Dohvati sve timove koji učestvuju u ligi
  const ucesca = await tx.ucesceUTakmicenju.findMany({
    where: { takmicenjeId: takmicenjeIdNumber },
    select: {
      timId: true
    }
  });

  const tabelaMap = new Map();

  for (const ucesce of ucesca) {
    tabelaMap.set(ucesce.timId, createEmptyStats(ucesce.timId));
  }

  // 2. Dohvati sve utakmice ove lige koje imaju unesen rezultat
  const utakmice = await tx.utakmica.findMany({
    where: {
      takmicenjeId: takmicenjeIdNumber
    },
    include: {
      rezultatUtakmice: true
    }
  });

  const utakmiceSaRezultatom = utakmice.filter(
    (utakmica) => utakmica.rezultatUtakmice
  );

  // 3. Izračunaj tabelu od nule
  for (const utakmica of utakmiceSaRezultatom) {
    const domaciTimId = utakmica.domaciTimId;
    const gostujuciTimId = utakmica.gostujuciTimId;

    if (!tabelaMap.has(domaciTimId)) {
      tabelaMap.set(domaciTimId, createEmptyStats(domaciTimId));
    }

    if (!tabelaMap.has(gostujuciTimId)) {
      tabelaMap.set(gostujuciTimId, createEmptyStats(gostujuciTimId));
    }

    const domacin = tabelaMap.get(domaciTimId);
    const gost = tabelaMap.get(gostujuciTimId);

    const rezultatDomacin = utakmica.rezultatUtakmice.rezultatDomacin;
    const rezultatGost = utakmica.rezultatUtakmice.rezultatGost;

    const domacinStats = calculatePoints(rezultatDomacin, rezultatGost);
    const gostStats = calculatePoints(rezultatGost, rezultatDomacin);

    domacin.brojPobjeda += domacinStats.win;
    domacin.brojNerijesenih += domacinStats.draw;
    domacin.brojPoraza += domacinStats.loss;
    domacin.ukupniBodovi += domacinStats.points;
    domacin.datiGolovi += rezultatDomacin;
    domacin.primljeniGolovi += rezultatGost;
    domacin.golRazlika = domacin.datiGolovi - domacin.primljeniGolovi;

    gost.brojPobjeda += gostStats.win;
    gost.brojNerijesenih += gostStats.draw;
    gost.brojPoraza += gostStats.loss;
    gost.ukupniBodovi += gostStats.points;
    gost.datiGolovi += rezultatGost;
    gost.primljeniGolovi += rezultatDomacin;
    gost.golRazlika = gost.datiGolovi - gost.primljeniGolovi;
  }

  // 4. Sortiraj tabelu odmah nakon svakog unosa rezultata
  const sortiranaTabela = Array.from(tabelaMap.values()).sort((a, b) => {
    if (b.ukupniBodovi !== a.ukupniBodovi) {
      return b.ukupniBodovi - a.ukupniBodovi;
    }

    if (b.golRazlika !== a.golRazlika) {
      return b.golRazlika - a.golRazlika;
    }

    if (b.datiGolovi !== a.datiGolovi) {
      return b.datiGolovi - a.datiGolovi;
    }

    return a.timId - b.timId;
  });

  // 5. Obriši stare plasmane
  await tx.plasmanNaTabeli.deleteMany({
    where: { takmicenjeId: takmicenjeIdNumber }
  });

  // 6. Upiši novu tabelu
  if (sortiranaTabela.length > 0) {
    await tx.plasmanNaTabeli.createMany({
      data: sortiranaTabela.map((tim, index) => ({
        takmicenjeId: takmicenjeIdNumber,
        timId: tim.timId,
        trenutnaPozicija: index + 1,
        brojPobjeda: tim.brojPobjeda,
        brojNerijesenih: tim.brojNerijesenih,
        brojPoraza: tim.brojPoraza,
        ukupniBodovi: tim.ukupniBodovi
      }))
    });
  }

  return sortiranaTabela;
}

// Ovu funkciju već poziva resultController.js.
// Ostavljamo isti naziv da ne moraš mijenjati controller.
async function applyMatchResultToTabela(tx, utakmica) {
  return recomputeTabelaZaTakmicenje(tx, utakmica.takmicenjeId);
}

module.exports = {
  calculatePoints,
  recomputeTabelaZaTakmicenje,
  applyMatchResultToTabela
};