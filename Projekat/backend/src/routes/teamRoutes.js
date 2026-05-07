const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/authMiddleware');

// 1. JAVNE RUTE
router.get('/coaches', teamController.getCoaches); // Ovo mora biti PRVO
router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamDetails);

// 2. ZAŠTIĆENE RUTE
router.post('/', authenticateToken, teamController.createNewTeam);
router.patch('/:id', authenticateToken, teamController.updateTeam);
router.delete('/:id', authenticateToken, teamController.deleteTeam);

module.exports = router;