export function normalizeStatistikaName(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function classifyStatistikaTip(tip) {
  const naziv = normalizeStatistikaName(tip?.nazivStatistike);

  if (naziv.includes('asist')) return 'assists';
  if (naziv.includes('zuti') && naziv.includes('kart')) return 'yellowCards';
  if (naziv.includes('crveni') && naziv.includes('kart')) return 'redCards';
  if (naziv.includes('gol')) return 'goals';
  if (naziv.includes('posjed')) return 'possession';
  if (naziv.includes('prekrs') || naziv.includes('prekrsaj')) return 'fouls';

  return 'other';
}

export function getIgrackiTipoviStatistike(tipovi = []) {
  const dozvoljeni = new Set(['goals', 'assists', 'yellowCards', 'redCards']);
  return tipovi.filter((tip) => dozvoljeni.has(classifyStatistikaTip(tip)));
}

export function getTimskiTipoviStatistike(tipovi = []) {
  const dozvoljeni = new Set(['goals', 'assists', 'yellowCards', 'redCards', 'possession', 'fouls']);
  return tipovi.filter((tip) => dozvoljeni.has(classifyStatistikaTip(tip)));
}
