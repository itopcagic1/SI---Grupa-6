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

module.exports = {
  dohvatiSveRezervacije,
};