const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { getKorisnici, obradiZahtjevUloge, obrisiKorisnika, blokirajKorisnika } = require('../controllers/adminController');

router.use(authenticateToken);
router.use(requireRole('ADMINISTRATOR'));

// GET /api/admin/korisnici?status=PENDING&pretraga=ime
router.get('/korisnici', getKorisnici);

// PATCH /api/admin/korisnici/:id/uloga
router.patch('/korisnici/:id/uloga', obradiZahtjevUloge);

// DELETE /api/admin/korisnici/:id
router.delete('/korisnici/:id', obrisiKorisnika);

// PATCH /api/admin/korisnici/:id/blokiranje
router.patch('/korisnici/:id/blokiranje', blokirajKorisnika);

module.exports = router;