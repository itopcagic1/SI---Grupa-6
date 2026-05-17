const express = require('express');
const router = express.Router();
const statistikaController = require('../controllers/statistikaController');

router.get('/tipovi-statistike', statistikaController.getTipoviStatistike);
router.get('/igraci/:id/statistika', statistikaController.dohvatiStatistikuIgraca);
router.get('/igraci/:id/takmicenja', statistikaController.dohvatiTakmicenjaIgraca);
router.get('/timovi/:id/statistika', statistikaController.dohvatiStatistikuTima);
router.get('/takmicenja/:id/top-strijelci', statistikaController.dohvatiTopStrijelce);
router.get('/timovi/:id/takmicenja', statistikaController.dohvatiTakmicenjaTima);

module.exports = router;
