const express = require('express');
const request = require('supertest');

const facilityController = require('../../../src/controllers/facilityController');
const { authenticateToken } = require('../../../src/middleware/authMiddleware');

jest.mock('../../../src/controllers/facilityController', () => ({
  createFacility: jest.fn((req, res) => res.status(201).json({ route: 'createFacility' })),
  getAllFacilities: jest.fn((req, res) => res.json({ route: 'getAllFacilities' })),
  getFacilityById: jest.fn((req, res) => res.json({ route: 'getFacilityById' })),
  updateFacility: jest.fn((req, res) => res.json({ route: 'updateFacility' })),
  deleteFacility: jest.fn((req, res) => res.json({ route: 'deleteFacility' })),
  createFacilityTerms: jest.fn((req, res) => res.status(201).json({ route: 'createFacilityTerms' })),
  getFacilityTerms: jest.fn((req, res) => res.json({ route: 'getFacilityTerms' })),
  updateFacilityTerm: jest.fn((req, res) => res.json({ route: 'updateFacilityTerm' })),
  blockFacilityTerm: jest.fn((req, res) => res.json({ route: 'blockFacilityTerm' })),
}));

jest.mock('../../../src/middleware/authMiddleware', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { korisnikId: 10, uloga: 'VLASNIK' };
    next();
  }),
}));

const facilityRoutes = require('../../../src/routes/facilityRoutes');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', facilityRoutes);
  return app;
}

describe('facilityRoutes termini objekta', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  test('POST /api/objekti/:id/termini je registrovan i koristi auth middleware i controller', async () => {
    await request(app)
      .post('/api/objekti/1/termini')
      .send({ vrijemePocetka: '2026-05-20T18:00:00.000Z', trajanje: 60 })
      .expect(201);

    expect(authenticateToken).toHaveBeenCalled();
    expect(facilityController.createFacilityTerms).toHaveBeenCalled();
  });

  test('GET /api/objekti/:id/termini je registrovan i poziva controller', async () => {
    await request(app)
      .get('/api/objekti/1/termini?od=2026-05-20T00:00:00.000Z&do=2026-05-27T00:00:00.000Z')
      .expect(200);

    expect(facilityController.getFacilityTerms).toHaveBeenCalled();
  });

  test('PUT /api/termini/:id je registrovan i koristi auth middleware i controller', async () => {
    await request(app)
      .put('/api/termini/7')
      .send({ vrijemePocetka: '2026-05-20T19:00:00.000Z', trajanje: 90 })
      .expect(200);

    expect(authenticateToken).toHaveBeenCalled();
    expect(facilityController.updateFacilityTerm).toHaveBeenCalled();
  });

  test('DELETE /api/termini/:id je registrovan i koristi auth middleware i controller', async () => {
    await request(app)
      .delete('/api/termini/7')
      .expect(200);

    expect(authenticateToken).toHaveBeenCalled();
    expect(facilityController.blockFacilityTerm).toHaveBeenCalled();
  });
});
