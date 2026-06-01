const pdfService = require('../services/pdfService');

// GET /api/pdf/tabela?takmicenjeId=X
exports.getTabelaPDF = async (req, res) => {
  try {
    const { takmicenjeId } = req.query;

    if (!takmicenjeId) {
      return res.status(400).json({
        greska: 'NEDOSTAJE_PARAMETAR',
        poruka: 'takmicenjeId je obavezan.',
      });
    }

    const pdfBuffer = await pdfService.generateTabelaPDF(takmicenjeId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=tabela.pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    if (error.message === 'Takmicenje nije pronađeno') {
      return res.status(404).json({
        greska: 'NIJE_PRONADJENO',
        poruka: 'Takmičenje sa zadanim ID-em ne postoji.',
      });
    }
    console.error('Greška pri generisanju PDF tabele:', error);
    res.status(500).json({
      greska: 'GRESKA_SERVERA',
      poruka: 'Nije moguće generisati PDF tabele.',
    });
  }
};

// GET /api/pdf/rezultati?takmicenjeId=X&datumOd=Y&datumDo=Z
exports.getRezultatiPDF = async (req, res) => {
  try {
    const { takmicenjeId, datumOd, datumDo } = req.query;

    if (!takmicenjeId) {
      return res.status(400).json({
        greska: 'NEDOSTAJE_PARAMETAR',
        poruka: 'takmicenjeId je obavezan.',
      });
    }

    const pdfBuffer = await pdfService.generateRezultatiPDF(
      takmicenjeId,
      datumOd || null,
      datumDo || null,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rezultati.pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    if (error.message === 'Takmicenje nije pronađeno') {
      return res.status(404).json({
        greska: 'NIJE_PRONADJENO',
        poruka: 'Takmičenje sa zadanim ID-em ne postoji.',
      });
    }
    console.error('Greška pri generisanju PDF rezultata:', error);
    res.status(500).json({
      greska: 'GRESKA_SERVERA',
      poruka: 'Nije moguće generisati PDF rezultata.',
    });
  }
};