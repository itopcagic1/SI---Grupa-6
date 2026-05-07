const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/authMiddleware');

// 1. JAVNE RUTE
// 1. JAVNE RUTE
router.get('/coaches', teamController.getCoaches);
router.get('/players', teamController.getPlayers); // ← OVDJE, gore
router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamDetails);
// 2. ZAŠTIĆENE RUTE
router.post('/', authenticateToken, teamController.createNewTeam);
router.patch('/:id', authenticateToken, teamController.updateTeam);
router.delete('/:id', authenticateToken, teamController.deleteTeam);

router.post('/:id/players', authenticateToken, teamController.addPlayer);
router.post('/:id/coaches', authenticateToken, teamController.addCoach);
router.delete('/:id/players/:playerId', authenticateToken, teamController.removePlayer);

module.exports = router;