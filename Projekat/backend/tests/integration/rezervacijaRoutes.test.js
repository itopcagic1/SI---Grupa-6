const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock reliabilityMiddleware to avoid DB queries
jest.mock('../../src/middleware/reliabilityMiddleware', () => ({
  reliabilityMiddleware: jest.fn((req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ greska: 'NEOVLASTEN' });
    }
    req.user.isTrusted = true;
    req.user.statusPouzdanosti = 'AKTIVAN';
    next();
  })
}));

// Mock the controller functions
jest.mock('../../src/controllers/rezervacijaController', () => ({
  getFreeIndividualTerms: jest.fn((req, res) => res.status(200).json({ slobodniTermini: [] })),
  kreirajIndividualnuRezervaciju: jest.fn((req, res) => res.status(201).json({ poruka: 'Rezervacija kreirana' })),
  otkaziIndividualnuRezervaciju: jest.fn((req, res) => res.status(200).json({ poruka: 'Rezervacija otkazana' })),
  kreirajGrupniTrening: jest.fn((req, res) => res.status(201).json({ poruka: 'Grupni trening kreiran' })),
  prijaviSeNaGrupniTrening: jest.fn((req, res) => res.status(200).json({ poruka: 'Prijava uspješna' })),
  getTrenerGrupniTreninzi: jest.fn((req, res) => res.status(200).json([])),
  getGrupniTreninzi: jest.fn((req, res) => res.status(200).json([])),
  otkaziGrupniTrening: jest.fn((req, res) => res.status(200).json({ poruka: 'Trening otkazan' })),
  odjaviSeSaGrupnogTreninga: jest.fn((req, res) => res.status(200).json({ poruka: 'Odjava uspješna' })),
  getTrenerNotifikacije: jest.fn((req, res) => res.status(200).json([]))
}));

const rezervacijaRoutes = require('../../src/routes/rezervacijaRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', rezervacijaRoutes);
  return app;
}

function tokenFor(uloga, korisnikId = 100) {
  return jwt.sign(
    { korisnikId, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '15m' }
  );
}

describe('Rezervacija i Grupni Trening integration tests', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' };
    app = buildTestApp();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('Individualne rezervacije (IGRAC)', () => {
    test('GET /api/rezervacije/slobodni/individualni - success for IGRAC', async () => {
      const res = await request(app)
        .get('/api/rezervacije/slobodni/individualni')
        .set('Authorization', `Bearer ${tokenFor('IGRAC')}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('slobodniTermini');
    });

    test('GET /api/rezervacije/slobodni/individualni - 403 for TRENER', async () => {
      const res = await request(app)
        .get('/api/rezervacije/slobodni/individualni')
        .set('Authorization', `Bearer ${tokenFor('TRENER')}`);
      
      expect(res.status).toBe(403);
    });

    test('POST /api/rezervacije/individualne/:id - success for IGRAC', async () => {
      const res = await request(app)
        .post('/api/rezervacije/individualne/1')
        .set('Authorization', `Bearer ${tokenFor('IGRAC')}`);

      expect(res.status).toBe(201);
      expect(res.body.poruka).toBe('Rezervacija kreirana');
    });

    test('DELETE /api/rezervacije/individualne/:id - success for IGRAC', async () => {
      const res = await request(app)
        .delete('/api/rezervacije/individualne/1')
        .set('Authorization', `Bearer ${tokenFor('IGRAC')}`);

      expect(res.status).toBe(200);
      expect(res.body.poruka).toBe('Rezervacija otkazana');
    });
  });

  describe('Grupni treninzi i prijave (TRENER i IGRAC)', () => {
    test('POST /api/rezervacije/grupne/:id - success for TRENER', async () => {
      const res = await request(app)
        .post('/api/rezervacije/grupne/1')
        .set('Authorization', `Bearer ${tokenFor('TRENER')}`)
        .send({ maxKapacitet: 10, timId: 2 });

      expect(res.status).toBe(201);
      expect(res.body.poruka).toBe('Grupni trening kreiran');
    });

    test('POST /api/rezervacije/grupne/:id - 403 for IGRAC', async () => {
      const res = await request(app)
        .post('/api/rezervacije/grupne/1')
        .set('Authorization', `Bearer ${tokenFor('IGRAC')}`);

      expect(res.status).toBe(403);
    });

    test('POST /api/rezervacije/grupne/:id/prijave - success for IGRAC', async () => {
      const res = await request(app)
        .post('/api/rezervacije/grupne/1/prijave')
        .set('Authorization', `Bearer ${tokenFor('IGRAC')}`);

      expect(res.status).toBe(200);
      expect(res.body.poruka).toBe('Prijava uspješna');
    });

    test('GET /api/rezervacije/grupne/moje - success for TRENER', async () => {
      const res = await request(app)
        .get('/api/rezervacije/grupne/moje')
        .set('Authorization', `Bearer ${tokenFor('TRENER')}`);

      expect(res.status).toBe(200);
    });

    test('GET /api/rezervacije/grupne/sve - success for IGRAC', async () => {
      const res = await request(app)
        .get('/api/rezervacije/grupne/sve')
        .set('Authorization', `Bearer ${tokenFor('IGRAC')}`);

      expect(res.status).toBe(200);
    });

    test('DELETE /api/rezervacije/grupne/:id - success for TRENER', async () => {
      const res = await request(app)
        .delete('/api/rezervacije/grupne/1')
        .set('Authorization', `Bearer ${tokenFor('TRENER')}`);

      expect(res.status).toBe(200);
    });

    test('DELETE /api/rezervacije/grupne/:id/prijave - success for IGRAC', async () => {
      const res = await request(app)
        .delete('/api/rezervacije/grupne/1/prijave')
        .set('Authorization', `Bearer ${tokenFor('IGRAC')}`)
        .send({ razlog: 'Bolest' });

      expect(res.status).toBe(200);
    });

    test('GET /api/rezervacije/grupne/notifikacije - success for TRENER', async () => {
      const res = await request(app)
        .get('/api/rezervacije/grupne/notifikacije')
        .set('Authorization', `Bearer ${tokenFor('TRENER')}`);

      expect(res.status).toBe(200);
    });
  });
});
