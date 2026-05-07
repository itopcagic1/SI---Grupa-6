const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// JAVNA RUTA (Svi mogu da vide listu sportova)
router.get('/', sportController.getAllSports);

// ZASTICENE RUTE (Samo administrator smije da mijenja)
router.post('/', authenticateToken, requireRole('ADMINISTRATOR'), sportController.createSport);
router.patch('/:id', authenticateToken, requireRole('ADMINISTRATOR'), sportController.updateSport);
router.delete('/:id', authenticateToken, requireRole('ADMINISTRATOR'), sportController.deleteSport);
router.get('/:id', sportController.getSportById);

module.exports = router;
