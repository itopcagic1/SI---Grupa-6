const mockPrisma = {
  takmicenje: {
    findUnique: jest.fn(),
  },
  plasmanNaTabeli: {
    findMany: jest.fn(),
  },
  rezultatUtakmice: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const tabelaService = require('../../../src/services/tabelaService');

describe('tabelaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.takmicenje.findUnique.mockResolvedValue({
      takmicenjeId: 1,
      naziv: 'Liga',
      sezona: '2026/2027',
    });
    mockPrisma.plasmanNaTabeli.findMany.mockResolvedValue([
      {
        timId: 10,
        takmicenjeId: 1,
        brojPobjeda: 1,
        brojNerijesenih: 0,
        brojPoraza: 0,
        ukupniBodovi: 3,
        tim: { timId: 10, naziv: 'Real Madrid', logoUrl: null },
      },
      {
        timId: 20,
        takmicenjeId: 1,
        brojPobjeda: 0,
        brojNerijesenih: 0,
        brojPoraza: 1,
        ukupniBodovi: 0,
        tim: { timId: 20, naziv: 'Barcelona', logoUrl: null },
      },
    ]);
  });

  test('racuna G+, G- i GR iz RezultatUtakmice za domaci i gostujuci tim', async () => {
    mockPrisma.rezultatUtakmice.findMany
      .mockResolvedValueOnce([
        {
          rezultatDomacin: 2,
          rezultatGost: 1,
          utakmica: { domaciTimId: 10, gostujuciTimId: 20 },
        },
      ])
      .mockResolvedValueOnce([
        {
          rezultatDomacin: 2,
          rezultatGost: 1,
          utakmica: { domaciTimId: 10, gostujuciTimId: 20 },
        },
      ]);

    const result = await tabelaService.getTabelaZaTakmicenje(1);

    expect(result.tabela).toEqual([
      expect.objectContaining({
        timId: 10,
        golovi: 2,
        primljeniGolovi: 1,
        golRazlika: 1,
        bodovi: 3,
      }),
      expect.objectContaining({
        timId: 20,
        golovi: 1,
        primljeniGolovi: 2,
        golRazlika: -1,
        bodovi: 0,
      }),
    ]);
  });
});
