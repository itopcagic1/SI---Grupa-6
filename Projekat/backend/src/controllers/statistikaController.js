const statistikaService = require('../services/statistikaService');

exports.getTipoviStatistike = async (req, res) => {
  try {
    const tipovi = await statistikaService.getTipoviStatistike(req.query.sportId);
    res.json(tipovi);
  } catch (error) {
    res.status(error.status || 500).json({ poruka: error.message || 'Greška pri dohvatu tipova statistike.' });
  }
};

exports.snimiStatistikuIgraca = async (req, res) => {
  try {
    const statistika = await statistikaService.snimiStatistikuIgraca(req.params.id, req.body, req.user);
    res.status(201).json({ poruka: 'Statistika igrača uspješno sačuvana.', statistika });
  } catch (error) {
    res.status(error.status || 500).json({ poruka: error.message || 'Greška pri unosu statistike igrača.' });
  }
};

exports.snimiStatistikuTima = async (req, res) => {
  try {
    const statistika = await statistikaService.snimiStatistikuTima(req.params.id, req.body, req.user);
    res.status(201).json({ poruka: 'Statistika tima uspješno sačuvana.', statistika });
  } catch (error) {
    res.status(error.status || 500).json({ poruka: error.message || 'Greška pri unosu statistike tima.' });
  }
};
