const express = require('express');
const router = express.Router();
const omiljeniTimController = require('../controllers/omiljeniTimController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/:timId', authenticateToken, requireRole('NAVIJAC'), omiljeniTimController.setOmiljeniTim);
router.delete('/:timId', authenticateToken, requireRole('NAVIJAC'), omiljeniTimController.removeOmiljeniTim);
router.get('/', authenticateToken, requireRole('NAVIJAC'), omiljeniTimController.getOmiljeniTimovi);

module.exports = router;
