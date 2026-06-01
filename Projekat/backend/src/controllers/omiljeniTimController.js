const omiljeniTimService = require('../services/omiljeniTimService');

const getUserIdFromToken = (req) => req.user.id || req.user.korisnikId || req.user.userId;

exports.setOmiljeniTim = async (req, res) => {
  try {
    const korisnikId = getUserIdFromToken(req);
    const timId = parseInt(req.params.timId);
    if (!timId) {
      return res.status(400).json({ message: "ID tima je obavezan." });
    }
    const result = await omiljeniTimService.setOmiljeniTimService(korisnikId, timId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Greška pri postavljanju omiljenog tima." });
  }
};

exports.removeOmiljeniTim = async (req, res) => {
  try {
    const korisnikId = getUserIdFromToken(req);
    const timId = parseInt(req.params.timId);
    if (!timId) {
      return res.status(400).json({ message: "ID tima je obavezan." });
    }
    await omiljeniTimService.removeOmiljeniTimService(korisnikId, timId);
    res.json({ message: "Omiljeni tim uspješno uklonjen." });
  } catch (error) {
    res.status(500).json({ message: error.message || "Greška pri uklanjanju omiljenog tima." });
  }
};

exports.getOmiljeniTimovi = async (req, res) => {
  try {
    const korisnikId = getUserIdFromToken(req);
    const items = await omiljeniTimService.getOmiljeniTimoviService(korisnikId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message || "Greška pri dobavljanju omiljenih timova." });
  }
};
