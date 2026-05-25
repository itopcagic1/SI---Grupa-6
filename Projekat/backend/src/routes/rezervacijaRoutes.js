const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { reliabilityMiddleware } = require('../middleware/reliabilityMiddleware');
const {
  getFreeIndividualTerms,
  kreirajIndividualnuRezervaciju,
  otkaziIndividualnuRezervaciju,
  kreirajGrupniTrening,
  prijaviSeNaGrupniTrening,
  getTrenerGrupniTreninzi,
  getGrupniTreninzi,
  otkaziGrupniTrening,
  odjaviSeSaGrupnogTreninga,
  getTrenerNotifikacije,
} = require('../controllers/rezervacijaController');
const { getMojeRezervacije } = require('../controllers/rezervacijaController');
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

router.get(
  '/rezervacije/moje',
  authenticateToken,
  requireRole('IGRAC'),
  getMojeRezervacije
);

// --- Grupne rezervacije (Developer 5) ---

router.post(
  '/rezervacije/grupne/:id',
  authenticateToken,
  requireRole('TRENER'),
  kreirajGrupniTrening
);

router.post(
  '/rezervacije/grupne/:id/prijave',
  authenticateToken,
  requireRole('IGRAC'),
  prijaviSeNaGrupniTrening
);

router.get(
  '/rezervacije/grupne/moje',
  authenticateToken,
  requireRole('TRENER'),
  getTrenerGrupniTreninzi
);

router.get(
  '/rezervacije/grupne/sve',
  authenticateToken,
  requireRole('IGRAC'),
  getGrupniTreninzi
);

router.delete(
  '/rezervacije/grupne/:id',
  authenticateToken,
  requireRole('TRENER'),
  otkaziGrupniTrening
);

router.delete(
  '/rezervacije/grupne/:id/prijave',
  authenticateToken,
  requireRole('IGRAC'),
  odjaviSeSaGrupnogTreninga
);

router.get(
  '/rezervacije/grupne/notifikacije',
  authenticateToken,
  requireRole('TRENER'),
  getTrenerNotifikacije
);

module.exports = router;