const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/controllers/adminController', () => ({
  getKorisnici: jest.fn((req, res) => res.status(200).json({ korisnici: [] })),
  getBlokiraniKorisnici: jest.fn((req, res) => res.status(200).json({ korisnici: [] })),
  getKorisnikDetalji: jest.fn((req, res) => res.status(200).json({ korisnik: {} })),
  obradiZahtjevUloge: jest.fn((req, res) => res.status(200).json({ poruka: 'OK' })),
  obrisiKorisnika: jest.fn((req, res) => res.status(200).json({ poruka: 'OK' })),
  blokirajKorisnika: jest.fn((req, res) => res.status(200).json({ poruka: 'OK' })),
  promijeniUlogu: jest.fn((req, res) => res.status(200).json({ poruka: 'OK' })),
}));

jest.mock('../../src/services/authService', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  logoutUser: jest.fn(),
  getUserProfile: jest.fn(),
}));

const authService = require('../../src/services/authService');
const authRoutes = require('../../src/routes/authRoutes');
const adminRoutes = require('../../src/routes/adminRoutes');
const ligaRoutes = require('../../src/routes/ligaRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/lige', ligaRoutes);
  return app;
}

function tokenFor(uloga) {
  return jwt.sign(
    { korisnikId: 100, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

describe('Sprint 6 permissions and security integration tests', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'integration-secret' };
    app = buildTestApp();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('zahtjev bez tokena prema zasticenoj ruti vraca unauthorized response', async () => {
    const res = await request(app).get('/api/admin/korisnici');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEOVLASTEN' }));
  });

  test('zahtjev sa nevalidnim tokenom vraca odgovarajuci unauthorized response', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(403);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'TOKEN_ISTEKAO' }));
  });

  test('TRENER ne moze pristupiti admin ruti', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici')
      .set('Authorization', `Bearer ${tokenFor('TRENER')}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'ZABRANJEN_PRISTUP' }));
  });

  test('obicni korisnik ne moze pristupiti admin ruti', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'ZABRANJEN_PRISTUP' }));
  });

  test('admin moze pristupiti admin ruti', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ korisnici: [] });
  });

  test('korisnik sa pogresnom ulogom ne moze pristupiti ruti za kreiranje lige', async () => {
    const res = await request(app)
      .post('/api/lige')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`)
      .send({ naziv: 'Test liga', sportId: 1 });

    expect(res.status).toBe(403);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'ZABRANJEN_PRISTUP' }));
  });

  test('zasticena ruta ne vraca osjetljive podatke bez tokena', async () => {
    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toContain('lozinka');
    expect(JSON.stringify(res.body)).not.toContain('password');
    expect(JSON.stringify(res.body)).not.toContain('lozinkaHash');
  });

  test('register response ne vraca plain password ni hash', async () => {
    authService.registerUser.mockResolvedValue({
      korisnikId: 10,
      email: 'test@example.com',
      punoIme: 'Test Korisnik',
      uloga: 'NAVIJAC',
      trazenaUloga: 'NAVIJAC',
      statusUloge: 'ODOBREN',
      datumZahtjeva: null,
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        lozinka: 'Lozinka123!',
        potvrdalozinke: 'Lozinka123!',
        trazenaUloga: 'NAVIJAC',
      });

    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).not.toContain('Lozinka123!');
    expect(JSON.stringify(res.body)).not.toContain('lozinkaHash');
  });

  test('login response ne vraca plain password ni hash', async () => {
    authService.loginUser.mockResolvedValue({
      korisnik: {
        korisnikId: 11,
        email: 'login@example.com',
        punoIme: 'Login Korisnik',
        uloga: 'NAVIJAC',
        trazenaUloga: 'NAVIJAC',
        statusUloge: 'ODOBREN',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', lozinka: 'Lozinka123!' });

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('Lozinka123!');
    expect(JSON.stringify(res.body)).not.toContain('lozinkaHash');
    expect(JSON.stringify(res.body)).not.toContain('refresh-token');
  });
});
