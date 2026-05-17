const express = require('express');
const router = express.Router();
const statistikaController = require('../controllers/statistikaController');

router.get('/tipovi-statistike', statistikaController.getTipoviStatistike);

module.exports = router;
