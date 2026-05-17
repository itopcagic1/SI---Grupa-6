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

const resultController = require('../controllers/resultController');
const statistikaController = require('../controllers/statistikaController');

router.post(
  '/:id/rezultat',
  authenticateToken,
  resultController.kreirajRezultat
);

router.put(
  '/:id/rezultat',
  authenticateToken,
  resultController.azurirajRezultat
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
