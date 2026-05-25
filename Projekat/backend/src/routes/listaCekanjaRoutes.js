const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  prijaviNaListuCekanja,
  ukloniSaListeCekanja,
  getMojaListaCekanja,
} = require('../services/listaCekanjaService');

const router = express.Router();

router.get('/liste-cekanja/moje', authenticateToken, requireRole('IGRAC'), async (req, res) => {
  try {
    const stavke = await getMojaListaCekanja(req.user.korisnikId);
    return res.json({ stavke });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_DOHVATANJA_LISTE_CEKANJA',
      poruka: error.message || 'Doslo je do greske pri dohvatanju liste cekanja.',
    });
  }
});

router.post('/liste-cekanja/termini/:id', authenticateToken, requireRole('IGRAC'), async (req, res) => {
  try {
    const rezultat = await prijaviNaListuCekanja(req.params.id, req.user.korisnikId);
    return res.status(201).json({
      poruka: 'Uspjesno ste prijavljeni na listu cekanja.',
      stavka: rezultat.stavka,
      termin: rezultat.termin,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_PRIJAVE_NA_LISTU_CEKANJA',
      poruka: error.message || 'Doslo je do greske pri prijavi na listu cekanja.',
    });
  }
});

router.delete('/liste-cekanja/termini/:id', authenticateToken, requireRole('IGRAC'), async (req, res) => {
  try {
    const rezultat = await ukloniSaListeCekanja(req.params.id, req.user.korisnikId);
    return res.json(rezultat);
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_UKLANJANJA_SA_LISTE_CEKANJA',
      poruka: error.message || 'Doslo je do greske pri uklanjanju sa liste cekanja.',
    });
  }
});

module.exports = router;
