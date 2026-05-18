const facilityService = require('../services/facilityService');

const createFacility = async (req, res) => {
  try {
     const ownerId = req.user?.korisnikId || req.body.vlasnikId; 
    
    if (!ownerId) {
      return res.status(400).json({ error: "Identifikator vlasnika (vlasnikId) je obavezan." });
    }

    const newFacility = await facilityService.createFacilityService(req.body, ownerId);
    res.status(201).json(newFacility);
  } catch (error) {
    res.status(500).json({ error: "Greška prilikom kreiranja objekta: " + error.message });
  }
};

const getAllFacilities = async (req, res) => {
  try {
    const { grad, status } = req.query;
    const currentUserId = req.user?.korisnikId; 
    const facilities = await facilityService.getAllFacilitiesService({ grad, status }, currentUserId);
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: "Greška pri dohvaćanju objekata: " + error.message });
  }
};

const getFacilityById = async (req, res) => {
  try {
    const facility = await facilityService.getFacilityByIdService(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: "Sportski objekat nije pronađen." });
    }
    res.json(facility);
  } catch (error) {
    res.status(500).json({ error: "Greška pri dohvaćanju detalja objekta: " + error.message });
  }
};


const updateFacility = async (req, res) => {
  try {
    const currentUserId = req.user?.korisnikId || req.body.vlasnikId;
    const updated = await facilityService.updateFacilityService(req.params.id, req.body, currentUserId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFacility = async (req, res) => {
  try {
    const currentUserId = req.user?.korisnikId || req.body.vlasnikId;
    await facilityService.deleteFacilityService(req.params.id, currentUserId);
    res.json({ message: "Sportski objekat je uspješno deaktiviran (soft-delete)." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFacility,
  getAllFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility
};