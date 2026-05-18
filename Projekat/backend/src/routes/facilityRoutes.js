const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');

const { authenticateToken } = require('../middleware/authMiddleware'); 

// POST /api/objekti — Kreiranje (Samo ulogovani vlasnik)
router.post('/objekti', authenticateToken, facilityController.createFacility);

// GET /api/objekti — Lista objekata 
router.get('/objekti', authenticateToken, facilityController.getAllFacilities); 

// POST /api/objekti/:id/termini — Kreiranje termina za sportski objekat
router.post('/objekti/:id/termini', authenticateToken, facilityController.createFacilityTerms);

// GET /api/objekti/:id/termini?od=&do= — Dohvat termina za kalendar
router.get('/objekti/:id/termini', facilityController.getFacilityTerms);

// PUT /api/termini/:id — Izmjena termina
router.put('/termini/:id', authenticateToken, facilityController.updateFacilityTerm);

// DELETE /api/termini/:id — Soft block termina
router.delete('/termini/:id', authenticateToken, facilityController.blockFacilityTerm);

// GET /api/objekti/:id — Detalji (javno)
router.get('/objekti/:id', facilityController.getFacilityById);

// PUT /api/objekti/:id — Izmjena podataka (Samo vlasnik tog objekta)
router.put('/objekti/:id', authenticateToken, facilityController.updateFacility);

// DELETE /api/objekti/:id — Soft-delete (Samo vlasnik tog objekta)
router.delete('/objekti/:id', authenticateToken, facilityController.deleteFacility);


module.exports = router;
