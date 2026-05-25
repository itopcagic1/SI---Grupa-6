const vlasnikService = require('../services/vlasnikService');

const dohvatiSveRezervacije = async (req, res) => {
  try {
    const rezultat = await vlasnikService.dohvatiSveRezervacijeService(
      req.user,
      req.query
    );

    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_DOHVATANJA_REZERVACIJA',
      poruka:
        error.message ||
        'Došlo je do greške prilikom dohvaćanja rezervacija za vlasnika.',
    });
  }
};

const obradiZahtjevVerifikacije = async (req, res) => {
  try {
    const rezultat = await vlasnikService.obradiZahtjevVerifikacijeService(
      req.user,
      req.params.id,
      req.body
    );

    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_OBRADE_ZAHTJEVA',
      poruka:
        error.message ||
        'Došlo je do greške prilikom obrade zahtjeva za verifikaciju.',
    });
  }
};

module.exports = {
  dohvatiSveRezervacije,
  obradiZahtjevVerifikacije,
};
