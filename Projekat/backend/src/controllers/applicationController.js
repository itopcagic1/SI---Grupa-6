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

async function kreirajPrijavu(req, res) {
  try {
    const prijava = await applicationService.kreirajPrijavu(
      req.body,
      req.user.korisnikId
    );

    return res.status(201).json({
      uspjeh: true,
      poruka: 'Tim je uspješno prijavljen na takmičenje.',
      prijava,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_PRIJAVE_TIMA',
      poruka: error.message || 'Greška pri prijavi tima na takmičenje.',
    });
  }
}

module.exports = {
  dohvatiMojePrijave,
  kreirajPrijavu,
};