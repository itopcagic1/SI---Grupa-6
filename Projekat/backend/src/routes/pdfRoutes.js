const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticateToken } = require('../middleware/authMiddleware');


// Middleware – samo ADMINISTRATOR i ORGANIZATOR
const requirePdfAccess = (req, res, next) => {
  const uloga = req.user?.uloga;
  if (uloga !== 'ADMINISTRATOR' && uloga !== 'ORGANIZATOR' && uloga !== 'TRENER') {
    return res.status(403).json({
      greska: 'ZABRANJEN_PRISTUP',
      poruka: 'Pristup dozvoljen samo administratorima i organizatorima.',
    });
  }
  next();
};

// GET /api/pdf/tabela?takmicenjeId=X
router.get('/tabela', authenticateToken, requirePdfAccess, pdfController.getTabelaPDF);

// GET /api/pdf/rezultati?takmicenjeId=X&datumOd=Y&datumDo=Z
router.get('/rezultati', authenticateToken, requirePdfAccess, pdfController.getRezultatiPDF);

// GET /api/pdf/raspored?takmicenjeId=X&datumOd=Y&datumDo=Z
router.get('/raspored', authenticateToken, requirePdfAccess, pdfController.getRasporedPDF);

module.exports = router;