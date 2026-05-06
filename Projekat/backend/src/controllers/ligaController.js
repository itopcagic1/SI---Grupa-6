const ligaService = require('../services/ligaService');

async function kreirajLigu(req, res) {
  try {
    const liga = await ligaService.kreirajLigu(req.body, req.user.korisnikId);
    return res.status(201).json({
      uspjeh: true,
      poruka: 'Liga uspješno kreirana',
      liga,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_KREIRANJA_LIGE',
      poruka: error.message || 'Greška pri kreiranju lige',
    });
  }
}

async function dohvatiSveLige(req, res) {
  try {
    const { sportId, status, sezona } = req.query;
    const lige = await ligaService.dohvatiSveLige({ sportId, status, sezona });
    return res.status(200).json({
      uspjeh: true,
      ukupno: lige.length,
      lige,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_DOHVATANJA_LIGA',
      poruka: error.message || 'Greška pri dohvatanju liga',
    });
  }
}

async function dohvatiLiguPoId(req, res) {
  try {
    const liga = await ligaService.dohvatiLiguPoId(req.params.id);
    return res.status(200).json({
      uspjeh: true,
      liga,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_DOHVATANJA_LIGE',
      poruka: error.message || 'Greška pri dohvatanju lige',
    });
  }
}

async function izmijeniLigu(req, res) {
  try {
    const liga = await ligaService.izmijeniLigu(
      req.params.id,
      req.body,
      req.user.korisnikId,
      req.user.uloga
    );
    return res.status(200).json({
      uspjeh: true,
      poruka: 'Liga uspješno izmijenjena',
      liga,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_IZMJENE_LIGE',
      poruka: error.message || 'Greška pri izmjeni lige',
    });
  }
}

async function obrisiLigu(req, res) {
  try {
    const rezultat = await ligaService.obrisiLigu(
      req.params.id,
      req.user.korisnikId,
      req.user.uloga
    );
    return res.status(200).json({
      uspjeh: true,
      poruka: 'Liga uspješno obrisana',
      takmicenjeId: rezultat.takmicenjeId,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_BRISANJA_LIGE',
      poruka: error.message || 'Greška pri brisanju lige',
    });
  }
}

module.exports = {
  kreirajLigu,
  dohvatiSveLige,
  dohvatiLiguPoId,
  izmijeniLigu,
  obrisiLigu,
};