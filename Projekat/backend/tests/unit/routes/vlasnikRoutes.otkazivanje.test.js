const express = require('express');
const request = require('supertest');

function createAppWithRoleMiddleware(roleMiddleware) {
  jest.resetModules();

  jest.doMock('../../../src/controllers/vlasnikController', () => ({
    dohvatiSveRezervacije: jest.fn((req, res) => res.json({ route: 'dohvatiSveRezervacije' })),
    obradiZahtjevVerifikacije: jest.fn((req, res) => res.json({ route: 'obradiZahtjevVerifikacije' })),
    otkaziRezervacijuVlasnik: jest.fn((req, res) => res.status(200).json({ route: 'otkaziRezervacijuVlasnik' })),
  }));

  jest.doMock('../../../src/controllers/rezervacijaController', () => ({
    ownerCancelReservation: jest.fn(),
  }));

  jest.doMock('../../../src/middleware/authMiddleware', () => ({
    authenticateToken: jest.fn((req, res, next) => {
      req.user = { korisnikId: 1, uloga: 'VLASNIK' };
      next();
    }),
  }));

  jest.doMock('../../../src/middleware/roleMiddleware', () => ({
    requireRole: jest.fn(() => roleMiddleware),
  }));

  const vlasnikRoutes = require('../../../src/routes/vlasnikRoutes');
  const vlasnikController = require('../../../src/controllers/vlasnikController');
  const { authenticateToken } = require('../../../src/middleware/authMiddleware');
  const { requireRole } = require('../../../src/middleware/roleMiddleware');

  const app = express();
  app.use(express.json());
  app.use('/api/vlasnik', vlasnikRoutes);

  return { app, vlasnikController, authenticateToken, requireRole };
}

describe('Developer 3 - vlasnicko otkazivanje rezervacije ruta', () => {
  afterEach(() => {
    jest.dontMock('../../../src/controllers/vlasnikController');
    jest.dontMock('../../../src/controllers/rezervacijaController');
    jest.dontMock('../../../src/middleware/authMiddleware');
    jest.dontMock('../../../src/middleware/roleMiddleware');
  });

  test('POST /api/vlasnik/rezervacije/:id/otkazivanje je registrovan i zasticen vlasnickom rolom', async () => {
    const { app, vlasnikController, authenticateToken, requireRole } = createAppWithRoleMiddleware(
      (req, res, next) => next()
    );

    await request(app)
      .post('/api/vlasnik/rezervacije/42/otkazivanje')
      .send({ razlog: 'Validan razlog otkazivanja' })
      .expect(200);

    expect(authenticateToken).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith('VLASNIK');
    expect(vlasnikController.otkaziRezervacijuVlasnik).toHaveBeenCalled();
  });

  test('POST /api/vlasnik/rezervacije/:id/otkazivanje vraca 403 kada role middleware zabrani pristup', async () => {
    const { app, vlasnikController } = createAppWithRoleMiddleware((req, res) => {
      res.status(403).json({ greska: 'ZABRANJEN_PRISTUP' });
    });

    const response = await request(app)
      .post('/api/vlasnik/rezervacije/42/otkazivanje')
      .send({ razlog: 'Validan razlog otkazivanja' })
      .expect(403);

    expect(response.body).toEqual({ greska: 'ZABRANJEN_PRISTUP' });
    expect(vlasnikController.otkaziRezervacijuVlasnik).not.toHaveBeenCalled();
  });
});
