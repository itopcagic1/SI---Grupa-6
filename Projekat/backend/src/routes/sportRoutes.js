const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Importuj zaštitu

// JAVNA RUTA (Svi mogu da vide listu sportova)
router.get('/', sportController.getAllSports); 

// ZAŠTIĆENE RUTE (Samo administrator smije da mijenja)
router.post('/', authenticateToken, sportController.createSport);          
router.patch('/:id', authenticateToken, sportController.updateSport);      
router.delete('/:id', authenticateToken, sportController.deleteSport);   
router.get('/:id', sportController.getSportById);


module.exports = router;

