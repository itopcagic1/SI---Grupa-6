const mockPrisma = {
  tim: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  korisnik: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  clanstvoTima: {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  ucesceUTakmicenju: {
    findFirst: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const teamService = require('../../../src/services/teamService');

describe('teamService', () => {
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test('service dohvaca listu timova', async () => {
    const teams = [{ timId: 1, naziv: 'FK Test', sportId: 1 }];
    mockPrisma.tim.findMany.mockResolvedValue(teams);

    const result = await teamService.getAllTeams();

    expect(mockPrisma.tim.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ sport: true }),
      })
    );
    expect(result).toEqual(teams);
  });

  test('service dohvaca jedan tim ako metoda postoji', async () => {
    const team = { timId: 1, naziv: 'FK Test', sportId: 1 };
    mockPrisma.tim.findUnique.mockResolvedValue(team);

    const result = await teamService.getTeamById('1');

    expect(mockPrisma.tim.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { timId: 1 } })
    );
    expect(result).toEqual(team);
  });

  test('service kreira tim sa validnim podacima', async () => {
    const created = { timId: 2, naziv: 'KK Test', sportId: 2, status: 'ACTIVE' };
    mockPrisma.tim.findFirst.mockResolvedValue(null);
    mockPrisma.tim.create.mockResolvedValue(created);

    const result = await teamService.createTeam({
      name: 'KK Test',
      sportId: 2,
      description: 'Opis',
      logoUrl: 'logo.png',
    });

    expect(mockPrisma.tim.findFirst).toHaveBeenCalledWith({ where: { naziv: 'KK Test' } });
    expect(mockPrisma.tim.create).toHaveBeenCalledWith({
      data: {
        naziv: 'KK Test',
        sportId: 2,
        opis: 'Opis',
        logoUrl: 'logo.png',
        status: 'ACTIVE',
      },
    });
    expect(result).toEqual(created);
  });

  test('service odbija duplikat tima ako je ta logika implementirana', async () => {
    mockPrisma.tim.findFirst.mockResolvedValue({ timId: 1, naziv: 'FK Test' });

    await expect(teamService.createTeam({ name: 'FK Test', sportId: 1 })).rejects.toThrow(
      'Tim sa ovim nazivom'
    );
    expect(mockPrisma.tim.create).not.toHaveBeenCalled();
  });

  test('service odbija nepostojeci sport pri kreiranju tima ako je ta logika implementirana', async () => {
    mockPrisma.tim.findFirst.mockResolvedValue(null);
    mockPrisma.tim.create.mockRejectedValue(new Error('Foreign key constraint failed'));

    await expect(teamService.createTeam({ name: 'Tim', sportId: 999 })).rejects.toThrow(
      'Foreign key constraint failed'
    );
  });

  test('service uredjuje tim', async () => {
    const updated = { timId: 1, naziv: 'FK Novi Test', opis: 'Novi opis', status: 'ACTIVE' };
    mockPrisma.tim.update.mockResolvedValue(updated);

    const result = await teamService.updateTeam('1', {
      name: 'FK Novi Test',
      description: 'Novi opis',
      status: 'ACTIVE',
    });

    expect(mockPrisma.tim.update).toHaveBeenCalledWith({
      where: { timId: 1 },
      data: {
        naziv: 'FK Novi Test',
        opis: 'Novi opis',
        logoUrl: undefined,
        status: 'ACTIVE',
      },
    });
    expect(result).toEqual(updated);
  });

  test('service brise tim', async () => {
    mockPrisma.ucesceUTakmicenju.findFirst.mockResolvedValue(null);
    mockPrisma.clanstvoTima.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.tim.delete.mockResolvedValue({ timId: 1 });

    const result = await teamService.deleteTeam('1');

    expect(mockPrisma.clanstvoTima.deleteMany).toHaveBeenCalledWith({ where: { timId: 1 } });
    expect(mockPrisma.tim.delete).toHaveBeenCalledWith({ where: { timId: 1 } });
    expect(result).toEqual({ timId: 1 });
  });

  test('service vraca null za nepostojeci tim kod dohvatanja po id-u', async () => {
    mockPrisma.tim.findUnique.mockResolvedValue(null);

    const result = await teamService.getTeamById('999');

    expect(result).toBeNull();
  });

  test('service dodjeljuje trenera timu ako metoda postoji', async () => {
    mockPrisma.tim.findUnique.mockResolvedValue({ timId: 1, naziv: 'FK Test' });
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 10,
      uloga: 'TRENER',
      trazenaUloga: 'TRENER',
    });
    mockPrisma.clanstvoTima.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.clanstvoTima.create.mockResolvedValue({
      clanstvoTimaId: 1,
      timId: 1,
      korisnikId: 10,
      ulogaUTimu: 'TRENER',
      status: 'ACTIVE',
    });

    const result = await teamService.addMemberToTeam('1', '10', 'TRENER', 'ADMINISTRATOR');

    expect(mockPrisma.clanstvoTima.create).toHaveBeenCalledWith({
      data: {
        timId: 1,
        korisnikId: 10,
        ulogaUTimu: 'TRENER',
        status: 'ACTIVE',
      },
    });
    expect(result).toEqual(expect.objectContaining({ ulogaUTimu: 'TRENER' }));
  });

  test('service odbija dodjelu korisnika koji nije TRENER ako je implementirano', async () => {
    mockPrisma.tim.findUnique.mockResolvedValue({ timId: 1, naziv: 'FK Test' });
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 11,
      uloga: 'NAVIJAC',
      trazenaUloga: 'IGRAC',
    });

    await expect(teamService.addMemberToTeam('1', '11', 'TRENER', 'ADMINISTRATOR')).rejects.toThrow(
      /Administrator ne može dodati korisnika kao TRENER/
    );
  });

  test('service dodaje igraca u tim ako metoda postoji', async () => {
    mockPrisma.tim.findUnique.mockResolvedValue({ timId: 1, naziv: 'FK Test' });
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 20,
      uloga: 'IGRAC',
      trazenaUloga: 'IGRAC',
    });
    mockPrisma.clanstvoTima.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.clanstvoTima.create.mockResolvedValue({
      clanstvoTimaId: 2,
      timId: 1,
      korisnikId: 20,
      ulogaUTimu: 'IGRAC',
      status: 'ACTIVE',
    });

    const result = await teamService.addMemberToTeam('1', '20', 'IGRAC', 'ADMINISTRATOR');

    expect(result).toEqual(expect.objectContaining({ ulogaUTimu: 'IGRAC' }));
  });

  test('service blokira duplikat igraca u istom timu ako je implementirano', async () => {
    mockPrisma.tim.findUnique.mockResolvedValue({ timId: 1, naziv: 'FK Test' });
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 20,
      uloga: 'IGRAC',
      trazenaUloga: 'IGRAC',
    });
    mockPrisma.clanstvoTima.findFirst.mockResolvedValueOnce({
      timId: 1,
      korisnikId: 20,
      status: 'ACTIVE',
    });

    await expect(teamService.addMemberToTeam('1', '20', 'IGRAC', 'ADMINISTRATOR')).rejects.toThrow(
      /Korisnik je već član ovog tima/
    );
  });

  test('service uklanja igraca iz tima ako metoda postoji', async () => {
    mockPrisma.clanstvoTima.deleteMany.mockResolvedValue({ count: 1 });

    const result = await teamService.removeMemberFromTeam('1', '20');

    expect(mockPrisma.clanstvoTima.deleteMany).toHaveBeenCalledWith({
      where: {
        timId: 1,
        korisnikId: 20,
      },
    });
    expect(result).toEqual({ count: 1 });
  });

  test('service ogranicava trenera na vlastiti tim ako je implementirano', async () => {
    mockPrisma.clanstvoTima.findFirst.mockResolvedValue(null);

    const result = await teamService.isUserCoachOfTeam('1', 99);

    expect(mockPrisma.clanstvoTima.findFirst).toHaveBeenCalledWith({
      where: {
        timId: 1,
        korisnikId: 99,
        ulogaUTimu: 'TRENER',
        status: 'ACTIVE',
      },
    });
    expect(result).toBe(false);
  });

  test('service ne vraca password/passwordHash/hash podatke kroz ukljucene relacije korisnika', async () => {
    mockPrisma.tim.findUnique.mockResolvedValue({
      timId: 1,
      naziv: 'FK Test',
      clanstvaUcesnika: [
        {
          korisnik: {
            korisnikId: 20,
            punoIme: 'Igrac Test',
            lozinkaHash: 'hash-value',
            refreshToken: 'refresh-token',
          },
        },
      ],
    });

    const result = await teamService.getTeamById('1');
    const body = JSON.stringify(result);

    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
    expect(body).not.toContain('password');
  });
});
