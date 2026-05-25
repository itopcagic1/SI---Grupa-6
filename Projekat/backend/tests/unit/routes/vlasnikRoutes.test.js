const express = require('express');
const request = require('supertest');

jest.mock('../../../src/controllers/vlasnikController', () => ({
  dohvatiSveRezervacije: jest.fn((req, res) => res.json({ route: 'dohvatiSveRezervacije' })),
  obradiZahtjevVerifikacije: jest.fn((req, res) => res.json({ route: 'obradiZahtjevVerifikacije' })),
}));

jest.mock('../../../src/middleware/authMiddleware', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { korisnikId: 1, uloga: 'VLASNIK' };
    next();
  }),
}));

jest.mock('../../../src/middleware/roleMiddleware', () => ({
  requireRole: jest.fn(() => (req, res, next) => next()),
}));

const vlasnikController = require('../../../src/controllers/vlasnikController');
const { authenticateToken } = require('../../../src/middleware/authMiddleware');
const { requireRole } = require('../../../src/middleware/roleMiddleware');
const vlasnikRoutes = require('../../../src/routes/vlasnikRoutes');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/vlasnik', vlasnikRoutes);
  return app;
}

describe('vlasnikRoutes', () => {
  let app;

  beforeEach(() => {
    authenticateToken.mockClear();
    vlasnikController.obradiZahtjevVerifikacije.mockClear();
    vlasnikController.dohvatiSveRezervacije.mockClear();
    app = createApp();
  });

  test('PATCH /api/vlasnik/zahtjevi/:id/verifikacija je registrovan i zaštićen vlasničkom rolom', async () => {
    await request(app)
      .patch('/api/vlasnik/zahtjevi/10/verifikacija')
      .send({ akcija: 'ODOBRI' })
      .expect(200);

    expect(authenticateToken).toHaveBeenCalled();
    expect(requireRole).toHaveBeenCalledWith('VLASNIK');
    expect(vlasnikController.obradiZahtjevVerifikacije).toHaveBeenCalled();
  });
});
