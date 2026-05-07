const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

const { authenticateToken } = require('../middleware/authMiddleware');

// Pregled timova (Javno - ne treba token)
router.get('/', teamController.getTeams);
router.get('/:id', teamController.getTeamDetails);

// Zaštićene rute (Sada koristimo ispravno ime: authenticateToken)
router.post('/', authenticateToken, teamController.createNewTeam);
router.patch('/:id', authenticateToken, teamController.updateTeam);
router.put('/:id', authenticateToken, teamController.updateTeam);
router.delete('/:id', authenticateToken, teamController.deleteTeam);

router.post('/:id/players', authenticateToken, teamController.addPlayer);
router.post('/:id/coaches', authenticateToken, teamController.addCoach);
router.delete('/:id/players/:playerId', authenticateToken, teamController.removePlayer);

module.exports = router;