const notifikacijaService = require('../services/notifikacijaService');

const getUserIdFromToken = (req) => req.user.id || req.user.korisnikId || req.user.userId;

exports.getNotifikacije = async (req, res) => {
  try {
    const korisnikId = getUserIdFromToken(req);
    const notifikacije = await notifikacijaService.getNotifikacijeService(korisnikId);
    res.json({ notifikacije });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Greška pri preuzimanju notifikacija.' });
  }
};

exports.getNeprocitaneCount = async (req, res) => {
  try {
    const korisnikId = getUserIdFromToken(req);
    const count = await notifikacijaService.getNeprocitaneCountService(korisnikId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Greška pri brojanju nepročitanih notifikacija.' });
  }
};

exports.oznaciKaoProcitano = async (req, res) => {
  try {
    const korisnikId = getUserIdFromToken(req);
    const notifikacijaId = req.params.id;
    await notifikacijaService.oznaciKaoProcitanoService(notifikacijaId, korisnikId);
    res.json({ message: 'Notifikacija označena kao pročitana.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Greška pri ažuriranju notifikacije.' });
  }
};

exports.oznaciSveKaoProcitano = async (req, res) => {
  try {
    const korisnikId = getUserIdFromToken(req);
    await notifikacijaService.oznaciSveKaoProcitanoService(korisnikId);
    res.json({ message: 'Sve notifikacije označene kao pročitane.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Greška pri ažuriranju svih notifikacija.' });
  }
};