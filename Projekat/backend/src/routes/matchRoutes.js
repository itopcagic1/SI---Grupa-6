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

module.exports = router;