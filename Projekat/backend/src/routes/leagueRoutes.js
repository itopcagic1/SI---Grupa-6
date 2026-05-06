const express = require('express');

const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET sve lige (javno)
router.get('/', (req, res) => {
  res.json({ poruka: 'Sve lige' });
});

// CREATE liga
router.post(
  '/',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Liga kreirana' });
  }
);

// UPDATE liga
router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Liga azurirana' });
  }
);

// DELETE liga
router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Liga obrisana' });
  }
);

module.exports = router;