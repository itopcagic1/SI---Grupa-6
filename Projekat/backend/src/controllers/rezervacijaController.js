const {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
} = require('../services/rezervacijaService');

const {
  kreirajGrupniTreningService,
  prijaviSeNaGrupniTreningService,
  getTrenerGrupniTreninziService,
  getGrupniTreninziService,
  otkaziGrupniTreningService,
  odjaviSeSaGrupnogTreningaService,
  getTrenerNotifikacijeService,
} = require('../services/grupneRezervacijeService');

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

const kreirajGrupniTrening = async (req, res) => {
  try {
    const terminId = req.params.id;
    const { maksimalanBrojIgraca, timId } = req.body;

    const rezultat = await kreirajGrupniTreningService(
      terminId,
      req.user.korisnikId,
      maksimalanBrojIgraca,
      timId
    );

    res.status(201).json({
      poruka: 'Grupni trening je uspješno kreiran.',
      trening: rezultat,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom kreiranja grupnog treninga.',
    });
  }
};

const prijaviSeNaGrupniTrening = async (req, res) => {
  try {
    const id = req.params.id;
    const rezultat = await prijaviSeNaGrupniTreningService(id, req.user.korisnikId);

    res.status(200).json({
      poruka: 'Uspješno ste se prijavili na grupni trening.',
      prijava: rezultat,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom prijave na grupni trening.',
    });
  }
};

const getTrenerGrupniTreninzi = async (req, res) => {
  try {
    const treninzi = await getTrenerGrupniTreninziService(req.user.korisnikId);
    res.json({ treninzi });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju grupnih treninga.',
    });
  }
};

const getGrupniTreninzi = async (req, res) => {
  try {
    const treninzi = await getGrupniTreninziService(req.user.korisnikId);
    res.json({ treninzi });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju grupnih treninga.',
    });
  }
};

const otkaziGrupniTrening = async (req, res) => {
  try {
    const treningId = req.params.id;
    const rezultat = await otkaziGrupniTreningService(treningId, req.user.korisnikId);
    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom otkazivanja grupnog treninga.',
    });
  }
};

const odjaviSeSaGrupnogTreninga = async (req, res) => {
  try {
    const treningId = req.params.id;
    const { razlog } = req.body || {};
    const rezultat = await odjaviSeSaGrupnogTreningaService(treningId, req.user.korisnikId, razlog);
    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom odjavljivanja sa grupnog treninga.',
    });
  }
};

const getTrenerNotifikacije = async (req, res) => {
  try {
    const notifikacije = await getTrenerNotifikacijeService(req.user.korisnikId);
    res.json({ notifikacije });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju obavijesti.',
    });
  }
};

module.exports = {
  getFreeIndividualTerms,
  kreirajIndividualnuRezervaciju,
  otkaziIndividualnuRezervaciju,
  kreirajGrupniTrening,
  prijaviSeNaGrupniTrening,
  getTrenerGrupniTreninzi,
  getGrupniTreninzi,
  otkaziGrupniTrening,
  odjaviSeSaGrupnogTreninga,
  getTrenerNotifikacije,
};