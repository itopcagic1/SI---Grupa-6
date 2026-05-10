const DEFAULT_LOCATION = 'Lokacija nije definisana';

function resolveDefaultLocation(takmicenje = {}) {
  const utakmice = takmicenje.utakmice || [];

  const utakmicaSaObjektom = utakmice.find((utakmica) => {
    const objekat = utakmica.sportskiObjekat;
    return objekat?.adresa?.trim() || objekat?.naziv?.trim();
  });

  if (utakmicaSaObjektom) {
    const { naziv, adresa } = utakmicaSaObjektom.sportskiObjekat;
    if (naziv?.trim() && adresa?.trim()) return `${naziv.trim()} - ${adresa.trim()}`;
    if (adresa?.trim()) return adresa.trim();
    return naziv.trim();
  }

  const utakmicaSaOpisom = utakmice.find((utakmica) => utakmica.lokacijaOpis?.trim());
  if (utakmicaSaOpisom) return utakmicaSaOpisom.lokacijaOpis.trim();

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
