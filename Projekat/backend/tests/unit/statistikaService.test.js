const mockPrisma = {
  statistikaIgracaNaUtakmici: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  statistikaTimaNaUtakmici: {
    findMany: jest.fn(),
  },
  vrijednostStatistikeIgraca: {
    findMany: jest.fn()
  },
  tipStatistike: {
    findUnique: jest.fn(),
    findFirst: jest.fn()
  },
  takmicenje: {
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

const { PrismaClient } = require('@prisma/client');
const statistikaService = require('../../src/services/statistikaService');
const prisma = mockPrisma;

describe('Unit testovi - StatistikaService agregacije', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dohvatiAgregiranuStatistikuIgraca', () => {
    test('trebalo bi da agregira statistike igrača po tipu', async () => {
      const mockStatistike = [
        {
          statistikaIgracaId: 1,
          korisnik: { korisnikId: 1, punoIme: 'Marko Markovic' },
          tim: { timId: 1, naziv: 'FK Željezničar' },
          utakmica: {
            takmicenjeId: 1,
            takmicenje: { naziv: 'Premijer Liga', sezona: '2025/2026', sportId: 1 }
          },
          vrijednosti: [
            {
              vrijednostId: 1,
              vrijednost: 2,
              tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' }
            },
            {
              vrijednostId: 2,
              vrijednost: 1,
              tipStatistike: { tipStatistikeId: 2, nazivStatistike: 'Asistencije' }
            }
          ]
        },
        {
          statistikaIgracaId: 2,
          korisnik: { korisnikId: 1, punoIme: 'Marko Markovic' },
          tim: { timId: 1, naziv: 'FK Željezničar' },
          utakmica: {
            takmicenjeId: 1,
            takmicenje: { naziv: 'Premijer Liga', sezona: '2025/2026', sportId: 1 }
          },
          vrijednosti: [
            {
              vrijednostId: 3,
              vrijednost: 1,
              tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' }
            },
            {
              vrijednostId: 4,
              vrijednost: 2,
              tipStatistike: { tipStatistikeId: 2, nazivStatistike: 'Asistencije' }
            }
          ]
        }
      ];

      prisma.statistikaIgracaNaUtakmici.findMany.mockResolvedValue(mockStatistike);

      const rezultat = await statistikaService.dohvatiAgregiranuStatistikuIgraca(1, null, null);

      expect(rezultat.igrac.punoIme).toBe('Marko Markovic');
      expect(rezultat.brojUtakmica).toBe(2);
      expect(rezultat.statistike).toHaveLength(2);
      expect(rezultat.statistike[0].ukupno).toBe(3); // 2 + 1
      expect(rezultat.statistike[1].ukupno).toBe(3); // 1 + 2
    });

    test('trebalo bi da filtriraj po takmicenju', async () => {
      prisma.statistikaIgracaNaUtakmici.findMany.mockResolvedValue([]);

      await statistikaService.dohvatiAgregiranuStatistikuIgraca(1, 5, null);

      expect(prisma.statistikaIgracaNaUtakmici.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            korisnikId: 1,
            utakmica: expect.objectContaining({
              takmicenjeId: 5
            })
          })
        })
      );
    });

    test('trebalo bi da filtriraj po sezoni', async () => {
      prisma.statistikaIgracaNaUtakmici.findMany.mockResolvedValue([]);

      await statistikaService.dohvatiAgregiranuStatistikuIgraca(1, null, '2025/2026');

      expect(prisma.statistikaIgracaNaUtakmici.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            korisnikId: 1,
            utakmica: expect.objectContaining({
              takmicenje: expect.objectContaining({
                sezona: '2025/2026'
              })
            })
          })
        })
      );
    });

    test('trebalo bi da baci grešku sa nevalidnim ID-om', async () => {
      await expect(
        statistikaService.dohvatiAgregiranuStatistikuIgraca('invalid', null, null)
      ).rejects.toThrow('korisnikId mora biti pozitivan');
    });

    test('trebalo bi da vrati prazan niz ako nema statistike', async () => {
      prisma.statistikaIgracaNaUtakmici.findMany.mockResolvedValue([]);

      const rezultat = await statistikaService.dohvatiAgregiranuStatistikuIgraca(1, null, null);

      expect(rezultat.igrac).toBeNull();
      expect(rezultat.statistike).toEqual([]);
      expect(rezultat.brojUtakmica).toBe(0);
    });
  });

  describe('dohvatiAgregiranuStatistikuTima', () => {
    test('trebalo bi da agregira statistike tima po tipu', async () => {
      const mockStatistike = [
        {
          statistikaTimaId: 1,
          tim: {
            timId: 1,
            naziv: 'FK Željezničar',
            logoUrl: 'url',
            sport: { sportId: 1, naziv: 'Fudbal' }
          },
          utakmica: {
            takmicenjeId: 1,
            takmicenje: { naziv: 'Premijer Liga', sezona: '2025/2026' }
          },
          vrijednosti: [
            {
              vrijednostId: 1,
              vrijednost: 3,
              tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' }
            },
            {
              vrijednostId: 2,
              vrijednost: 1,
              tipStatistike: { tipStatistikeId: 3, nazivStatistike: 'Kartoni' }
            }
          ]
        },
        {
          statistikaTimaId: 2,
          tim: {
            timId: 1,
            naziv: 'FK Željezničar',
            logoUrl: 'url',
            sport: { sportId: 1, naziv: 'Fudbal' }
          },
          utakmica: {
            takmicenjeId: 1,
            takmicenje: { naziv: 'Premijer Liga', sezona: '2025/2026' }
          },
          vrijednosti: [
            {
              vrijednostId: 3,
              vrijednost: 2,
              tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' }
            },
            {
              vrijednostId: 4,
              vrijednost: 2,
              tipStatistike: { tipStatistikeId: 3, nazivStatistike: 'Kartoni' }
            }
          ]
        }
      ];

      prisma.statistikaTimaNaUtakmici.findMany.mockResolvedValue(mockStatistike);

      const rezultat = await statistikaService.dohvatiAgregiranuStatistikuTima(1, null, null);

      expect(rezultat.tim.naziv).toBe('FK Željezničar');
      expect(rezultat.brojUtakmica).toBe(2);
      expect(rezultat.statistike).toHaveLength(2);
      expect(rezultat.statistike[0].ukupno).toBe(5); // 3 + 2
      expect(rezultat.statistike[1].ukupno).toBe(3); // 1 + 2
    });

    test('trebalo bi da baci grešku sa nevalidnim ID-om', async () => {
      await expect(
        statistikaService.dohvatiAgregiranuStatistikuTima('invalid', null, null)
      ).rejects.toThrow('timId mora biti pozitivan');
    });
  });

  describe('dohvatiTopStrijelce', () => {
    test('trebalo bi da vrati top strijelce sortirane po vrijednosti', async () => {
      const mockValues = [
        {
          vrijednost: 15,
          statistikaIgraca: {
            statistikaIgracaId: 1,
            korisnik: { korisnikId: 1, punoIme: 'Marko Markovic' },
            tim: { timId: 1, naziv: 'FK Željezničar', logoUrl: 'url' }
          }
        },
        {
          vrijednost: 12,
          statistikaIgraca: {
            statistikaIgracaId: 2,
            korisnik: { korisnikId: 2, punoIme: 'Petar Petrovic' },
            tim: { timId: 2, naziv: 'FK Voždovac', logoUrl: 'url' }
          }
        }
      ];

      prisma.vrijednostStatistikeIgraca.findMany.mockResolvedValue(mockValues);
      prisma.tipStatistike.findUnique.mockResolvedValue({
        tipStatistikeId: 1,
        nazivStatistike: 'Golovi'
      });
      prisma.takmicenje.findUnique.mockResolvedValue({
        takmicenjeId: 1,
        naziv: 'Premijer Liga',
        sezona: '2025/2026',
        sportId: 1
      });

      const rezultat = await statistikaService.dohvatiTopStrijelce(1, 1, 10);

      expect(rezultat.topStrijelci).toHaveLength(2);
      expect(rezultat.topStrijelci[0].rank).toBe(1);
      expect(rezultat.topStrijelci[0].vrijednost).toBe(15);
      expect(rezultat.topStrijelci[1].rank).toBe(2);
      expect(rezultat.topStrijelci[1].vrijednost).toBe(12);
    });


    test('trebalo bi da baci grešku sa nevalidnim ID-om', async () => {
      await expect(
        statistikaService.dohvatiTopStrijelce('invalid', 1, 10)
      ).rejects.toThrow('takmicenjeId mora biti pozitivan');
    });
  });
});
