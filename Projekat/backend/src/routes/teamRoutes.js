const express = require('express');

const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET svi timovi (javno)
router.get('/', (req, res) => {
  res.json({ poruka: 'Svi timovi' });
});

// CREATE tim
router.post(
  '/',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Tim kreiran' });
  }
);

// UPDATE tim
router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Tim azuriran' });
  }
);

// DELETE tim
router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Tim obrisan' });
  }
);

module.exports = router;