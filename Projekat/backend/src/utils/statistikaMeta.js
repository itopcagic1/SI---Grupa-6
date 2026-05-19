function normalizeStatistikaName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getSportKey(nazivSporta = '') {
  const naziv = normalizeStatistikaName(nazivSporta);

  if (naziv.includes('fudbal')) return 'football';
  if (naziv.includes('kosarka')) return 'basketball';
  if (naziv.includes('odbojka')) return 'volleyball';
  if (naziv.includes('tenis')) return 'tennis';
  if (naziv.includes('rukomet')) return 'handball';
  if (naziv.includes('hokej')) return 'iceHockey';
  if (naziv.includes('plivanje')) return 'swimming';

  return 'unknown';
}

function classifyStatistikaTip(nazivStatistike) {
  const naziv = normalizeStatistikaName(nazivStatistike);

  if (naziv.includes('penal') && naziv.includes('gol')) return 'penaltyGoals';
  if ((naziv.includes('sut') || naziv.includes('sutev')) && naziv.includes('u okvir')) return 'shotsOnTarget';
  if ((naziv.includes('sut') || naziv.includes('sutev')) && naziv.includes('na gol')) return 'shotsOnGoal';
  if (naziv.includes('posjed')) return 'possession';
  if (naziv.includes('korner')) return 'corners';
  if (naziv.includes('zuti') && naziv.includes('kart')) return 'yellowCards';
  if (naziv.includes('crveni') && naziv.includes('kart')) return 'redCards';
  if (naziv.includes('prekrs')) return 'fouls';
  if (naziv.includes('poen')) return 'points';
  if (naziv.includes('trojk')) return 'threePointersMade';
  if (naziv.includes('skok')) return 'rebounds';
  if (naziv.includes('ukrad')) return 'steals';
  if (naziv.includes('izgubljen') || naziv.includes('turnover')) return 'turnovers';
  if (naziv.includes('asev')) return 'aces';
  if (naziv.includes('dvostruke') && naziv.includes('gres')) return 'doubleFaults';
  if (naziv.includes('winner')) return 'winners';
  if (naziv.includes('neiznudjene') && naziv.includes('gres')) return 'unforcedErrors';
  if (naziv.includes('gres')) return 'errors';
  if (naziv.includes('dig')) return 'digs';
  if (naziv.includes('blok')) return 'blocks';
  if (naziv.includes('odbran')) return 'saves';
  if ((naziv.includes('kaznen') || naziv.includes('penalty')) && naziv.includes('min')) return 'penaltyMinutes';
  if (naziv.includes('vrijeme')) return 'raceTime';
  if (naziv.includes('pozic')) return 'position';
  if (naziv.includes('licni rekord') || naziv.includes('personal best')) return 'personalBestIndicator';
  if (naziv.includes('medal')) return 'medalsWon';
  if (naziv.includes('asist')) return 'assists';
  if (naziv.includes('gol')) return 'goals';

  return 'other';
}

module.exports = {
  normalizeStatistikaName,
  getSportKey,
  classifyStatistikaTip
};
