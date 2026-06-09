const mockGrupneService = {
  kreirajGrupniTreningService: jest.fn(),
  prijaviSeNaGrupniTreningService: jest.fn(),
  getTrenerGrupniTreninziService: jest.fn(),
  getGrupniTreninziService: jest.fn(),
  otkaziGrupniTreningService: jest.fn(),
  odjaviSeSaGrupnogTreningaService: jest.fn(),
  getTrenerNotifikacijeService: jest.fn(),
};

jest.mock('../../../src/services/grupneRezervacijeService', () => mockGrupneService);

// Mock the rezervacijaService as well so importing controller doesn't fail or execute real database code
jest.mock('../../../src/services/rezervacijaService', () => ({
  getAllTermsService: jest.fn(),
  createIndividualReservationService: jest.fn(),
  cancelIndividualReservationService: jest.fn(),
}));

const mockPrisma = {
  grupniTrening: {
    findUnique: jest.fn().mockImplementation((args) => {
      const id = args.where.treningId;
      return Promise.resolve({
        treningId: id,
        terminObjekta: { vrijemePocetka: new Date(Date.now() + 48 * 3600000) },
      });
    }),
  },
  prijavaGrupnogTreninga: {
    findFirst: jest.fn().mockResolvedValue({ prijavaId: 1 }),
  },
  korisnik: {
    findUnique: jest.fn().mockResolvedValue({ statusPouzdanosti: 'AKTIVAN', brojPreksrenihRezervacija: 0 }),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const {
  kreirajGrupniTrening,
  prijaviSeNaGrupniTrening,
  getTrenerGrupniTreninzi,
  getGrupniTreninzi,
  otkaziGrupniTrening,
  odjaviSeSaGrupnogTreninga,
  getTrenerNotifikacije,
} = require('../../../src/controllers/rezervacijaController');

describe('Grupne Rezervacije Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('kreirajGrupniTrening', () => {
    it('uspješno kreira grupni trening i vraća status 21', async () => {
      mockGrupneService.kreirajGrupniTreningService.mockResolvedValue({
        treningId: 5,
        terminId: 10,
        trenerId: 2,
        maksimalanBrojIgraca: 15,
      });

      const req = {
        params: { id: '10' },
        body: { maksimalanBrojIgraca: 15 },
        user: { korisnikId: 2 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await kreirajGrupniTrening(req, res);

      expect(mockGrupneService.kreirajGrupniTreningService).toHaveBeenCalledWith('10', 2, 15, undefined);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          poruka: 'Grupni trening je uspješno kreiran.',
          trening: expect.any(Object),
        })
      );
    });

    it('vraća status 400 ili 500 pri neuspjehu', async () => {
      const error = new Error('Kapacitet grupe mora biti između 2 i 30.');
      error.status = 400;
      error.code = 'NEVALIDAN_KAPACITET';
      mockGrupneService.kreirajGrupniTreningService.mockRejectedValue(error);

      const req = {
        params: { id: '10' },
        body: { maksimalanBrojIgraca: 35 },
        user: { korisnikId: 2 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await kreirajGrupniTrening(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        greska: 'NEVALIDAN_KAPACITET',
        poruka: 'Kapacitet grupe mora biti između 2 i 30.',
      });
    });
  });

  describe('prijaviSeNaGrupniTrening', () => {
    it('prijavljuje igrača na trening i vraća status 200', async () => {
      mockGrupneService.prijaviSeNaGrupniTreningService.mockResolvedValue({
        prijavaId: 100,
        treningId: 5,
        korisnikId: 9,
      });

      const req = {
        params: { id: '5' },
        user: { korisnikId: 9 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await prijaviSeNaGrupniTrening(req, res);

      expect(mockGrupneService.prijaviSeNaGrupniTreningService).toHaveBeenCalledWith('5', 9);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          poruka: 'Uspješno ste se prijavili.',
          prijava: expect.any(Object),
        })
      );
    });
  });

  describe('getTrenerGrupniTreninzi', () => {
    it('vraća listu grupnih treninga trenera', async () => {
      mockGrupneService.getTrenerGrupniTreninziService.mockResolvedValue([
        { treningId: 1, trenerId: 2 },
      ]);

      const req = { user: { korisnikId: 2 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getTrenerGrupniTreninzi(req, res);

      expect(mockGrupneService.getTrenerGrupniTreninziService).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith({
        treninzi: [{ treningId: 1, trenerId: 2 }],
      });
    });
  });

  describe('getGrupniTreninzi', () => {
    it('vraća listu svih aktivnih grupnih treninga za igrača', async () => {
      mockGrupneService.getGrupniTreninziService.mockResolvedValue([
        { treningId: 1, maksimalanBrojIgraca: 10 },
      ]);

      const req = { user: { korisnikId: 9 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getGrupniTreninzi(req, res);

      expect(mockGrupneService.getGrupniTreninziService).toHaveBeenCalledWith(9);
      expect(res.json).toHaveBeenCalledWith({
        treninzi: [{ treningId: 1, maksimalanBrojIgraca: 10 }],
      });
    });
  });

  describe('otkaziGrupniTrening', () => {
    it('otkazuje grupni trening za trenera', async () => {
      mockGrupneService.otkaziGrupniTreningService.mockResolvedValue({
        poruka: 'Grupni trening je uspješno otkazan.'
      });

      const req = {
        params: { id: '100' },
        user: { korisnikId: 5 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await otkaziGrupniTrening(req, res);

      expect(mockGrupneService.otkaziGrupniTreningService).toHaveBeenCalledWith(100, 5);
      expect(res.json).toHaveBeenCalledWith({
        poruka: 'Grupni trening je uspješno otkazan.',
        brojPrekrsaja: 0,
        maxDozvoljeno: 3
      });
    });
  });

  describe('odjaviSeSaGrupnogTreninga', () => {
    it('odjavljuje igrača sa grupnog treninga', async () => {
      mockGrupneService.odjaviSeSaGrupnogTreningaService.mockResolvedValue({
        poruka: 'Uspješno ste se odjavili'
      });

      const req = {
        params: { id: '100' },
        body: { razlog: 'Povreda' },
        user: { korisnikId: 9 }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await odjaviSeSaGrupnogTreninga(req, res);

      expect(mockGrupneService.odjaviSeSaGrupnogTreningaService).toHaveBeenCalledWith(100, 9, 'Povreda');
      expect(res.json).toHaveBeenCalledWith({
        poruka: 'Uspješno ste se odjavili',
        brojPrekrsaja: 0,
        maxDozvoljeno: 3
      });
    });
  });

  describe('getTrenerNotifikacije', () => {
    it('dohvata notifikacije trenera', async () => {
      const mockNotifs = [{ notifikacijaId: 1, sadrzajPoruke: 'Neko se odjavio' }];
      mockGrupneService.getTrenerNotifikacijeService.mockResolvedValue(mockNotifs);

      const req = { user: { korisnikId: 5 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getTrenerNotifikacije(req, res);

      expect(mockGrupneService.getTrenerNotifikacijeService).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith({ notifikacije: mockNotifs });
    });
  });
});
