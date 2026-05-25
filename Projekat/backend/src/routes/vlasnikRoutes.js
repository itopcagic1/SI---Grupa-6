const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const vlasnikController = require('../controllers/vlasnikController');

const { ownerCancelReservation } = require('../controllers/rezervacijaController');

// GET /api/vlasnik/rezervacije
router.get(
  '/rezervacije',
  authenticateToken,
  requireRole('VLASNIK'),
  vlasnikController.dohvatiSveRezervacije
);

router.post(
  '/rezervacije/:id/otkazivanje',
  authenticateToken,
  requireRole('VLASNIK'),
  ownerCancelReservation
);

module.exports = router;