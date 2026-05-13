const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/public', matchController.getPublicMatches);

router.post(
  '/generate-schedule',
  authenticateToken,
  matchController.generisiRaspored
);

module.exports = router;