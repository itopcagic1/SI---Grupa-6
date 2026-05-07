const mockPrisma = {
  sport: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const sportService = require('../../../src/services/sportService');

describe('sportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('service dohvaca listu sportova', async () => {
    const sports = [
      { sportId: 1, naziv: 'Fudbal', opis: 'Fudbal', jeTimskiSport: true },
    ];
    mockPrisma.sport.findMany.mockResolvedValue(sports);

    const result = await sportService.getAllSports();

    expect(mockPrisma.sport.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(sports);
  });

  test('service kreira sport sa validnim podacima', async () => {
    const input = { naziv: 'Rukomet', opis: 'Rukomet', jeTimskiSport: true };
    const created = { sportId: 2, ...input };
    mockPrisma.sport.findUnique.mockResolvedValue(null);
    mockPrisma.sport.create.mockResolvedValue(created);

    const result = await sportService.createSport(input);

    expect(mockPrisma.sport.findUnique).toHaveBeenCalledWith({ where: { naziv: 'Rukomet' } });
    expect(mockPrisma.sport.create).toHaveBeenCalledWith({
      data: {
        naziv: 'Rukomet',
        opis: 'Rukomet',
        jeTimskiSport: true,
      },
    });
    expect(result).toEqual(created);
  });

  test('service odbija duplikat sporta ako je ta logika implementirana', async () => {
    mockPrisma.sport.findUnique.mockResolvedValue({
      sportId: 1,
      naziv: 'Fudbal',
      opis: 'Fudbal',
      jeTimskiSport: true,
    });

    await expect(sportService.createSport({ naziv: 'Fudbal' })).rejects.toThrow(
      'Sport sa ovim nazivom'
    );
    expect(mockPrisma.sport.create).not.toHaveBeenCalled();
  });

  test('service uredjuje sport', async () => {
    const updated = {
      sportId: 1,
      naziv: 'Fudbal',
      opis: 'Novi opis',
      jeTimskiSport: true,
    };
    mockPrisma.sport.update.mockResolvedValue(updated);

    const result = await sportService.updateSport('1', { opis: 'Novi opis' });

    expect(mockPrisma.sport.update).toHaveBeenCalledWith({
      where: { sportId: 1 },
      data: { opis: 'Novi opis' },
    });
    expect(result).toEqual(updated);
  });

  test('service brise sport', async () => {
    mockPrisma.sport.delete.mockResolvedValue({ sportId: 1 });

    const result = await sportService.deleteSport('1');

    expect(mockPrisma.sport.delete).toHaveBeenCalledWith({
      where: { sportId: 1 },
    });
    expect(result).toEqual({ sportId: 1 });
  });

  test('service vraca null za nepostojeci sport kod dohvatanja po id-u', async () => {
    mockPrisma.sport.findUnique.mockResolvedValue(null);

    const result = await sportService.getSportById('999');

    expect(mockPrisma.sport.findUnique).toHaveBeenCalledWith({
      where: { sportId: 999 },
    });
    expect(result).toBeNull();
  });

  test('service propagira gresku za nepostojeci sport pri update-u u skladu sa Prisma ponasanjem', async () => {
    mockPrisma.sport.update.mockRejectedValue(new Error('Record not found'));

    await expect(sportService.updateSport('999', { opis: 'Novo' })).rejects.toThrow(
      'Record not found'
    );
  });

  test('service trenutno nema eksplicitnu validaciju praznog naziva sporta u service sloju', async () => {
    mockPrisma.sport.findUnique.mockResolvedValue(null);
    mockPrisma.sport.create.mockResolvedValue({
      sportId: 5,
      naziv: '',
      opis: 'Prazan naziv',
      jeTimskiSport: true,
    });

    const result = await sportService.createSport({ naziv: '', opis: 'Prazan naziv' });

    expect(result).toEqual(expect.objectContaining({ naziv: '' }));
    expect(mockPrisma.sport.create).toHaveBeenCalled();
  });
});
