require('dotenv').config({ path: '.env.test' });


jest.mock('../../middleware/authMiddleware', () => {
  const original = jest.requireActual('../../middleware/authMiddleware');
  return {
    ...original,
    authLimiter: (req, res, next) => next(),
  };
});

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('../../routes/authRoutes');

const prisma = new PrismaClient();

// ─── Test aplikacija ──────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

// ─── Test email ───────────────────────────────────────────────────────────────

const testEmail = 'registracija@test.com';

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(async () => {
  await prisma.korisnik.deleteMany({ where: { email: testEmail } });
});

afterAll(async () => {
  await prisma.korisnik.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

// ─── REGISTER — integracijski ─────────────────────────────────────────────────

describe('POST /api/auth/register — integracijski', () => {
  const validniPodaci = {
    punoIme: 'Test Korisnik',
    email: testEmail,
    lozinka: 'Lozinka123!',
    trazenaUloga: 'NAVIJAC',
  };

  test('uspjesna registracija kao NAVIJAC → 201, korisnik upisan u bazu', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validniPodaci);

    expect(res.status).toBe(201);
    expect(res.body.korisnik.email).toBe(testEmail);
    expect(res.body.korisnik.trenutnaUloga).toBe('NAVIJAC');
    expect(res.body.poruka_uloge.status).toBe('ODOBREN');

    const korisnik = await prisma.korisnik.findUnique({ where: { email: testEmail } });
    expect(korisnik).not.toBeNull();
    expect(korisnik.uloga).toBe('NAVIJAC');
  });

  test('lozinka je hashirana u bazi — nije plain text', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(validniPodaci);

    const korisnik = await prisma.korisnik.findUnique({ where: { email: testEmail } });
    expect(korisnik.lozinkaHash).not.toBe('Lozinka123!');
    expect(korisnik.lozinkaHash).toMatch(/^\$2b\$/); // bcrypt hash format
  });

  test('registracija kao IGRAC → statusUloge PENDING u bazi', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validniPodaci, trazenaUloga: 'IGRAC' });

    expect(res.status).toBe(201);
    expect(res.body.poruka_uloge.status).toBe('PENDING');
    expect(res.body.poruka_uloge.trazena).toBe('IGRAC');

    const korisnik = await prisma.korisnik.findUnique({ where: { email: testEmail } });
    expect(korisnik.statusUloge).toBe('PENDING');
    expect(korisnik.trazenaUloga).toBe('IGRAC');
    expect(korisnik.datumZahtjeva).not.toBeNull();
  });

  test('registracija kao TRENER → statusUloge PENDING u bazi', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validniPodaci, trazenaUloga: 'TRENER' });

    expect(res.status).toBe(201);
    expect(res.body.poruka_uloge.status).toBe('PENDING');

    const korisnik = await prisma.korisnik.findUnique({ where: { email: testEmail } });
    expect(korisnik.statusUloge).toBe('PENDING');
  });

  test('dupli email → 409 EMAIL_VEC_POSTOJI', async () => {
    await request(app).post('/api/auth/register').send(validniPodaci);

    const res = await request(app)
      .post('/api/auth/register')
      .send(validniPodaci);

    expect(res.status).toBe(409);
    expect(res.body.greska).toBe('EMAIL_VEC_POSTOJI');
  });

  test('nedozvoljena uloga ADMINISTRATOR → 400 NEDOZVOLJENA_ULOGA', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validniPodaci, trazenaUloga: 'ADMINISTRATOR' });

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('NEDOZVOLJENA_ULOGA');
    expect(res.body.dozvoljene).toEqual(['NAVIJAC', 'IGRAC', 'TRENER', 'VLASNIK']);
  });

  test('prazni podaci → 400 GRESKA_VALIDACIJE', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('GRESKA_VALIDACIJE');
  });

  test('neispravan format emaila → 400 GRESKA_VALIDACIJE', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validniPodaci, email: 'nijevalidan' });

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('GRESKA_VALIDACIJE');
  });

  test('slaba lozinka bez specijalnog znaka → 400 GRESKA_VALIDACIJE', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validniPodaci, lozinka: 'Lozinka123' });

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('GRESKA_VALIDACIJE');
  });

  test('response ne sadrzi lozinkaHash ni refreshToken', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validniPodaci);

    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).not.toContain('lozinkaHash');
    expect(JSON.stringify(res.body)).not.toContain('refreshToken');
  });
});