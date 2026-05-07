const express = require('express');
<<<<<<< HEAD

const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// GET svi timovi (javno)
router.get('/', (req, res) => {
  res.json({ poruka: 'Svi timovi' });
});

// CREATE tim
router.post(
  '/',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Tim kreiran' });
  }
);

// UPDATE tim
router.put(
  '/:id',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Tim azuriran' });
  }
);

// DELETE tim
router.delete(
  '/:id',
  authenticateToken,
  requireRole('ADMINISTRATOR', 'ORGANIZATOR'),
  (req, res) => {
    res.json({ poruka: 'Tim obrisan' });
  }
);
=======
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
>>>>>>> origin/feature/PB-25-Teams-and-Sports-Management

module.exports = router;