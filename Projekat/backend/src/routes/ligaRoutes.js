const express = require('express');
const router = express.Router();
const ligaController = require('../controllers/ligaController');
const { authenticateToken, validate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { kreirajLiguSchema, izmijeniLiguSchema } = require('../utils/ligaValidators');


router.get('/', ligaController.dohvatiSveLige);

router.get('/:id', ligaController.dohvatiLiguPoId);

router.post(
  '/',
  authenticateToken,
  requireRole('ORGANIZATOR', 'ADMINISTRATOR'),
  validate(kreirajLiguSchema),
  ligaController.kreirajLigu
);


router.patch(
  '/:id',
  authenticateToken,
  requireRole('ORGANIZATOR', 'ADMINISTRATOR'),
  validate(izmijeniLiguSchema),
  ligaController.izmijeniLigu
);

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