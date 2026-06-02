const mockPrisma = {
  takmicenje: {
    findUnique: jest.fn(),
  },
  utakmica: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// tabelaService se koristi unutar generateTabelaPDF
jest.mock('../../../src/services/tabelaService', () => ({
  getTabelaZaTakmicenje: jest.fn(),
}));

const tabelaService = require('../../../src/services/tabelaService');
const pdfService = require('../../../src/services/pdfService');

const takmicenje = { naziv: 'Premijer liga', sezona: '2026/2027' };

const utakmica = {
  utakmicaId: 1,
  vrijemePocetka: new Date('2026-05-18T17:00:00Z'),
  domaciTim: { naziv: 'FK Tempo' },
  gostujuciTim: { naziv: 'FC Arena' },
  rezultatUtakmice: { rezultatDomacin: 2, rezultatGost: 1 },
  sportskiObjekat: { naziv: 'Stadion' },
  lokacijaOpis: null,
};

describe('pdfService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRezultatiPDF', () => {
    test('vraca Buffer kada postoje utakmice', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.utakmica.findMany.mockResolvedValue([utakmica]);

      const result = await pdfService.generateRezultatiPDF(1);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('vraca Buffer i kada nema utakmica (prazan izvjestaj)', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.utakmica.findMany.mockResolvedValue([]);

      const result = await pdfService.generateRezultatiPDF(1);

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test('baca gresku kada takmicenje ne postoji', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(null);

      await expect(pdfService.generateRezultatiPDF(999)).rejects.toThrow('Takmicenje nije pronađeno');
    });

    test('filtrira utakmice po datumOd i datumDo', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.utakmica.findMany.mockResolvedValue([utakmica]);

      await pdfService.generateRezultatiPDF(1, '2026-05-01', '2026-05-31');

      expect(mockPrisma.utakmica.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vrijemePocetka: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    test('ne primjenjuje filter datuma ako nisu proslijedjeni', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.utakmica.findMany.mockResolvedValue([utakmica]);

      await pdfService.generateRezultatiPDF(1);

      expect(mockPrisma.utakmica.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ vrijemePocetka: expect.anything() }),
        })
      );
    });
  });

  describe('generateRasporedPDF', () => {
    test('vraca Buffer kada postoje utakmice', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.utakmica.findMany.mockResolvedValue([utakmica]);

      const result = await pdfService.generateRasporedPDF(1);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('vraca Buffer i kada nema utakmica', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.utakmica.findMany.mockResolvedValue([]);

      const result = await pdfService.generateRasporedPDF(1);

      expect(Buffer.isBuffer(result)).toBe(true);
    });

    test('baca gresku kada takmicenje ne postoji', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(null);

      await expect(pdfService.generateRasporedPDF(999)).rejects.toThrow('Takmicenje nije pronađeno');
    });

    test('dohvata utakmice bez filtriranja po rezultatu (za razliku od rezultatiPDF)', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.utakmica.findMany.mockResolvedValue([utakmica]);

      await pdfService.generateRasporedPDF(1);

      expect(mockPrisma.utakmica.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ rezultatUtakmice: expect.anything() }),
        })
      );
    });
  });

  describe('generateTabelaPDF', () => {
    test('vraca Buffer sa validnim podacima tabele', async () => {
      tabelaService.getTabelaZaTakmicenje.mockResolvedValue({
        takmicenje,
        tabela: [
          {
            pozicija: 1,
            naziv: 'FK Tempo',
            odigrane: 5,
            pobjede: 4,
            nerijeseno: 0,
            porazi: 1,
            golovi: 10,
            primljeniGolovi: 3,
            bodovi: 12,
          },
        ],
      });

      const result = await pdfService.generateTabelaPDF(1);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('vraca Buffer i kada je tabela prazna', async () => {
      tabelaService.getTabelaZaTakmicenje.mockResolvedValue({
        takmicenje,
        tabela: [],
      });

      const result = await pdfService.generateTabelaPDF(1);

      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});
