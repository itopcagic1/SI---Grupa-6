const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');

// US-05.1: Rute za upravljanje sportovima
router.get('/', sportController.getAllSports);           // Pregled liste sportova
router.post('/', sportController.createSport);          // Dodavanje novog sporta
router.patch('/:id', sportController.updateSport);      // Uređivanje sporta
router.delete('/:id', sportController.deleteSport);     // Brisanje sporta
router.get('/:id', sportController.getSportById);

module.exports = router;
