const matchService = require('../services/matchService');

async function generisiRaspored(req, res) {
  try {
    const { takmicenjeId, pocetniDatum, defaultnoVrijeme, defaultnaLokacija } = req.body;

    // Validacija obaveznih polja
    if (!takmicenjeId || !pocetniDatum || !defaultnoVrijeme) {
      return res.status(400).json({
        greska: 'MISSING_REQUIRED_FIELDS',
        poruka: 'Nedostaju obavezna polja: Takmicenje, Datum, Vrijeme'
      });
    }

    // Validacija datuma
    const datum = new Date(pocetniDatum);
    if (isNaN(datum.getTime())) {
      return res.status(400).json({
        greska: 'INVALID_DATE',
        poruka: 'Nevažeći format datuma'
      });
    }

    // Validacija da datum nije u prošlosti niti danas
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);
    const sutra = new Date(danas);
    sutra.setDate(sutra.getDate() + 1);
    const datumBezVremena = new Date(datum);
    datumBezVremena.setHours(0, 0, 0, 0);

    if (datumBezVremena < sutra) {
      return res.status(400).json({
        greska: 'DATE_IN_PAST',
        poruka: 'Početni datum mora biti u budućnosti (najmanje sutra).'
      });
    }

    // Validacija vremena
    const vrijemeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!vrijemeRegex.test(defaultnoVrijeme)) {
      return res.status(400).json({
        greska: 'INVALID_TIME',
        poruka: 'Nevažeći format vremena (očekuje se HH:MM)'
      });
    }

    // defaultnaLokacija je opcionalna — ako nije proslijeđena, service će koristiti podrazumijevanu vrijednost
    const rezultat = await matchService.generisiRaspored(
      { takmicenjeId, pocetniDatum, defaultnoVrijeme, defaultnaLokacija },
      {
        korisnikId: req.user.korisnikId,
        uloga: req.user.uloga
      }
    );

    return res.status(201).json({
      uspjeh: true,
      poruka: 'Raspored uspješno generisan',
      ...rezultat
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_GENERISANJA_RASPOREDA',
      poruka: error.message || 'Greška pri generisanju rasporeda'
    });
  }
}

module.exports = {
  generisiRaspored
};