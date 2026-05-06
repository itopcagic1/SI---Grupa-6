const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getKorisnici, obradiZahtjevUloge } = require('../controllers/adminController');

// Samo ADMINISTRATOR moze pristupiti ovim rutama
router.use(authenticateToken);
router.use(requireRole('ADMINISTRATOR'));

// GET /api/admin/korisnici?status=PENDING
router.get('/korisnici', getKorisnici);

// PATCH /api/admin/korisnici/:id/uloga
router.patch('/korisnici/:id/uloga', obradiZahtjevUloge);

module.exports = router;