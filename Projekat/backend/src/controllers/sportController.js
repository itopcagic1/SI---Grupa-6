const sportService = require('../services/sportService');

const getAllSports = async (req, res) => {
  try {
    const sports = await sportService.getAllSports();
    res.json(sports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getSportById = async (req, res) => {
  try {
    const sport = await sportService.getSportById(req.params.id);
   if (!sport) {
      return res.status(404).json({ error: "Sport not found." });
    }
    res.json(sport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createSport = async (req, res) => {
  try {
    const naziv = typeof req.body.naziv === 'string' ? req.body.naziv.trim() : '';

    if (!naziv) {
      return res.status(400).json({ error: 'Naziv sporta je obavezan.' });
    }

    req.body.naziv = naziv;
    const newSport = await sportService.createSport(req.body);
    res.status(201).json(newSport);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateSport = async (req, res) => {
  try {
    const updated = await sportService.updateSport(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteSport = async (req, res) => {
  try {
    await sportService.deleteSport(req.params.id);
    res.json({ message: "Sport successfully deleted." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllSports, getSportById, createSport, updateSport, deleteSport };
