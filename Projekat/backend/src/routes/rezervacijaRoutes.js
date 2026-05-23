const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { reliabilityMiddleware } = require('../middleware/reliabilityMiddleware');
const {
  getFreeIndividualTerms,
  kreirajIndividualnuRezervaciju,
  otkaziIndividualnuRezervaciju,
} = require('../controllers/rezervacijaController');

router.get(
  '/rezervacije/slobodni/individualni',
  authenticateToken,
  requireRole('IGRAC'),
  getFreeIndividualTerms
);

router.post(
  '/rezervacije/individualne/:id',
  authenticateToken,
  requireRole('IGRAC'),
  reliabilityMiddleware,
  kreirajIndividualnuRezervaciju
);

router.delete(
  '/rezervacije/individualne/:id',
  authenticateToken,
  requireRole('IGRAC'),
  otkaziIndividualnuRezervaciju
);

module.exports = router;