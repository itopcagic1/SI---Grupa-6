const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/sportService', () => ({
  getAllSports: jest.fn(),
  getSportById: jest.fn(),
  createSport: jest.fn(),
  updateSport: jest.fn(),
  deleteSport: jest.fn(),
}));

const sportService = require('../../src/services/sportService');
const sportRoutes = require('../../src/routes/sportRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/sports', sportRoutes);
  return app;
}

function tokenFor(uloga) {
  return jwt.sign(
    { korisnikId: 100, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

describe('Sprint 6 sport routes', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'sport-routes-secret' };
    app = buildTestApp();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('admin moze dohvatiti listu sportova', async () => {
    sportService.getAllSports.mockResolvedValue([
      { sportId: 1, naziv: 'Fudbal', opis: 'Fudbal', jeTimskiSport: true },
    ]);

    const res = await request(app)
      .get('/api/sports')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining({ sportId: 1, naziv: 'Fudbal' }),
    ]);
  });

  test('admin moze kreirati sport sa validnim nazivom', async () => {
    sportService.createSport.mockResolvedValue({
      sportId: 2,
      naziv: 'Rukomet',
      opis: 'Rukomet',
      jeTimskiSport: true,
    });

    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ naziv: 'Rukomet', opis: 'Rukomet', jeTimskiSport: true });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ naziv: 'Rukomet' }));
  });

  test('admin moze urediti postojeci sport', async () => {
    sportService.updateSport.mockResolvedValue({
      sportId: 2,
      naziv: 'Rukomet',
      opis: 'Dvoranski timski sport',
      jeTimskiSport: true,
    });

    const res = await request(app)
      .patch('/api/sports/2')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ opis: 'Dvoranski timski sport' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ opis: 'Dvoranski timski sport' }));
  });

  test('admin moze obrisati sport', async () => {
    sportService.deleteSport.mockResolvedValue({ sportId: 2 });

    const res = await request(app)
      .delete('/api/sports/2')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ message: 'Sport successfully deleted.' }));
  });

  test('sistem blokira kreiranje sporta bez naziva ili sa praznim nazivom ako je validacija implementirana', async () => {
    sportService.createSport.mockResolvedValue({
      sportId: 3,
      naziv: '',
      opis: 'Nevalidan sport',
      jeTimskiSport: true,
    });

    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ naziv: '', opis: 'Nevalidan sport' });

    expect(res.status).toBe(400);
  });

  test('sistem blokira kreiranje duplikata sporta ako je implementirano', async () => {
    sportService.createSport.mockRejectedValue(new Error('Sport sa ovim nazivom vec postoji!'));

    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ naziv: 'Fudbal', opis: 'Duplikat' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ error: expect.any(String) }));
  });

  test('ne-admin korisnik ne moze kreirati sport', async () => {
    sportService.createSport.mockResolvedValue({
      sportId: 4,
      naziv: 'Odbojka',
      opis: 'Odbojka',
      jeTimskiSport: true,
    });

    const res = await request(app)
      .post('/api/sports')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`)
      .send({ naziv: 'Odbojka', opis: 'Odbojka' });

    expect(res.status).toBe(403);
  });

  test('ne-admin korisnik ne moze urediti sport', async () => {
    sportService.updateSport.mockResolvedValue({
      sportId: 1,
      naziv: 'Fudbal',
      opis: 'Izmijenjen opis',
      jeTimskiSport: true,
    });

    const res = await request(app)
      .patch('/api/sports/1')
      .set('Authorization', `Bearer ${tokenFor('TRENER')}`)
      .send({ opis: 'Izmijenjen opis' });

    expect(res.status).toBe(403);
  });

  test('ne-admin korisnik ne moze obrisati sport', async () => {
    sportService.deleteSport.mockResolvedValue({ sportId: 1 });

    const res = await request(app)
      .delete('/api/sports/1')
      .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR')}`);

    expect(res.status).toBe(403);
  });

  test('zahtjev bez tokena ne moze kreirati sport ako je ruta zasticena', async () => {
    const res = await request(app)
      .post('/api/sports')
      .send({ naziv: 'Kosarka', opis: 'Kosarka' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEOVLASTEN' }));
  });

  test('zahtjev bez tokena ne moze urediti sport ako je ruta zasticena', async () => {
    const res = await request(app)
      .patch('/api/sports/1')
      .send({ opis: 'Novo' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEOVLASTEN' }));
  });

  test('zahtjev bez tokena ne moze obrisati sport ako je ruta zasticena', async () => {
    const res = await request(app).delete('/api/sports/1');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEOVLASTEN' }));
  });

  test('rad nad nepostojecim sportom vraca odgovarajuci error response', async () => {
    sportService.getSportById.mockResolvedValue(null);

    const res = await request(app).get('/api/sports/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({ error: 'Sport not found.' }));
  });
});
