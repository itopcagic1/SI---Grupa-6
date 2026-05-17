const express = require('express');
const request = require('supertest');

jest.mock('../../src/services/statistikaService', () => ({
  getTipoviStatistike: jest.fn(),
  snimiStatistikuIgraca: jest.fn(),
  snimiStatistikuTima: jest.fn(),
  dohvatiAgregiranuStatistikuIgraca: jest.fn(),
  dohvatiAgregiranuStatistikuTima: jest.fn(),
  dohvatiTopStrijelce: jest.fn(),
}));

const statistikaService = require('../../src/services/statistikaService');
const statistikaRoutes = require('../../src/routes/statistikaRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', statistikaRoutes);
  return app;
}

describe('Sprint 6 - Statistika rute', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildTestApp();
  });

  describe('Agregirana statistika igrača', () => {
    test('dohvat agregiranih statistika igrača sa svim filtrima', async () => {
      const mockData = {
        igrac: { korisnikId: 1, punoIme: 'Marko Markovic' },
        tim: { timId: 1, naziv: 'FK Željezničar' },
        takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga', sezona: '2025/2026' },
        brojUtakmica: 10,
        statistike: [
          { tipStatistikeId: 1, nazivStatistike: 'Golovi', ukupno: 8 },
          { tipStatistikeId: 2, nazivStatistike: 'Asistencije', ukupno: 3 }
        ]
      };

      statistikaService.dohvatiAgregiranuStatistikuIgraca.mockResolvedValue(mockData);

      const res = await request(app)
        .get('/api/igraci/1/statistika')
        .query({ takmicenjeId: 1, sezona: '2025/2026' });

      expect(res.status).toBe(200);
      expect(res.body.igrac.punoIme).toBe('Marko Markovic');
      expect(res.body.brojUtakmica).toBe(10);
      expect(res.body.statistike).toHaveLength(2);
      expect(statistikaService.dohvatiAgregiranuStatistikuIgraca).toHaveBeenCalledWith(
        '1',
        '1',
        '2025/2026'
      );
    });

    test('dohvat statistika igrača bez filtera', async () => {
      statistikaService.dohvatiAgregiranuStatistikuIgraca.mockResolvedValue({
        igrac: { korisnikId: 2, punoIme: 'Petar Petrovic' },
        tim: null,
        takmicenje: null,
        brojUtakmica: 0,
        statistike: []
      });

      const res = await request(app).get('/api/igraci/2/statistika');

      expect(res.status).toBe(200);
      expect(statistikaService.dohvatiAgregiranuStatistikuIgraca).toHaveBeenCalledWith(
        '2',
        undefined,
        undefined
      );
    });

    test('greška pri dohvatu statistika igrača sa nevalidnim ID', async () => {
      statistikaService.dohvatiAgregiranuStatistikuIgraca.mockRejectedValue(
        Object.assign(new Error('korisnikId mora biti pozitivan broj.'), { status: 400 })
      );

      const res = await request(app).get('/api/igraci/invalid/statistika');

      expect(res.status).toBe(400);
      expect(res.body.poruka).toContain('mora biti pozitivan');
    });
  });

  describe('Agregirana statistika tima', () => {
    test('dohvat agregiranih statistika tima sa filtrima', async () => {
      const mockData = {
        tim: { timId: 1, naziv: 'FK Željezničar', logoUrl: 'url', sport: { naziv: 'Fudbal' } },
        takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga', sezona: '2025/2026' },
        brojUtakmica: 15,
        statistike: [
          { tipStatistikeId: 1, nazivStatistike: 'Golovi', ukupno: 45 },
          { tipStatistikeId: 3, nazivStatistike: 'Kartoni', ukupno: 12 }
        ]
      };

      statistikaService.dohvatiAgregiranuStatistikuTima.mockResolvedValue(mockData);

      const res = await request(app)
        .get('/api/timovi/1/statistika')
        .query({ takmicenjeId: 1 });

      expect(res.status).toBe(200);
      expect(res.body.tim.naziv).toBe('FK Željezničar');
      expect(res.body.brojUtakmica).toBe(15);
      expect(res.body.statistike).toHaveLength(2);
      expect(statistikaService.dohvatiAgregiranuStatistikuTima).toHaveBeenCalledWith(
        '1',
        '1',
        undefined
      );
    });

    test('greška sa nevalidnim timId', async () => {
      statistikaService.dohvatiAgregiranuStatistikuTima.mockRejectedValue(
        Object.assign(new Error('timId mora biti pozitivan broj.'), { status: 400 })
      );

      const res = await request(app).get('/api/timovi/invalid/statistika');

      expect(res.status).toBe(400);
    });
  });

  describe('Top strijelci', () => {
    test('dohvat top strijelaca sa svim parametrima', async () => {
      const mockData = {
        takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga' },
        tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
        topStrijelci: [
          {
            rank: 1,
            igrac: { korisnikId: 1, punoIme: 'Marko Markovic' },
            tim: { timId: 1, naziv: 'FK Željezničar', logoUrl: 'url' },
            vrijednost: 15
          },
          {
            rank: 2,
            igrac: { korisnikId: 2, punoIme: 'Petar Petrovic' },
            tim: { timId: 2, naziv: 'FK Voždovac', logoUrl: 'url' },
            vrijednost: 12
          }
        ]
      };

      statistikaService.dohvatiTopStrijelce.mockResolvedValue(mockData);

      const res = await request(app)
        .get('/api/takmicenja/1/top-strijelci')
        .query({ tipStatistikeId: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.topStrijelci).toHaveLength(2);
      expect(res.body.topStrijelci[0].rank).toBe(1);
      expect(res.body.topStrijelci[0].vrijednost).toBe(15);
      expect(statistikaService.dohvatiTopStrijelce).toHaveBeenCalledWith('1', '1', 10);
    });

    test('poziv bez tipStatistikeId vraća rezultat iz servisa', async () => {
      statistikaService.dohvatiTopStrijelce.mockResolvedValue({
        takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga' },
        tipStatistike: null,
        topStrijelci: []
      });

      const res = await request(app)
        .get('/api/takmicenja/1/top-strijelci')
        .query({ limit: 10 });

      expect(res.status).toBe(200);
      expect(statistikaService.dohvatiTopStrijelce).toHaveBeenCalledWith('1', undefined, 10);
      expect(res.body.topStrijelci).toEqual([]);
    });

    test('top strijelci sa custom limitom', async () => {
      statistikaService.dohvatiTopStrijelce.mockResolvedValue({
        takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga' },
        tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
        topStrijelci: []
      });

      const res = await request(app)
        .get('/api/takmicenja/1/top-strijelci')
        .query({ tipStatistikeId: 1, limit: 5 });

      expect(res.status).toBe(200);
      expect(statistikaService.dohvatiTopStrijelce).toHaveBeenCalledWith('1', '1', 5);
    });

    test('top strijelci sa default limitom', async () => {
      statistikaService.dohvatiTopStrijelce.mockResolvedValue({
        takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga' },
        tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
        topStrijelci: []
      });

      const res = await request(app)
        .get('/api/takmicenja/1/top-strijelci')
        .query({ tipStatistikeId: 1 });

      expect(res.status).toBe(200);
      expect(statistikaService.dohvatiTopStrijelce).toHaveBeenCalledWith('1', '1', 10);
    });

    test('greška sa nevalidnim takmicenjeId', async () => {
      statistikaService.dohvatiTopStrijelce.mockRejectedValue(
        Object.assign(new Error('takmicenjeId mora biti pozitivan broj.'), { status: 400 })
      );

      const res = await request(app)
        .get('/api/takmicenja/invalid/top-strijelci')
        .query({ tipStatistikeId: 1 });

      expect(res.status).toBe(400);
    });

    test('greška sa nevalidnim tipStatistikeId', async () => {
      statistikaService.dohvatiTopStrijelce.mockRejectedValue(
        Object.assign(new Error('tipStatistikeId mora biti pozitivan broj.'), { status: 400 })
      );

      const res = await request(app)
        .get('/api/takmicenja/1/top-strijelci')
        .query({ tipStatistikeId: 'invalid' });

      expect(res.status).toBe(400);
    });
  });
});
