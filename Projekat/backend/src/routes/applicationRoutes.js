const express = require('express');
const applicationController = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get(
  '/my',
  authenticateToken,
  requireRole('TRENER'),
  applicationController.dohvatiMojePrijave
);

module.exports = router;
