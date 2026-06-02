const express = require('express');
const router = express.Router();
const notifikacijaController = require('../controllers/notifikacijaController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, notifikacijaController.getNotifikacije);
router.get('/neprocitane-count', authenticateToken, notifikacijaController.getNeprocitaneCount);
router.patch('/:id/procitano', authenticateToken, notifikacijaController.oznaciKaoProcitano);
router.patch('/procitano-sve', authenticateToken, notifikacijaController.oznaciSveKaoProcitano);

module.exports = router;