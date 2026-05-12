const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/public', matchController.getPublicMatches);

// POST /api/matches/generate-schedule — generisanje rasporeda (samo ORGANIZATOR i ADMINISTRATOR)
router.post(
  '/generate-schedule',
  authenticateToken,
  requireRole('ORGANIZATOR', 'ADMINISTRATOR'),
  matchController.generisiRaspored
);

module.exports = router;
