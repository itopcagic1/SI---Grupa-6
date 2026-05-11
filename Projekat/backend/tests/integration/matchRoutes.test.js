const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/matchService', () => ({
  generisiRaspored: jest.fn(),
}));

const matchService = require('../../src/services/matchService');
const matchRoutes = require('../../src/routes/matchRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/matches', matchRoutes);
  return app;
}

function tokenFor(uloga, korisnikId = 100) {
  return jwt.sign(
    { korisnikId, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

// Vraća datum koji je sigurno sutra ili kasnije (controller odbija današnji i prošle datume)
function sutrasnjiDatum() {
  const sutra = new Date();
  sutra.setDate(sutra.getDate() + 1);
  return sutra.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

describe('Match routes', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'match-routes-secret' };
    app = buildTestApp();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  describe('POST /api/matches/generate-schedule', () => {
    test('uspješno generiše raspored', async () => {
      const mockResult = {
        brojKreiranihUtakmica: 2,
        utakmice: [
          { utakmicaId: 1, domaciTim: { naziv: 'Tim A' }, gostujuciTim: { naziv: 'Tim B' } },
        ],
      };
      matchService.generisiRaspored.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/matches/generate-schedule')
        .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR', 1)}`)
        .send({
          takmicenjeId: 1,
          pocetniDatum: sutrasnjiDatum(),
          defaultnoVrijeme: '15:00',
          defaultnaLokacija: 'Stadion',
        });

      expect(response.status).toBe(201);
      expect(response.body.uspjeh).toBe(true);
      expect(response.body.brojKreiranihUtakmica).toBe(2);
    });

    test('vraća grešku za nevalidan datum', async () => {
      const response = await request(app)
        .post('/api/matches/generate-schedule')
        .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR', 1)}`)
        .send({
          takmicenjeId: 1,
          pocetniDatum: 'invalid-date',
          defaultnoVrijeme: '15:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.greska).toBe('INVALID_DATE');
    });

    test('vraća grešku za datum u prošlosti', async () => {
      const response = await request(app)
        .post('/api/matches/generate-schedule')
        .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR', 1)}`)
        .send({
          takmicenjeId: 1,
          pocetniDatum: '2020-01-01',
          defaultnoVrijeme: '15:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.greska).toBe('DATE_IN_PAST');
    });

    test('vraća grešku za nevalidno vrijeme', async () => {
      const response = await request(app)
        .post('/api/matches/generate-schedule')
        .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR', 1)}`)
        .send({
          takmicenjeId: 1,
          pocetniDatum: sutrasnjiDatum(),
          defaultnoVrijeme: '25:00',
        });

      expect(response.status).toBe(400);
      expect(response.body.greska).toBe('INVALID_TIME');
    });

    test('vraća grešku ako nisu poslani obavezni parametri', async () => {
      const response = await request(app)
        .post('/api/matches/generate-schedule')
        .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR', 1)}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.greska).toBe('MISSING_REQUIRED_FIELDS');
    });

    test('vraća 403 i ne poziva servis za korisnika bez prava (IGRAC)', async () => {
      // FIX: middleware odbija IGRAC-a PRIJE nego što servis bude pozvan.
      // Servisni mock ovdje nije potreban — testiramo ponašanje middleware-a.
      const response = await request(app)
        .post('/api/matches/generate-schedule')
        .set('Authorization', `Bearer ${tokenFor('IGRAC', 1)}`)
        .send({
          takmicenjeId: 1,
          pocetniDatum: sutrasnjiDatum(),
          defaultnoVrijeme: '15:00',
        });

      expect(response.status).toBe(403);
      // Servis se ne smije pozvati — middleware ga je zaustavio
      expect(matchService.generisiRaspored).not.toHaveBeenCalled();
    });

    test('vraća 401 za zahtjev bez tokena', async () => {
      const response = await request(app)
        .post('/api/matches/generate-schedule')
        .send({
          takmicenjeId: 1,
          pocetniDatum: sutrasnjiDatum(),
          defaultnoVrijeme: '15:00',
        });

      expect(response.status).toBe(401);
      expect(matchService.generisiRaspored).not.toHaveBeenCalled();
    });

    test('proslijeđuje grešku servisa sa ispravnim statusom i kodom', async () => {
      // Ovaj test pokriva slučaj gdje servis baci grešku (npr. takmičenje ne postoji)
      // nakon što je ORGANIZATOR prošao middleware.
      matchService.generisiRaspored.mockRejectedValue({
        status: 404,
        code: 'TAKMICENJE_NIJE_PRONADJENO',
        message: 'Takmičenje sa zadanim ID-em ne postoji',
      });

      const response = await request(app)
        .post('/api/matches/generate-schedule')
        .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR', 1)}`)
        .send({
          takmicenjeId: 999,
          pocetniDatum: sutrasnjiDatum(),
          defaultnoVrijeme: '15:00',
        });

      expect(response.status).toBe(404);
      expect(response.body.greska).toBe('TAKMICENJE_NIJE_PRONADJENO');
    });
  });
});