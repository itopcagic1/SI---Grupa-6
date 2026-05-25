const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const vlasnikController = require('../controllers/vlasnikController');

// GET /api/vlasnik/rezervacije
router.get(
  '/rezervacije',
  authenticateToken,
  requireRole('VLASNIK'),
  vlasnikController.dohvatiSveRezervacije
);

// PATCH /api/vlasnik/zahtjevi/:id/verifikacija
router.patch(
  '/zahtjevi/:id/verifikacija',
  authenticateToken,
  requireRole('VLASNIK'),
  vlasnikController.obradiZahtjevVerifikacije
);

router.post(
  '/rezervacije/:id/otkazivanje',
  authenticateToken,
  requireRole('VLASNIK'),
  vlasnikController.otkaziRezervacijuVlasnik
);

module.exports = router;
