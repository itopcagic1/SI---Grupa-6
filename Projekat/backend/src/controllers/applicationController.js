const applicationService = require('../services/applicationService');

async function dohvatiMojePrijave(req, res) {
  try {
    const prijave = await applicationService.dohvatiMojePrijave(req.user.korisnikId);

    return res.status(200).json({
      uspjeh: true,
      ukupno: prijave.length,
      prijave,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_DOHVATANJA_PRIJAVA',
      poruka: error.message || 'Greska pri dohvatanju prijava',
    });
  }
}

module.exports = {
  dohvatiMojePrijave,
};
