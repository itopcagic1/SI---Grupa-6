const express = require('express');
const router = express.Router();
const ligaController = require('../controllers/ligaController');
const { authenticateToken, validate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { kreirajLiguSchema, izmijeniLiguSchema } = require('../utils/ligaValidators');

// GET /api/lige — lista svih liga (javno dostupno)
router.get('/', ligaController.dohvatiSveLige);

// GET /api/lige/:id — detalji jedne lige (javno dostupno)
router.get('/:id', ligaController.dohvatiLiguPoId);

// POST /api/lige — kreiranje lige (samo ORGANIZATOR i ADMINISTRATOR)
router.post(
  '/',
  authenticateToken,
  requireRole('ORGANIZATOR', 'ADMINISTRATOR'),
  validate(kreirajLiguSchema),
  ligaController.kreirajLigu
);

// PATCH /api/lige/:id — izmjena lige (samo ORGANIZATOR i ADMINISTRATOR)
// Napomena: servis dodatno provjerava da li je korisnik vlasnik te lige
router.patch(
  '/:id',
  authenticateToken,
  requireRole('ORGANIZATOR', 'ADMINISTRATOR'),
  validate(izmijeniLiguSchema),
  ligaController.izmijeniLigu
);

// DELETE /api/lige/:id — brisanje lige (samo ORGANIZATOR i ADMINISTRATOR)
// Napomena: servis dodatno provjerava da li je korisnik vlasnik te lige
router.delete(
  '/:id',
  authenticateToken,
  requireRole('ORGANIZATOR', 'ADMINISTRATOR'),
  ligaController.obrisiLigu
);
router.post('/:id/timovi', authenticateToken, requireRole('ADMINISTRATOR', 'TRENER'), ligaController.dodajTimULigu);
router.delete('/:id/timovi/:timId', authenticateToken, requireRole('ADMINISTRATOR'), ligaController.ukloniTimIzLige);


router.post('/:id/timovi', authenticateToken, requireRole('ADMINISTRATOR'), ligaController.dodajTimULigu);
router.delete('/:id/timovi/:timId', authenticateToken, requireRole('ADMINISTRATOR'), ligaController.ukloniTimIzLige);

module.exports = router;