require('dotenv').config({ path: '.env.test' });
require('dotenv').config();

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

const users = [];

const mockPrisma = {
  korisnik: {
    deleteMany: jest.fn().mockImplementation((args) => {
      const email = args.where.email;
      const index = users.findIndex(u => u.email === email);
      if (index !== -1) {
        users.splice(index, 1);
      }
      return Promise.resolve({ count: 1 });
    }),
    create: jest.fn().mockImplementation((args) => {
      const newUser = {
        korisnikId: 1,
        email: args.data.email,
        lozinkaHash: args.data.lozinkaHash,
        punoIme: args.data.punoIme,
        uloga: args.data.uloga || 'NAVIJAC',
        trazenaUloga: args.data.trazenaUloga,
        statusUloge: args.data.statusUloge,
        datumZahtjeva: new Date(),
        refreshToken: null,
      };
      users.push(newUser);
      return Promise.resolve(newUser);
    }),
    findUnique: jest.fn().mockImplementation((args) => {
      if (args.where.email) {
        const email = args.where.email;
        const user = users.find(u => u.email === email);
        return Promise.resolve(user || null);
      }
      if (args.where.korisnikId) {
        const id = args.where.korisnikId;
        const user = users.find(u => u.korisnikId === id);
        return Promise.resolve(user || null);
      }
      return Promise.resolve(null);
    }),
    update: jest.fn().mockImplementation((args) => {
      const email = args.where.email;
      const user = users.find(u => u.email === email);
      if (user) {
        Object.assign(user, args.data);
      }
      return Promise.resolve(user || {});
    }),
  },
  $disconnect: jest.fn().mockResolvedValue(true),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const { PrismaClient } = require('@prisma/client');
const authRoutes = require('../../routes/authRoutes');

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

const testEmail = 'registracija@test.com';

beforeEach(async () => {
  await prisma.korisnik.deleteMany({ where: { email: testEmail } });
});

afterAll(async () => {
  await prisma.korisnik.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register — integracijski', () => {
  const validniPodaci = {
    punoIme: 'Test Korisnik',
    email: testEmail,
    lozinka: 'Lozinka123!',
    potvrdalozinke: 'Lozinka123!',
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
    expect(korisnik.lozinkaHash).toMatch(/^\$2b\$/);
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
    expect(res.body.dozvoljene).toEqual(['NAVIJAC', 'IGRAC', 'TRENER', 'VLASNIK','ORGANIZATOR']);
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
      .send({ ...validniPodaci, lozinka: 'Lozinka123', potvrdalozinke: 'Lozinka123' });

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