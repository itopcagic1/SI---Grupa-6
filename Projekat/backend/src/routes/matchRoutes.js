const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const aiPredictionController = require('../controllers/aiPredictionController');
const { authenticateToken } = require('../middleware/authMiddleware');


router.get('/public', matchController.getPublicMatches);

router.post(
  '/generate-schedule',
  authenticateToken,
  matchController.generateSchedule
);

router.patch(
  '/notifications/read-all',
  authenticateToken,
  matchController.markAllAsRead
);

router.patch(
  '/notifications/:id/read',
  authenticateToken,
  matchController.markAsRead
);



const resultController = require('../controllers/resultController');
const statistikaController = require('../controllers/statistikaController');

router.get('/:id/details', matchController.getMatchById);

router.get(
  '/:id/prediction',
  authenticateToken,
  aiPredictionController.getLatestMatchPrediction
);

router.post(
  '/:id/predict',
  authenticateToken,
  aiPredictionController.generateMatchPrediction
);

// Unos rezultata preko matchController-a (sa slanjem notifikacija)
router.post(
  '/:id/rezultat',
  authenticateToken,
  matchController.createMatchResult
);

// Izmjena rezultata preko matchController-a (sa slanjem notifikacija)
router.put(
  '/:id/rezultat',
  authenticateToken,
  matchController.updateMatchResult
);

router.get(
  '/:id/rezultat',
  resultController.dohvatiRezultat
);

router.post(
  '/:id/statistika/igraci',
  authenticateToken,
  statistikaController.snimiStatistikuIgraca
);

router.post(
  '/:id/statistika/timovi',
  authenticateToken,
  statistikaController.snimiStatistikuTima
);

module.exports = router;