const prisma = require('../config/db');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

function getWinningProbability(prediction, aiResponse) {
  if (prediction === 'HOME_WIN') return aiResponse.homeWinProbability;
  if (prediction === 'DRAW') return aiResponse.drawProbability;
  if (prediction === 'AWAY_WIN') return aiResponse.awayWinProbability;
  return null;
}

function buildExplanation(match, aiResponse) {
  return JSON.stringify({
    oznaka: 'AI generisana predikcija',
    prediction: aiResponse.prediction,
    homeWinProbability: aiResponse.homeWinProbability,
    drawProbability: aiResponse.drawProbability,
    awayWinProbability: aiResponse.awayWinProbability,
    faktori: [
      'Forma timova u prethodnim utakmicama',
      'Trenutni bodovi i pozicija na tabeli',
      'Međusobni omjer timova',
      'Statistike timova kao što su golovi, asistencije, kartoni i posjed lopte'
    ],
    timovi: {
      domacin: match.domaciTim?.naziv,
      gost: match.gostujuciTim?.naziv
    }
  });
}

async function generateMatchPrediction(matchId) {
  const utakmicaId = Number(matchId);

  if (!Number.isInteger(utakmicaId) || utakmicaId <= 0) {
    const error = new Error('ID utakmice nije ispravan.');
    error.status = 400;
    error.code = 'INVALID_MATCH_ID';
    throw error;
  }

  const match = await prisma.utakmica.findUnique({
    where: { utakmicaId },
    include: {
      domaciTim: { select: { timId: true, naziv: true } },
      gostujuciTim: { select: { timId: true, naziv: true } },
      rezultatUtakmice: true
    }
  });

  if (!match) {
    const error = new Error('Utakmica nije pronađena.');
    error.status = 404;
    error.code = 'MATCH_NOT_FOUND';
    throw error;
  }

  const response = await fetch(`${AI_SERVICE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ matchId: utakmicaId })
  });

  if (!response.ok) {
    const details = await response.text();
    const error = new Error(`AI servis nije uspio generisati predikciju. ${details}`);
    error.status = 502;
    error.code = 'AI_SERVICE_ERROR';
    throw error;
  }

  const aiResponse = await response.json();

  const confidence = getWinningProbability(aiResponse.prediction, aiResponse);

  const savedPrediction = await prisma.aIPredikcija.create({
    data: {
      takmicenjeId: match.takmicenjeId,
      utakmicaId: match.utakmicaId,
      predvidjeniIshod: aiResponse.prediction,
      vjerovatnoca: confidence,
      detaljnoObjasnjenje: buildExplanation(match, aiResponse)
    }
  });

  return {
    ...savedPrediction,
    parsedDetails: JSON.parse(savedPrediction.detaljnoObjasnjenje)
  };
}

async function getLatestMatchPrediction(matchId) {
  const utakmicaId = Number(matchId);

  return prisma.aIPredikcija.findFirst({
    where: { utakmicaId },
    orderBy: { vrijemeGenerisanja: 'desc' }
  });
}

function extractPredictionDetails(prediction) {
  if (!prediction?.detaljnoObjasnjenje) return null;

  try {
    return JSON.parse(prediction.detaljnoObjasnjenje);
  } catch {
    return null;
  }
}

function applyExpectedPoints(tableMap, utakmica, details) {
  const homeId = utakmica.domaciTimId;
  const awayId = utakmica.gostujuciTimId;

  const homeRow = tableMap.get(homeId);
  const awayRow = tableMap.get(awayId);

  if (!homeRow || !awayRow || !details) return;

  const homeWin = Number(details.homeWinProbability || 0);
  const draw = Number(details.drawProbability || 0);
  const awayWin = Number(details.awayWinProbability || 0);

  homeRow.predictedPoints += homeWin * 3 + draw * 1;
  awayRow.predictedPoints += awayWin * 3 + draw * 1;

  homeRow.aiMatches += 1;
  awayRow.aiMatches += 1;
}

async function generateLeaguePrediction(takmicenjeId) {
  const ligaId = Number(takmicenjeId);

  if (!Number.isInteger(ligaId) || ligaId <= 0) {
    const error = new Error('ID lige nije ispravan.');
    error.status = 400;
    error.code = 'INVALID_LEAGUE_ID';
    throw error;
  }

  const liga = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: ligaId },
    include: {
      ucesniciTakmicenja: {
        include: {
          tim: { select: { timId: true, naziv: true, logoUrl: true } }
        }
      },
      utakmice: {
        include: {
          domaciTim: { select: { timId: true, naziv: true } },
          gostujuciTim: { select: { timId: true, naziv: true } },
          rezultatUtakmice: true
        },
        orderBy: { vrijemePocetka: 'asc' }
      }
    }
  });

  if (!liga) {
    const error = new Error('Liga nije pronađena.');
    error.status = 404;
    error.code = 'LEAGUE_NOT_FOUND';
    throw error;
  }

  const tableMap = new Map();

  liga.ucesniciTakmicenja.forEach((ucesce) => {
    tableMap.set(ucesce.tim.timId, {
      timId: ucesce.tim.timId,
      naziv: ucesce.tim.naziv,
      logoUrl: ucesce.tim.logoUrl,
      currentPoints: 0,
      predictedPoints: 0,
      aiMatches: 0
    });
  });

  // prvo dodaj stvarne bodove iz već odigranih utakmica
  liga.utakmice.forEach((utakmica) => {
    const rezultat = utakmica.rezultatUtakmice;
    if (!rezultat) return;

    const homeRow = tableMap.get(utakmica.domaciTimId);
    const awayRow = tableMap.get(utakmica.gostujuciTimId);
    if (!homeRow || !awayRow) return;

    if (rezultat.rezultatDomacin > rezultat.rezultatGost) {
      homeRow.currentPoints += 3;
    } else if (rezultat.rezultatDomacin < rezultat.rezultatGost) {
      awayRow.currentPoints += 3;
    } else {
      homeRow.currentPoints += 1;
      awayRow.currentPoints += 1;
    }
  });

  const predictions = [];

  for (const utakmica of liga.utakmice) {
    let prediction = await getLatestMatchPrediction(utakmica.utakmicaId);

    // za utakmice bez postojeće predikcije generiši novu
    if (!prediction) {
      prediction = await generateMatchPrediction(utakmica.utakmicaId);
    }

    const details = prediction.parsedDetails || extractPredictionDetails(prediction);

    predictions.push({
      utakmicaId: utakmica.utakmicaId,
      domacin: utakmica.domaciTim?.naziv,
      gost: utakmica.gostujuciTim?.naziv,
      prediction: prediction.predvidjeniIshod,
      confidence: prediction.vjerovatnoca,
      vrijemeGenerisanja: prediction.vrijemeGenerisanja,
      homeWinProbability: details?.homeWinProbability ?? null,
      drawProbability: details?.drawProbability ?? null,
      awayWinProbability: details?.awayWinProbability ?? null,
      faktori: details?.faktori || []
    });

    // za finalnu tabelu koristi AI samo za utakmice koje još nemaju rezultat
    if (!utakmica.rezultatUtakmice) {
      applyExpectedPoints(tableMap, utakmica, details);
    }
  }

  const finalTable = Array.from(tableMap.values())
    .map((row) => ({
      ...row,
      predictedTotalPoints: Number((row.currentPoints + row.predictedPoints).toFixed(2))
    }))
    .sort((a, b) => {
      if (b.predictedTotalPoints !== a.predictedTotalPoints) {
        return b.predictedTotalPoints - a.predictedTotalPoints;
      }
      return a.naziv.localeCompare(b.naziv);
    })
    .map((row, index) => ({
      predictedPosition: index + 1,
      ...row
    }));

  return {
    takmicenjeId: liga.takmicenjeId,
    naziv: liga.naziv,
    oznaka: 'AI generisana predikcija',
    explanation:
      'Finalni poredak je izračunat kombinovanjem trenutnih bodova i očekivanih bodova iz AI vjerovatnoća za preostale utakmice.',
    predictions,
    finalTable
  };
}

module.exports = {
  generateMatchPrediction,
  getLatestMatchPrediction,
  generateLeaguePrediction
};