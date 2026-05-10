const DEFAULT_LOCATION = 'Lokacija nije definisana';

function resolveDefaultLocation(takmicenje = {}) {
  const lokacija = takmicenje.lokacija?.trim();
  if (lokacija) return lokacija;

  const lokacijaOpis = takmicenje.lokacijaOpis?.trim();
  if (lokacijaOpis) return lokacijaOpis;

  return DEFAULT_LOCATION;
}

function toMyApplicationDto(application) {
  return {
    prijavaId: application.ucesceUTakmicenjuId,
    tim: application.tim?.naziv || null,
    takmicenje: application.takmicenje?.naziv || null,
    sport: application.takmicenje?.sport?.naziv || null,
    status: application.statusPrijave || 'PENDING',
    datumPrijave: application.datumPrijave,
    defaultnaLokacija: resolveDefaultLocation(application.takmicenje),
  };
}

module.exports = {
  DEFAULT_LOCATION,
  resolveDefaultLocation,
  toMyApplicationDto,
};
