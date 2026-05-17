const mockPrisma = {
  tipStatistike: {
    findMany: jest.fn(),
  },
  utakmica: {
    findUnique: jest.fn(),
  },
  clanstvoTima: {
    findFirst: jest.fn(),
  },
  statistikaIgracaNaUtakmici: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  vrijednostStatistikeIgraca: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  statistikaTimaNaUtakmici: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  vrijednostStatistikeTima: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(async (fn) => fn(mockPrisma)),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const statistikaService = require('../../../src/services/statistikaService');

const utakmica = {
  utakmicaId: 1,
  takmicenjeId: 10,
  domaciTimId: 20,
  gostujuciTimId: 30,
  takmicenje: {
    takmicenjeId: 10,
    sportId: 5,
    organizatorId: 100,
  },
};

const organizator = { korisnikId: 100, uloga: 'ORGANIZATOR' };

describe('statistikaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockPrisma));
    mockPrisma.tipStatistike.findMany.mockResolvedValue([{ tipStatistikeId: 1 }]);
    mockPrisma.utakmica.findUnique.mockResolvedValue(utakmica);
    mockPrisma.clanstvoTima.findFirst.mockResolvedValue({ korisnikId: 200, timId: 20, status: 'ACTIVE' });
    mockPrisma.statistikaIgracaNaUtakmici.findFirst.mockResolvedValue(null);
    mockPrisma.statistikaIgracaNaUtakmici.create.mockResolvedValue({ statistikaIgracaId: 7 });
    mockPrisma.statistikaIgracaNaUtakmici.findUnique.mockResolvedValue({ statistikaIgracaId: 7 });
    mockPrisma.vrijednostStatistikeIgraca.findFirst.mockResolvedValue(null);
    mockPrisma.vrijednostStatistikeIgraca.create.mockResolvedValue({ vrijednostId: 9 });
    mockPrisma.statistikaTimaNaUtakmici.findFirst.mockResolvedValue(null);
    mockPrisma.statistikaTimaNaUtakmici.create.mockResolvedValue({ statistikaTimaId: 8 });
    mockPrisma.statistikaTimaNaUtakmici.findUnique.mockResolvedValue({ statistikaTimaId: 8 });
    mockPrisma.vrijednostStatistikeTima.findFirst.mockResolvedValue(null);
    mockPrisma.vrijednostStatistikeTima.create.mockResolvedValue({ vrijednostId: 10 });
  });

  test('dohvata tipove statistike za sport', async () => {
    await statistikaService.getTipoviStatistike(5);

    expect(mockPrisma.tipStatistike.findMany).toHaveBeenCalledWith({
      where: { sportId: 5 },
      orderBy: { nazivStatistike: 'asc' },
    });
  });

  test('snima statistiku igraca samo ako je igrac clan tima na utakmici', async () => {
    await statistikaService.snimiStatistikuIgraca(1, {
      korisnikId: 200,
      vrijednosti: [{ tipStatistikeId: 1, vrijednost: 2 }],
    }, organizator);

    expect(mockPrisma.clanstvoTima.findFirst).toHaveBeenCalledWith({
      where: {
        korisnikId: 200,
        timId: { in: [20, 30] },
        status: 'ACTIVE',
      },
    });
    expect(mockPrisma.statistikaIgracaNaUtakmici.create).toHaveBeenCalledWith({
      data: { utakmicaId: 1, korisnikId: 200, timId: 20 },
    });
  });

  test('odbija igraca koji nije clan timova utakmice', async () => {
    mockPrisma.clanstvoTima.findFirst.mockResolvedValue(null);

    await expect(statistikaService.snimiStatistikuIgraca(1, {
      korisnikId: 999,
      vrijednosti: [{ tipStatistikeId: 1, vrijednost: 1 }],
    }, organizator)).rejects.toThrow('Igrač mora biti aktivan član jednog od timova na utakmici.');
  });

  test('azurira postojecu vrijednost umjesto duplikata', async () => {
    mockPrisma.statistikaIgracaNaUtakmici.findFirst.mockResolvedValue({ statistikaIgracaId: 7 });
    mockPrisma.vrijednostStatistikeIgraca.findFirst.mockResolvedValue({ vrijednostId: 9 });

    await statistikaService.snimiStatistikuIgraca(1, {
      korisnikId: 200,
      vrijednosti: [{ tipStatistikeId: 1, vrijednost: 4 }],
    }, organizator);

    expect(mockPrisma.vrijednostStatistikeIgraca.update).toHaveBeenCalledWith({
      where: { vrijednostId: 9 },
      data: { vrijednost: 4 },
    });
    expect(mockPrisma.vrijednostStatistikeIgraca.create).not.toHaveBeenCalled();
  });

  test('odbija tip statistike koji nije vezan za sport utakmice', async () => {
    mockPrisma.tipStatistike.findMany.mockResolvedValue([]);

    await expect(statistikaService.snimiStatistikuTima(1, {
      timId: 20,
      vrijednosti: [{ tipStatistikeId: 99, vrijednost: 1 }],
    }, organizator)).rejects.toThrow('Statistika ne odgovara sportu ove utakmice.');
  });

  test('snima timsku statistiku za tim koji igra utakmicu', async () => {
    await statistikaService.snimiStatistikuTima(1, {
      timId: 20,
      vrijednosti: [{ tipStatistikeId: 1, vrijednost: 55 }],
    }, organizator);

    expect(mockPrisma.statistikaTimaNaUtakmici.create).toHaveBeenCalledWith({
      data: { utakmicaId: 1, timId: 20 },
    });
    expect(mockPrisma.vrijednostStatistikeTima.create).toHaveBeenCalledWith({
      data: { statistikaTimaId: 8, tipStatistikeId: 1, vrijednost: 55 },
    });
  });

  test('postuje isti permission model kao unos rezultata', async () => {
    await expect(statistikaService.snimiStatistikuTima(1, {
      timId: 20,
      vrijednosti: [{ tipStatistikeId: 1, vrijednost: 1 }],
    }, { korisnikId: 101, uloga: 'ORGANIZATOR' })).rejects.toThrow('Nemate ovlaštenje za unos statistike za ovu utakmicu.');
  });
});
