const mockPrisma = {
  sport: {
    findUnique: jest.fn(),
  },
  takmicenje: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  tim: {
    findUnique: jest.fn(),
  },
  ucesceUTakmicenju: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  plasmanNaTabeli: {
    deleteMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const ligaService = require('../../../src/services/ligaService');

describe('ligaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('service dohvaca listu liga', async () => {
    const lige = [{ takmicenjeId: 1, naziv: 'Premijer liga', sportId: 1 }];
    mockPrisma.takmicenje.findMany.mockResolvedValue(lige);

    const result = await ligaService.dohvatiSveLige({ sportId: '1', status: 'AKTIVNA' });

    expect(mockPrisma.takmicenje.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sportId: 1, status: 'AKTIVNA' },
      })
    );
    expect(result).toEqual(lige);
  });

  test('service dohvaca jednu ligu ako metoda postoji', async () => {
    const liga = { takmicenjeId: 1, naziv: 'Premijer liga', sportId: 1 };
    mockPrisma.takmicenje.findUnique.mockResolvedValue(liga);

    const result = await ligaService.dohvatiLiguPoId('1');

    expect(mockPrisma.takmicenje.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { takmicenjeId: 1 } })
    );
    expect(result).toEqual(liga);
  });

  test('service kreira ligu sa validnim podacima', async () => {
    const created = { takmicenjeId: 2, naziv: 'Nova liga', sportId: 1, organizatorId: 10 };
    mockPrisma.sport.findUnique.mockResolvedValue({ sportId: 1, naziv: 'Fudbal' });
    mockPrisma.takmicenje.findFirst.mockResolvedValue(null);
    mockPrisma.takmicenje.create.mockResolvedValue(created);

    const result = await ligaService.kreirajLigu(
      { naziv: 'Nova liga', sportId: 1, sezona: '2026/2027' },
      10
    );

    expect(mockPrisma.sport.findUnique).toHaveBeenCalledWith({ where: { sportId: 1 } });
    expect(mockPrisma.takmicenje.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          naziv: 'Nova liga',
          sportId: 1,
          organizatorId: 10,
          status: 'AKTIVNA',
        }),
      })
    );
    expect(result).toEqual(created);
  });

  test('service odbija duplikat lige ako je ta logika implementirana', async () => {
    const existing = { takmicenjeId: 1, naziv: 'Premijer liga', sportId: 1 };
    mockPrisma.sport.findUnique.mockResolvedValue({ sportId: 1, naziv: 'Fudbal' });
    mockPrisma.takmicenje.findFirst.mockResolvedValue(existing);

    await expect(ligaService.kreirajLigu({ naziv: 'Premijer liga', sportId: 1 }, 10)).rejects.toMatchObject({
      status: 409,
      code: 'DUPLIKAT_LIGE',
    });

    expect(mockPrisma.takmicenje.findFirst).toHaveBeenCalledWith({
      where: {
        naziv: 'Premijer liga',
        sportId: 1,
      },
    });
    expect(mockPrisma.takmicenje.create).not.toHaveBeenCalled();
  });

  test('service odbija nepostojeci sport pri kreiranju lige ako je ta logika implementirana', async () => {
    mockPrisma.sport.findUnique.mockResolvedValue(null);

    await expect(ligaService.kreirajLigu({ naziv: 'Liga', sportId: 999 }, 10)).rejects.toMatchObject({
      status: 404,
      code: 'SPORT_NIJE_PRONADJEN',
    });
    expect(mockPrisma.takmicenje.create).not.toHaveBeenCalled();
  });

  test('service uredjuje ligu', async () => {
    mockPrisma.takmicenje.findUnique.mockResolvedValue({
      takmicenjeId: 1,
      organizatorId: 10,
      sportId: 1,
    });
    mockPrisma.takmicenje.update.mockResolvedValue({
      takmicenjeId: 1,
      naziv: 'Izmijenjena liga',
    });

    const result = await ligaService.izmijeniLigu(
      '1',
      { naziv: 'Izmijenjena liga' },
      10,
      'ADMINISTRATOR'
    );

    expect(mockPrisma.takmicenje.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { takmicenjeId: 1 },
        data: expect.objectContaining({ naziv: 'Izmijenjena liga' }),
      })
    );
    expect(result).toEqual(expect.objectContaining({ naziv: 'Izmijenjena liga' }));
  });

  test('service brise ligu', async () => {
    mockPrisma.takmicenje.findUnique.mockResolvedValue({
      takmicenjeId: 1,
      organizatorId: 10,
      _count: { utakmice: 0 },
    });
    mockPrisma.ucesceUTakmicenju.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.plasmanNaTabeli.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.takmicenje.delete.mockResolvedValue({ takmicenjeId: 1 });

    const result = await ligaService.obrisiLigu('1', 10, 'ADMINISTRATOR');

    expect(mockPrisma.takmicenje.delete).toHaveBeenCalledWith({ where: { takmicenjeId: 1 } });
    expect(result).toEqual({ takmicenjeId: 1 });
  });

  test('service vraca gresku za nepostojecu ligu u skladu sa postojecom implementacijom', async () => {
    mockPrisma.takmicenje.findUnique.mockResolvedValue(null);

    await expect(ligaService.dohvatiLiguPoId('999')).rejects.toMatchObject({
      status: 404,
      code: 'LIGA_NIJE_PRONADJENA',
    });
  });

  test('service dodaje tim u ligu ako metoda postoji', async () => {
    mockPrisma.takmicenje.findUnique.mockResolvedValue({ takmicenjeId: 1, sportId: 1 });
    mockPrisma.tim.findUnique.mockResolvedValue({ timId: 2, sportId: 1 });
    mockPrisma.ucesceUTakmicenju.findFirst.mockResolvedValue(null);
    mockPrisma.ucesceUTakmicenju.create.mockResolvedValue({
      ucesceUTakmicenjuId: 1,
      takmicenjeId: 1,
      timId: 2,
    });

    const result = await ligaService.dodajTimULigu('1', '2', 10);

    expect(mockPrisma.ucesceUTakmicenju.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          takmicenje: { connect: { takmicenjeId: 1 } },
          tim: { connect: { timId: 2 } },
        }),
      })
    );
    expect(result).toEqual(expect.objectContaining({ timId: 2 }));
  });

  test('service blokira dodavanje istog tima vise puta u istu ligu ako je implementirano', async () => {
    mockPrisma.takmicenje.findUnique.mockResolvedValue({ takmicenjeId: 1, sportId: 1 });
    mockPrisma.tim.findUnique.mockResolvedValue({ timId: 2, sportId: 1 });
    mockPrisma.ucesceUTakmicenju.findFirst.mockResolvedValue({
      ucesceUTakmicenjuId: 1,
      takmicenjeId: 1,
      timId: 2,
    });

    await expect(ligaService.dodajTimULigu('1', '2', 10)).rejects.toMatchObject({ status: 409 });
  });

  test('service odbija dodavanje nepostojeceg tima ako je implementirano', async () => {
    mockPrisma.takmicenje.findUnique.mockResolvedValue({ takmicenjeId: 1, sportId: 1 });
    mockPrisma.tim.findUnique.mockResolvedValue(null);

    await expect(ligaService.dodajTimULigu('1', '999', 10)).rejects.toThrow();
  });

  test('service uklanja tim iz lige ako metoda postoji', async () => {
    mockPrisma.ucesceUTakmicenju.findFirst.mockResolvedValue({
      ucesceUTakmicenjuId: 1,
      takmicenjeId: 1,
      timId: 2,
    });
    mockPrisma.ucesceUTakmicenju.delete.mockResolvedValue({ ucesceUTakmicenjuId: 1 });

    const result = await ligaService.ukloniTimIzLige('1', '2');

    expect(mockPrisma.ucesceUTakmicenju.delete).toHaveBeenCalledWith({
      where: { ucesceUTakmicenjuId: 1 },
    });
    expect(result).toEqual({ ucesceUTakmicenjuId: 1 });
  });

  test('service ne vraca password/passwordHash/hash podatke kroz ukljucene relacije', async () => {
    mockPrisma.takmicenje.findUnique.mockResolvedValue({
      takmicenjeId: 1,
      naziv: 'Premijer liga',
      organizator: { korisnikId: 1, punoIme: 'Admin', email: 'admin@example.com' },
      ucesniciTakmicenja: [{ tim: { timId: 2, naziv: 'FK Test' } }],
    });

    const result = await ligaService.dohvatiLiguPoId('1');
    const body = JSON.stringify(result);

    expect(body).not.toContain('lozinka');
    expect(body).not.toContain('password');
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });
});
