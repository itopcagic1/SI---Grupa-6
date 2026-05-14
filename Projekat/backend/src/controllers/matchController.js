const matchService = require('../services/matchService');

function parsePositiveInteger(value, fieldName) {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    const error = new Error(`${fieldName} mora biti poslan samo jednom`);
    error.status = 400;
    error.code = 'INVALID_QUERY_PARAM';
    throw error;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} mora biti pozitivan cijeli broj`);
    error.status = 400;
    error.code = 'INVALID_QUERY_PARAM';
    throw error;
  }

  return parsed;
}

function parseDateRange(value) {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    const error = new Error('datum mora biti poslan samo jednom');
    error.status = 400;
    error.code = 'INVALID_DATE';
    throw error;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(value)) {
    const error = new Error('datum mora biti u formatu YYYY-MM-DD');
    error.status = 400;
    error.code = 'INVALID_DATE';
    throw error;
  }

  const start = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== value) {
    const error = new Error('Nevažeći datum');
    error.status = 400;
    error.code = 'INVALID_DATE';
    throw error;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

async function getPublicMatches(req, res) {
  try {
    const { sportId, takmicenjeId, timId, datum } = req.query;
    const dateRange = parseDateRange(datum);

    const filters = {
      sportId: parsePositiveInteger(sportId, 'sportId'),
      takmicenjeId: parsePositiveInteger(takmicenjeId, 'takmicenjeId'),
      timId: parsePositiveInteger(timId, 'timId'),
      datumOd: dateRange?.start,
      datumDo: dateRange?.end
    };

    const utakmice = await matchService.getPublicMatches(filters);
    return res.status(200).json(utakmice);
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_DOHVATANJA_UTAKMICA',
      poruka: error.message || 'Greška pri dohvatanju utakmica'
    });
  }
}
async function generisiRaspored(req, res) {
  try {
    const { takmicenjeId, pocetniDatum, defaultnoVrijeme, defaultnaLokacija } = req.body;

    // 1. VALIDACIJA FORMATA DATUMA
    if (pocetniDatum !== undefined) {
      const datum = new Date(pocetniDatum);
      if (!pocetniDatum || isNaN(datum.getTime())) {
        return res.status(400).json({
          greska: 'INVALID_DATE',
          poruka: 'Nevažeći format datuma'
        });
      }

      // 2. VALIDACIJA PROŠLOSTI
      const danas = new Date();
      danas.setHours(0, 0, 0, 0);
      if (datum < danas) {
        return res.status(400).json({
          greska: 'DATE_IN_PAST',
          poruka: 'Datum ne može biti u prošlosti.'
        });
      }
    }

    // 3. VALIDACIJA VREMENA
    if (defaultnoVrijeme !== undefined) {
      const vrijemeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!vrijemeRegex.test(defaultnoVrijeme)) {
        return res.status(400).json({
          greska: 'INVALID_TIME',
          poruka: 'Nevažeći format vremena.'
        });
      }
    }

    // 4. PROVJERA OBAVEZNIH POLJA
    if (takmicenjeId === undefined || pocetniDatum === undefined || defaultnoVrijeme === undefined) {
      return res.status(400).json({
        greska: 'MISSING_REQUIRED_FIELDS',
        poruka: 'Sva polja su obavezna.'
      });
    }

    // Poziv servisa
    const rezultat = await matchService.generisiRaspored(
      { takmicenjeId, pocetniDatum, defaultnoVrijeme, defaultnaLokacija },
      { korisnikId: req.user.korisnikId, uloga: req.user.uloga }
    );

    return res.status(201).json({ uspjeh: true, ...rezultat });

  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_GENERISANJA_RASPOREDA',
      poruka: error.message
    });
  }
}

module.exports = {
  getPublicMatches,
  generisiRaspored
};
