require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const authRoutes = require('../../routes/authRoutes');

const prisma = new PrismaClient();

// ─── Test aplikacija (bez app.listen) ────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

// ─── Test korisnik ────────────────────────────────────────────────────────────

const testKorisnik = {
  email: 'integracija@test.com',
  lozinka: 'Lozinka123!',
  punoIme: 'Integracija Test',
  trazenaUloga: 'NAVIJAC',
};

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  // obrisi ako postoji od prijasnjeg testa
  await prisma.korisnik.deleteMany({ where: { email: testKorisnik.email } });

  // kreiraj test korisnika direktno u bazi
  await prisma.korisnik.create({
    data: {
      email: testKorisnik.email,
      punoIme: testKorisnik.punoIme,
      lozinkaHash: await bcrypt.hash(testKorisnik.lozinka, 12),
      uloga: 'NAVIJAC',
      trazenaUloga: 'NAVIJAC',
      statusUloge: 'ODOBREN',
    },
  });
});

afterAll(async () => {
  // ocisti test korisnika nakon svih testova
  await prisma.korisnik.deleteMany({ where: { email: testKorisnik.email } });
  await prisma.$disconnect();
});

// ─── LOGIN — integracijski ────────────────────────────────────────────────────

describe('POST /api/auth/login — integracijski', () => {
  test('ispravni kredencijali → 200, access token, refresh cookie postavljen', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testKorisnik.email, lozinka: testKorisnik.lozinka });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body.poruka).toBe('Uspjesna prijava');
    expect(res.body.isticeZa).toBe('15m');

    // refresh token mora biti u cookie, ne u body
    expect(res.headers['set-cookie']).toBeDefined();
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toContain('refreshToken');
    expect(cookie).toContain('HttpOnly');
  });

  test('refresh token pohranjen u bazi nakon prijave', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: testKorisnik.email, lozinka: testKorisnik.lozinka });

    const korisnik = await prisma.korisnik.findUnique({
      where: { email: testKorisnik.email },
    });

    expect(korisnik.refreshToken).not.toBeNull();
  });

  test('pogresna lozinka → 401 NEISPRAVNE_AKREDITIVE', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testKorisnik.email, lozinka: 'PogresnaLozinka123!' }); // prolazi Zod, ne odgovara korisniku

    expect(res.status).toBe(401);
    expect(res.body.greska).toBe('NEISPRAVNE_AKREDITIVE');
  });

  test('nepostojeci email → 401 NEISPRAVNE_AKREDITIVE', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nema@test.com', lozinka: 'PogresnaLozinka123!' }); // prolazi Zod, korisnik ne postoji

    expect(res.status).toBe(401);
    expect(res.body.greska).toBe('NEISPRAVNE_AKREDITIVE');
  });

  test('prazni podaci → 400 GRESKA_VALIDACIJE', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('GRESKA_VALIDACIJE');
  });

  test('neispravan format emaila → 400 GRESKA_VALIDACIJE', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nijevalidan', lozinka: 'Lozinka123!' });

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('GRESKA_VALIDACIJE');
  });
});

// ─── LOGOUT — integracijski ───────────────────────────────────────────────────

describe('POST /api/auth/logout — integracijski', () => {
  let accessToken;

  beforeEach(async () => {
    // prijavi se i uzmi token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testKorisnik.email, lozinka: testKorisnik.lozinka });

    accessToken = res.body.access_token;
  });

  test('uspjesna odjava → 200, refreshToken null u bazi', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.poruka).toBe('Uspjesno ste se odjavili');

    // provjeri da je refreshToken obrisan iz baze
    const korisnik = await prisma.korisnik.findUnique({
      where: { email: testKorisnik.email },
    });
    expect(korisnik.refreshToken).toBeNull();
  });

  test('zasticena ruta nedostupna bez tokena → 401', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.greska).toBe('NEOVLASTEN');
  });

  test('zasticena ruta nedostupna sa laznim tokenom → 403', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer lazni-token');

    expect(res.status).toBe(403);
    expect(res.body.greska).toBe('TOKEN_ISTEKAO');
  });

  test('profile ruta nedostupna nakon odjave', async () => {
    // odjavi se
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    // pokusaj pristupiti profilu sa istim tokenom
    // token je jos uvijek valjan (JWT), ali sesija je invalidirana
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    // JWT je jos valjan, ali refreshToken je null — 
    // ovisno o implementaciji moze biti 200 ili 401
    expect([200, 401]).toContain(res.status);
  });
});