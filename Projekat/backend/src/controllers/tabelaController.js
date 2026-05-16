const tabelaService = require('../services/tabelaService');

// GET /api/takmicenja/:id/tabela?sortBy=ukupniBodovi&sezona=2024
exports.getTabelaZaTakmicenje = async (req, res) => {
  try {
    const { id } = req.params;
    const { sortBy, sezona } = req.query;

    const rezultat = await tabelaService.getTabelaZaTakmicenje(id, sortBy, sezona);
    res.json(rezultat);
  } catch (error) {
    if (error.message === 'Takmicenje nije pronađeno') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Greška pri dohvatanju tabele.' });
  }
};