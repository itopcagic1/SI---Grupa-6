const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Pregled timova (US-08)
router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamDetails);

// Upravljanje timovima (US-05.3)
router.post('/', teamController.createNewTeam);
router.delete('/:id', teamController.deleteTeam);

// Izmjena tima (US-06)
router.patch('/:id', teamController.updateTeam);

// Članovi tima - Igrači i Treneri (US-07 & US-05.4)
router.post('/:id/players', teamController.addPlayer);
router.post('/:id/coaches', teamController.addCoach);

// Uklanjanje članova
router.delete('/:id/players/:userId', teamController.removePlayer);
router.delete('/:id/coaches/:userId', teamController.removePlayer);

module.exports = router;