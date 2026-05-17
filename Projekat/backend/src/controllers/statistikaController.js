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

exports.dohvatiStatistikuIgraca = async (req, res) => {
  try {
    const { takmicenjeId, sezona } = req.query;
    const igracId = req.params.id;
    
    const rezultat = await statistikaService.dohvatiAgregiranuStatistikuIgraca(
      igracId,
      takmicenjeId,
      sezona
    );

    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({ poruka: error.message || 'Greška pri dohvatu statistike igrača.' });
  }
};

exports.dohvatiStatistikuTima = async (req, res) => {
  try {
    const { takmicenjeId, sezona } = req.query;
    const timId = req.params.id;

    const rezultat = await statistikaService.dohvatiAgregiranuStatistikuTima(
      timId,
      takmicenjeId,
      sezona
    );

    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({ poruka: error.message || 'Greška pri dohvatu statistike tima.' });
  }
};

exports.dohvatiTopStrijelce = async (req, res) => {
  try {
    const { tipStatistikeId, limit } = req.query;
    const takmicenjeId = req.params.id;

    const rezultat = await statistikaService.dohvatiTopStrijelce(
      takmicenjeId,
      tipStatistikeId,
      limit ? parseInt(limit, 10) : 10
    );

    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({ poruka: error.message || 'Greška pri dohvatu lidera statistike.' });
  }
};

exports.dohvatiTakmicenjaIgraca = async (req, res) => {
  try {
    const igracId = req.params.id;
    const takmicenja = await statistikaService.dohvatiTakmicenjaIgraca(igracId);
    res.json(takmicenja);
  } catch (error) {
    res.status(error.status || 500).json({ poruka: error.message || 'Greška pri dohvatu takmičenja igrača.' });
  }
};
exports.dohvatiTakmicenjaTima = async (req, res) => {
  try {
    const timId = req.params.id;
    const takmicenja = await statistikaService.dohvatiTakmicenjaTima(timId);
    res.json(takmicenja);
  } catch (error) {
    res.status(error.status || 500).json({ poruka: error.message || 'Greška pri dohvatu takmičenja tima.' });
  }
};
