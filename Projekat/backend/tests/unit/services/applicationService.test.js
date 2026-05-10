const mockPrisma = {
  ucesceUTakmicenju: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const applicationService = require('../../../src/services/applicationService');

describe('applicationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('trener vidi samo prijave koje je sam napravio', async () => {
    mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue([
      {
        ucesceUTakmicenjuId: 1,
        statusPrijave: 'ODOBRENO',
        datumPrijave: new Date('2026-05-01T10:00:00.000Z'),
        tim: { timId: 2, naziv: 'FK Test' },
        takmicenje: {
          takmicenjeId: 3,
          naziv: 'Premijer liga',
          lokacija: 'Arena Centar',
          lokacijaOpis: 'Rezervna lokacija',
          sport: { sportId: 4, naziv: 'Fudbal' },
        },
      },
    ]);

    const result = await applicationService.dohvatiMojePrijave(10);

    expect(mockPrisma.ucesceUTakmicenju.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          prijavioKorisnikId: 10,
          tim: {
            clanstvaUcesnika: {
              some: {
                korisnikId: 10,
                ulogaUTimu: 'TRENER',
                status: 'ACTIVE',
              },
            },
          },
        }),
      })
    );
    expect(result).toEqual([
      expect.objectContaining({
        tim: 'FK Test',
        takmicenje: 'Premijer liga',
        sport: 'Fudbal',
        status: 'ODOBRENO',
        defaultnaLokacija: 'Arena Centar',
      }),
    ]);
  });

  test('drugi trener ne vidi tudje prijave jer se query filtrira po korisnikId', async () => {
    mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue([]);

    const result = await applicationService.dohvatiMojePrijave(22);

    expect(mockPrisma.ucesceUTakmicenju.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          prijavioKorisnikId: 22,
          tim: expect.any(Object),
        }),
      })
    );
    expect(result).toEqual([]);
  });

  test('prazna lista se vraca bez greske', async () => {
    mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue([]);

    await expect(applicationService.dohvatiMojePrijave(10)).resolves.toEqual([]);
  });

  test('status se vraca iz statusPrijave, a null status postaje PENDING', async () => {
    mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue([
      {
        ucesceUTakmicenjuId: 1,
        statusPrijave: 'ODBIJENO',
        datumPrijave: new Date('2026-05-01T10:00:00.000Z'),
        tim: { naziv: 'Tim A' },
        takmicenje: { naziv: 'Liga A', sport: { naziv: 'Kosarka' } },
      },
      {
        ucesceUTakmicenjuId: 2,
        statusPrijave: null,
        datumPrijave: new Date('2026-05-02T10:00:00.000Z'),
        tim: { naziv: 'Tim B' },
        takmicenje: { naziv: 'Liga B', sport: { naziv: 'Rukomet' } },
      },
    ]);

    const result = await applicationService.dohvatiMojePrijave(10);

    expect(result.map((prijava) => prijava.status)).toEqual(['ODBIJENO', 'PENDING']);
  });

  test('fallback lokacija koristi lokacijaOpis pa defaultni tekst', async () => {
    mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue([
      {
        ucesceUTakmicenjuId: 1,
        statusPrijave: 'PENDING',
        datumPrijave: new Date('2026-05-01T10:00:00.000Z'),
        tim: { naziv: 'Tim A' },
        takmicenje: {
          naziv: 'Liga A',
          lokacija: '',
          lokacijaOpis: 'Gradski teren',
          sport: { naziv: 'Fudbal' },
        },
      },
      {
        ucesceUTakmicenjuId: 2,
        statusPrijave: 'PENDING',
        datumPrijave: new Date('2026-05-02T10:00:00.000Z'),
        tim: { naziv: 'Tim B' },
        takmicenje: {
          naziv: 'Liga B',
          lokacija: null,
          lokacijaOpis: null,
          sport: { naziv: 'Odbojka' },
        },
      },
    ]);

    const result = await applicationService.dohvatiMojePrijave(10);

    expect(result.map((prijava) => prijava.defaultnaLokacija)).toEqual([
      'Gradski teren',
      'Lokacija nije definisana',
    ]);
  });
});
