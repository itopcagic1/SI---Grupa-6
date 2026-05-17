const resultController = require('../../src/controllers/resultController');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    utakmica: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    rezultatUtakmice: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn()
    },
    plasmanNaTabeli: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn()
    },
    $transaction: jest.fn((callback) => callback(mPrismaClient))
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

describe('Result Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
    req = {
      params: { id: '1' },
      body: { rezultatDomacin: 2, rezultatGost: 1 },
      user: { korisnikId: 100, uloga: 'ORGANIZATOR' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('kreirajRezultat', () => {
    it('vraca gresku za negativan rezultat', async () => {
      req.body.rezultatDomacin = -1;
      await resultController.kreirajRezultat(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ poruka: 'Rezultat ne moze biti negativan.' });
    });

    it('vraca gresku ako utakmica nije pronadjena', async () => {
      prisma.utakmica.findUnique.mockResolvedValue(null);
      await resultController.kreirajRezultat(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ poruka: 'Utakmica nije pronadjena.' });
    });

    it('vraca gresku ako korisnik nije organizator te lige', async () => {
      prisma.utakmica.findUnique.mockResolvedValue({
        utakmicaId: 1,
        vrijemePocetka: new Date(Date.now() - 10000),
        takmicenje: { organizatorId: 999 },
        rezultatUtakmice: null
      });

      await resultController.kreirajRezultat(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ poruka: 'Nemate ovlastenje za unos rezultata za ovu utakmicu.' });
    });

    it('uspjesno kreira rezultat i azurira plasman u istoj transakciji', async () => {
      prisma.utakmica.findUnique.mockResolvedValue({
        utakmicaId: 1,
        takmicenjeId: 10,
        domaciTimId: 20,
        gostujuciTimId: 30,
        vrijemePocetka: new Date(Date.now() - 100000),
        takmicenje: { organizatorId: 100 },
        rezultatUtakmice: null
      });

      prisma.rezultatUtakmice.create.mockResolvedValue({ rezultatUtakmiceId: 1 });
      prisma.plasmanNaTabeli.findUnique.mockResolvedValue(null);

      await resultController.kreirajRezultat(req, res);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.rezultatUtakmice.create).toHaveBeenCalled();
      expect(prisma.utakmica.update).toHaveBeenCalledWith({
        where: { utakmicaId: 1 },
        data: { status: 'Zavrseno' }
      });
      expect(prisma.plasmanNaTabeli.create).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ poruka: 'Rezultat uspjesno unesen.' }));
    });
  });

  describe('azurirajRezultat', () => {
    it('vraca gresku ako rezultat jos nije unesen', async () => {
      prisma.utakmica.findUnique.mockResolvedValue({
        utakmicaId: 1,
        takmicenje: { organizatorId: 100 },
        rezultatUtakmice: null
      });

      await resultController.azurirajRezultat(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ poruka: 'Rezultat za ovu utakmicu jos nije unesen.' });
    });

    it('uspjesno azurira rezultat i tabelu atomski', async () => {
      prisma.utakmica.findUnique.mockResolvedValue({
        utakmicaId: 1,
        takmicenjeId: 10,
        domaciTimId: 20,
        gostujuciTimId: 30,
        takmicenje: { organizatorId: 100 },
        rezultatUtakmice: { rezultatDomacin: 0, rezultatGost: 0 }
      });

      prisma.plasmanNaTabeli.findUnique.mockResolvedValue({
        plasmanNaTabeliId: 5,
        brojPobjeda: 0,
        brojNerijesenih: 1,
        brojPoraza: 0,
        ukupniBodovi: 1
      });
      prisma.rezultatUtakmice.update.mockResolvedValue({ rezultatUtakmiceId: 1 });

      await resultController.azurirajRezultat(req, res);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.rezultatUtakmice.update).toHaveBeenCalled();
      expect(prisma.plasmanNaTabeli.update).toHaveBeenCalledTimes(4);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ poruka: 'Rezultat uspjesno korigovan.' }));
    });

    it('odbija promjenu rezultata koja invalidira postojecu statistiku golova', async () => {
      req.body = { rezultatDomacin: 1, rezultatGost: 0 };
      prisma.utakmica.findUnique
        .mockResolvedValueOnce({
          utakmicaId: 1,
          takmicenjeId: 10,
          domaciTimId: 20,
          gostujuciTimId: 30,
          takmicenje: { organizatorId: 100 },
          rezultatUtakmice: { rezultatDomacin: 3, rezultatGost: 0 }
        })
        .mockResolvedValueOnce({
          utakmicaId: 1,
          domaciTimId: 20,
          gostujuciTimId: 30,
          rezultatUtakmice: { rezultatDomacin: 3, rezultatGost: 0 },
          statistikeIgraca: [
            {
              statistikaIgracaId: 1,
              timId: 20,
              vrijednosti: [
                { vrijednostId: 1, vrijednost: 3, tipStatistike: { nazivStatistike: 'Golovi' } }
              ]
            }
          ],
          statistikeTimova: []
        });

      prisma.plasmanNaTabeli.findUnique.mockResolvedValue({
        plasmanNaTabeliId: 5,
        brojPobjeda: 1,
        brojNerijesenih: 0,
        brojPoraza: 0,
        ukupniBodovi: 3
      });
      prisma.rezultatUtakmice.update.mockResolvedValue({ rezultatUtakmiceId: 1 });

      await resultController.azurirajRezultat(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        poruka: 'Zbir golova igraca ne moze biti veci od rezultata tima.'
      });
    });
  });
});
