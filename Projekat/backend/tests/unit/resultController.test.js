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
    it('vraca grešku za negativan rezultat', async () => {
      req.body.rezultatDomacin = -1;
      await resultController.kreirajRezultat(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ poruka: 'Rezultat ne može biti negativan.' });
    });

    it('vraca grešku ako utakmica nije pronađena', async () => {
      prisma.utakmica.findUnique.mockResolvedValue(null);
      await resultController.kreirajRezultat(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ poruka: 'Utakmica nije pronađena.' });
    });

    it('vraca grešku ako korisnik nije organizator te lige', async () => {
      prisma.utakmica.findUnique.mockResolvedValue({
        utakmicaId: 1,
        vrijemePocetka: new Date(Date.now() - 10000), // u prošlosti
        takmicenje: { organizatorId: 999 }, // nije 100
        rezultatUtakmice: null
      });

      await resultController.kreirajRezultat(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ poruka: 'Nemate ovlaštenje za unos rezultata za ovu utakmicu.' });
    });

    it('uspješno kreira rezultat i ažurira plasman', async () => {
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

      expect(prisma.rezultatUtakmice.create).toHaveBeenCalled();
      expect(prisma.utakmica.update).toHaveBeenCalledWith({
        where: { utakmicaId: 1 },
        data: { status: 'Završeno' }
      });
      // treba kreirati plasman za oba tima ako ne postoje
      expect(prisma.plasmanNaTabeli.create).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ poruka: 'Rezultat uspješno unesen.' }));
    });
  });

  describe('azurirajRezultat', () => {
    it('vraca grešku ako rezultat još nije unesen', async () => {
      prisma.utakmica.findUnique.mockResolvedValue({
        utakmicaId: 1,
        takmicenje: { organizatorId: 100 },
        rezultatUtakmice: null
      });

      await resultController.azurirajRezultat(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ poruka: 'Rezultat za ovu utakmicu još nije unesen.' });
    });

    it('uspješno ažurira rezultat', async () => {
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
        brojPobjeda: 0, brojNerijesenih: 1, brojPoraza: 0, ukupniBodovi: 1
      });

      prisma.rezultatUtakmice.update.mockResolvedValue({ rezultatUtakmiceId: 1 });

      await resultController.azurirajRezultat(req, res);

      expect(prisma.rezultatUtakmice.update).toHaveBeenCalled();
      expect(prisma.plasmanNaTabeli.update).toHaveBeenCalledTimes(4); // 2x za revert, 2x za novi rezultat
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ poruka: 'Rezultat uspješno korigovan.' }));
    });
  });
});
