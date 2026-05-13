const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/applicationService', () => ({
  dohvatiMojePrijave: jest.fn(),
}));

const applicationService = require('../../src/services/applicationService');
const applicationRoutes = require('../../src/routes/applicationRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/applications', applicationRoutes);
  return app;
}

function tokenFor(uloga, korisnikId = 100) {
  return jwt.sign(
    { korisnikId, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

describe('application routes', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'application-routes-secret' };
    app = buildTestApp();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('TRENER moze dohvatiti samo svoje prijave', async () => {
    applicationService.dohvatiMojePrijave.mockResolvedValue([
      {
        prijavaId: 1,
        tim: 'FK Test',
        takmicenje: 'Premijer liga',
        sport: 'Fudbal',
        status: 'PENDING',
        datumPrijave: '2026-05-01T10:00:00.000Z',
        defaultnaLokacija: 'Arena Centar',
      },
    ]);

    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${tokenFor('TRENER', 10)}`);

    expect(res.status).toBe(200);
    expect(applicationService.dohvatiMojePrijave).toHaveBeenCalledWith(10);
    expect(res.body).toEqual(expect.objectContaining({ uspjeh: true, ukupno: 1 }));
    expect(res.body.prijave[0]).toEqual(expect.objectContaining({ tim: 'FK Test' }));
  });

  test('prazna lista se vraca kao uspjesan response', async () => {
    applicationService.dohvatiMojePrijave.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${tokenFor('TRENER', 10)}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ ukupno: 0, prijave: [] }));
  });

  test('korisnik bez tokena ne moze pristupiti endpointu', async () => {
    const res = await request(app).get('/api/applications/my');

    expect(res.status).toBe(401);
    expect(applicationService.dohvatiMojePrijave).not.toHaveBeenCalled();
  });

  test('korisnik koji nije TRENER ne moze pristupiti endpointu', async () => {
    const res = await request(app)
      .get('/api/applications/my')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC', 10)}`);

    expect(res.status).toBe(403);
    expect(applicationService.dohvatiMojePrijave).not.toHaveBeenCalled();
  });
});
