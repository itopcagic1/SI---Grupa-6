export function normalizeStatistikaName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getSportKey(nazivSporta = '') {
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

export function classifyStatistikaTip(tip) {
  const naziv = normalizeStatistikaName(tip?.nazivStatistike);

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

const SPORT_ROLE_CATEGORIES = {
  football: {
    player: ['goals', 'assists', 'yellowCards', 'redCards', 'penaltyGoals', 'shotsOnTarget', 'fouls'],
    team: ['goals', 'assists', 'yellowCards', 'redCards', 'penaltyGoals', 'shotsOnTarget', 'fouls', 'possession', 'corners']
  },
  basketball: {
    player: ['points', 'assists', 'rebounds', 'steals', 'blocks', 'fouls'],
    team: ['points', 'assists', 'rebounds', 'fouls', 'threePointersMade', 'turnovers']
  },
  volleyball: {
    player: ['points', 'aces', 'blocks', 'digs', 'errors'],
    team: ['points', 'aces', 'blocks', 'errors']
  },
  tennis: {
    player: ['aces', 'doubleFaults', 'winners', 'unforcedErrors'],
    team: ['aces', 'doubleFaults', 'winners']
  },
  handball: {
    player: ['goals', 'assists', 'saves', 'yellowCards', 'redCards', 'fouls'],
    team: ['goals', 'assists', 'saves', 'fouls', 'yellowCards', 'redCards']
  },
  iceHockey: {
    player: ['goals', 'assists', 'penaltyMinutes', 'saves', 'shotsOnGoal'],
    team: ['goals', 'penaltyMinutes', 'shotsOnGoal', 'saves']
  },
  swimming: {
    player: ['raceTime', 'position', 'personalBestIndicator'],
    team: ['points', 'medalsWon']
  },
  unknown: {
    player: [
      'goals', 'assists', 'yellowCards', 'redCards', 'penaltyGoals', 'shotsOnTarget', 'fouls',
      'points', 'rebounds', 'steals', 'blocks', 'aces', 'digs', 'errors', 'doubleFaults',
      'winners', 'unforcedErrors', 'saves', 'penaltyMinutes', 'shotsOnGoal', 'raceTime',
      'position', 'personalBestIndicator'
    ],
    team: [
      'goals', 'assists', 'yellowCards', 'redCards', 'possession', 'fouls', 'penaltyGoals',
      'shotsOnTarget', 'corners', 'points', 'rebounds', 'threePointersMade', 'turnovers',
      'aces', 'blocks', 'errors', 'doubleFaults', 'winners', 'saves', 'penaltyMinutes',
      'shotsOnGoal', 'medalsWon'
    ]
  }
};

function getRoleCategories(sportName, role) {
  const sportKey = getSportKey(sportName);
  return SPORT_ROLE_CATEGORIES[sportKey]?.[role] || SPORT_ROLE_CATEGORIES.unknown[role];
}

export function getIgrackiTipoviStatistike(tipovi = [], sportName = '') {
  const dozvoljeni = new Set(getRoleCategories(sportName, 'player'));
  return tipovi.filter((tip) => dozvoljeni.has(classifyStatistikaTip(tip)));
}

export function getTimskiTipoviStatistike(tipovi = [], sportName = '') {
  const dozvoljeni = new Set(getRoleCategories(sportName, 'team'));
  return tipovi.filter((tip) => dozvoljeni.has(classifyStatistikaTip(tip)));
}

export function getStatistikaInputConfig(tip, sportName = '', role = 'player') {
  const category = classifyStatistikaTip(tip);
  const sportKey = getSportKey(sportName);
  const config = {
    min: 0,
    step: 1,
    inputMode: 'numeric',
    suffix: ''
  };

  if (category === 'possession') {
    config.max = 100;
    config.suffix = '%';
  }

  if (category === 'penaltyMinutes') {
    config.suffix = 'min';
  }

  if (category === 'raceTime') {
    config.step = '0.01';
    config.inputMode = 'decimal';
    config.suffix = 's';
  }

  if (category === 'position') {
    config.min = 1;
  }

  if (category === 'personalBestIndicator') {
    config.max = 1;
  }

  if (sportKey === 'football' && role === 'player' && category === 'redCards') {
    config.max = 1;
  }

  if (sportKey === 'football' && role === 'player' && category === 'yellowCards') {
    config.max = 2;
  }

  if (sportKey === 'football' && role === 'team' && category === 'yellowCards') {
    config.max = 11;
  }

  if (sportKey === 'football' && role === 'team' && category === 'redCards') {
    config.max = 4;
  }

  if (sportKey === 'handball' && category === 'redCards') {
    config.max = role === 'player' ? 1 : 4;
  }

  if (sportKey === 'handball' && category === 'yellowCards') {
    config.max = role === 'player' ? 2 : 11;
  }

  if (sportKey === 'basketball' && category === 'fouls') {
    config.max = role === 'player' ? 6 : 40;
  }

  return config;
}

export function validateStatistikaVrijednost(tip, rawValue, sportName = '', role = 'player') {
  if (rawValue === '' || rawValue === undefined || rawValue === null) return null;

  const value = Number(rawValue);
  const category = classifyStatistikaTip(tip);
  const sportKey = getSportKey(sportName);
  const label = tip?.nazivStatistike || 'Statistika';

  if (!Number.isFinite(value) || value < 0) {
    return `${label} mora biti nenegativan broj.`;
  }

  if (category !== 'raceTime' && !Number.isInteger(value)) {
    return `${label} mora biti cijeli broj.`;
  }

  if (category === 'raceTime' && value <= 0) {
    return `${label} mora biti pozitivan broj.`;
  }

  if (category === 'position' && (!Number.isInteger(value) || value <= 0)) {
    return `${label} mora biti pozitivan cijeli broj.`;
  }

  if (category === 'personalBestIndicator' && ![0, 1].includes(value)) {
    return `${label} mora biti 0 ili 1.`;
  }

  if (sportKey === 'football' && role === 'player' && category === 'redCards' && ![0, 1].includes(value)) {
    return `${label} moze biti samo 0 ili 1.`;
  }

  if (sportKey === 'football' && role === 'player' && category === 'yellowCards' && ![0, 1, 2].includes(value)) {
    return `${label} moze biti samo 0, 1 ili 2.`;
  }

  if (sportKey === 'football' && role === 'team' && category === 'yellowCards' && value > 11) {
    return `${label} ne moze biti veci od 11.`;
  }

  if (sportKey === 'football' && role === 'team' && category === 'redCards' && value > 4) {
    return `${label} ne moze biti veci od 4.`;
  }

  if (sportKey === 'handball' && category === 'redCards') {
    const max = role === 'player' ? 1 : 4;
    if (value > max) return `${label} ne moze biti veci od ${max}.`;
  }

  if (sportKey === 'handball' && category === 'yellowCards') {
    const max = role === 'player' ? 2 : 11;
    if (value > max) return `${label} ne moze biti veci od ${max}.`;
  }

  if (sportKey === 'basketball' && category === 'fouls') {
    const max = role === 'player' ? 6 : 40;
    if (value > max) return `${label} ne moze biti veci od ${max}.`;
  }

  if (category === 'possession' && (!Number.isInteger(value) || value < 0 || value > 100)) {
    return `${label} mora biti cijeli broj izmedju 0 i 100.`;
  }

  return null;
}

export function formatStatistikaVrijednost(tipOrName, rawValue, options = {}) {
  const { mode = 'default' } = options;
  const naziv = typeof tipOrName === 'string' ? tipOrName : tipOrName?.nazivStatistike;
  const category = classifyStatistikaTip({ nazivStatistike: naziv });
  const value = Number(rawValue);

  if (!Number.isFinite(value)) return '-';

  if (category === 'possession') {
    return `${Math.round(value)}%`;
  }

  if (category === 'penaltyMinutes') {
    return `${value}${mode === 'aggregate' || mode === 'average' ? '' : ''} min`;
  }

  if (category === 'raceTime') {
    const precision = mode === 'average' ? 2 : 2;
    return `${value.toFixed(precision)} s`;
  }

  if (mode === 'aggregate') {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  if (mode === 'average') {
    return value.toFixed(2);
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
