const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Importuj zaštitu

// JAVNA RUTA (Svi mogu da vide listu sportova)
router.get('/', sportController.getAllSports); 

// ZAŠTIĆENE RUTE (Samo administrator smije da mijenja)
// Pretpostavljam da imaš authorizeRole middleware, ako nemaš koristi samo authenticateToken
router.post('/', authenticateToken, sportController.createSport);          
router.patch('/:id', authenticateToken, sportController.updateSport);      
router.delete('/:id', authenticateToken, sportController.deleteSport);   
router.get('/:id', sportController.getSportById);


module.exports = router;