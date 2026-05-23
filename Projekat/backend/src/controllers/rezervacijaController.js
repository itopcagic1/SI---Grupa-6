const {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
} = require('../services/rezervacijaService');

const getFreeIndividualTerms = async (req, res) => {
  try {
    const termini = await getAllTermsService(req.user.korisnikId);
    res.json({ termini });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju termina.',
    });
  }
};

const kreirajIndividualnuRezervaciju = async (req, res) => {
  try {
    const terminId = req.params.id;
    const isTrusted = req.user?.statusPouzdanosti !== 'NEPOUZDAN';

    const rezultat = await createIndividualReservationService(
      terminId,
      req.user,
      isTrusted
    );

    if (rezultat.tip === 'REZERVISANO') {
      return res.json({
        poruka: 'Termin je uspješno rezervisan.',
        status: 'POTVRDJENA',
      });
    }

    return res.json({
      poruka: 'Vaš zahtjev je poslan na čekanje i biće obrađen od strane administratora.',
      status: 'NA_CEKANJU',
    });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom rezervacije termina.',
    });
  }
};

const otkaziIndividualnuRezervaciju = async (req, res) => {
  try {
    const terminId = req.params.id;
    const rezultat = await cancelIndividualReservationService(terminId, req.user.korisnikId);
    return res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom otkazivanja rezervacije.',
    });
  }
};

module.exports = {
  getFreeIndividualTerms,
  kreirajIndividualnuRezervaciju,
  otkaziIndividualnuRezervaciju,
};