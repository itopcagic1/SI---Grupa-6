const express = require('express');

const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET takmicenja (javno)
router.get('/', (req, res) => {
  res.json({ poruka: 'Sva takmicenja' });
});

// PRIJAVA EKIPE NA TAKMICENJE
router.post(
  '/:id/apply',
  authenticateToken,
  requireRole('TRENER'),
  (req, res) => {
    res.json({ poruka: 'Ekipa prijavljena na takmicenje' });
  }
);

module.exports = router;