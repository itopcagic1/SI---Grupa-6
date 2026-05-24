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

module.exports = router;