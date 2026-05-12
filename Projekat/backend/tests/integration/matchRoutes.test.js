const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/matchService', () => ({
  getPublicMatches: jest.fn(),
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

  describe('GET /api/matches/public', () => {
    test('vraca utakmice bez filtera i ne trazi autentikaciju', async () => {
      const utakmice = [
        { utakmicaId: 1, takmicenje: { naziv: 'Liga' }, domaciTim: { naziv: 'A' }, gostujuciTim: { naziv: 'B' } },
      ];
      matchService.getPublicMatches.mockResolvedValue(utakmice);

      const response = await request(app).get('/api/matches/public');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(utakmice);
      expect(matchService.getPublicMatches).toHaveBeenCalledWith({
        sportId: undefined,
        takmicenjeId: undefined,
        timId: undefined,
        datumOd: undefined,
        datumDo: undefined,
      });
    });

    test('filtrira po sportu', async () => {
      matchService.getPublicMatches.mockResolvedValue([{ utakmicaId: 1 }]);

      const response = await request(app).get('/api/matches/public?sportId=1');

      expect(response.status).toBe(200);
      expect(matchService.getPublicMatches).toHaveBeenCalledWith(expect.objectContaining({ sportId: 1 }));
    });

    test('filtrira po ligi/takmicenju', async () => {
      matchService.getPublicMatches.mockResolvedValue([{ utakmicaId: 2 }]);

      const response = await request(app).get('/api/matches/public?takmicenjeId=2');

      expect(response.status).toBe(200);
      expect(matchService.getPublicMatches).toHaveBeenCalledWith(expect.objectContaining({ takmicenjeId: 2 }));
    });

    test('filtrira po timu', async () => {
      matchService.getPublicMatches.mockResolvedValue([{ utakmicaId: 3 }]);

      const response = await request(app).get('/api/matches/public?timId=5');

      expect(response.status).toBe(200);
      expect(matchService.getPublicMatches).toHaveBeenCalledWith(expect.objectContaining({ timId: 5 }));
    });

    test('filtrira po datumu kao cijelom danu', async () => {
      matchService.getPublicMatches.mockResolvedValue([{ utakmicaId: 4 }]);

      const response = await request(app).get('/api/matches/public?datum=2026-05-18');

      expect(response.status).toBe(200);
      expect(matchService.getPublicMatches).toHaveBeenCalledWith(expect.objectContaining({
        datumOd: new Date('2026-05-18T00:00:00.000Z'),
        datumDo: new Date('2026-05-19T00:00:00.000Z'),
      }));
    });

    test('podrzava kombinovane filtere', async () => {
      matchService.getPublicMatches.mockResolvedValue([{ utakmicaId: 5 }]);

      const response = await request(app)
        .get('/api/matches/public?sportId=1&takmicenjeId=2&timId=5&datum=2026-05-18');

      expect(response.status).toBe(200);
      expect(matchService.getPublicMatches).toHaveBeenCalledWith({
        sportId: 1,
        takmicenjeId: 2,
        timId: 5,
        datumOd: new Date('2026-05-18T00:00:00.000Z'),
        datumDo: new Date('2026-05-19T00:00:00.000Z'),
      });
    });

    test('prazan rezultat vraca prazan niz', async () => {
      matchService.getPublicMatches.mockResolvedValue([]);

      const response = await request(app).get('/api/matches/public?sportId=99');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test.each(['sportId', 'takmicenjeId', 'timId'])('vraca 400 za nevalidan %s', async (param) => {
      const response = await request(app).get(`/api/matches/public?${param}=abc`);

      expect(response.status).toBe(400);
      expect(response.body.greska).toBe('INVALID_QUERY_PARAM');
      expect(matchService.getPublicMatches).not.toHaveBeenCalled();
    });

    test('vraca 400 za nevalidan datum', async () => {
      const response = await request(app).get('/api/matches/public?datum=2026-02-31');

      expect(response.status).toBe(400);
      expect(response.body.greska).toBe('INVALID_DATE');
      expect(matchService.getPublicMatches).not.toHaveBeenCalled();
    });
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
