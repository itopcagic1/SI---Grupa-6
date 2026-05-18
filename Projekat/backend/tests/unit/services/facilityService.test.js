const mockPrisma = {
  sportskiObjekat: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  terminObjekta: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrisma)),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const facilityService = require('../../../src/services/facilityService');

describe('facilityService termini objekta', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
  });

  test('VLASNIK objekta moze kreirati jedan termin', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1, vlasnikId: 10 });
    mockPrisma.terminObjekta.findFirst.mockResolvedValue(null);
    mockPrisma.terminObjekta.create.mockImplementation(({ data }) => Promise.resolve({ terminId: 1, ...data }));

    const result = await facilityService.createFacilityTermsService(
      '1',
      {
        vrijemePocetka: '2026-05-20T18:00:00.000Z',
        trajanje: 60,
        ponavljanje: 'JEDNOM',
      },
      { korisnikId: 10, uloga: 'VLASNIK' }
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expect.objectContaining({
      objekatId: 1,
      tipTermina: 'JEDNOM',
      status: 'SLOBODAN',
    }));
    expect(result[0].vrijemeZavrsetka.toISOString()).toBe('2026-05-20T19:00:00.000Z');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  test('SEDMICNO kreira vise termina u razmaku od sedam dana', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1, vlasnikId: 10 });
    mockPrisma.terminObjekta.findFirst.mockResolvedValue(null);
    mockPrisma.terminObjekta.create.mockImplementation(({ data }) => Promise.resolve({ terminId: data.vrijemePocetka.getUTCDate(), ...data }));

    const result = await facilityService.createFacilityTermsService(
      1,
      {
        vrijemePocetka: '2026-05-20T18:00:00.000Z',
        trajanje: 90,
        ponavljanje: 'SEDMICNO',
        brojPonavljanja: 3,
      },
      { korisnikId: 10, uloga: 'VLASNIK' }
    );

    expect(result.map((termin) => termin.vrijemePocetka.toISOString())).toEqual([
      '2026-05-20T18:00:00.000Z',
      '2026-05-27T18:00:00.000Z',
      '2026-06-03T18:00:00.000Z',
    ]);
    expect(mockPrisma.terminObjekta.create).toHaveBeenCalledTimes(3);
  });

  test('MJESECNO kreira vise termina u razmaku od mjesec dana', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1, vlasnikId: 10 });
    mockPrisma.terminObjekta.findFirst.mockResolvedValue(null);
    mockPrisma.terminObjekta.create.mockImplementation(({ data }) => Promise.resolve({ terminId: data.vrijemePocetka.getUTCMonth(), ...data }));

    const result = await facilityService.createFacilityTermsService(
      1,
      {
        vrijemePocetka: '2026-05-20T18:00:00.000Z',
        trajanje: 60,
        ponavljanje: 'MJESECNO',
        brojPonavljanja: 3,
      },
      { korisnikId: 10, uloga: 'VLASNIK' }
    );

    expect(result.map((termin) => termin.vrijemePocetka.toISOString())).toEqual([
      '2026-05-20T18:00:00.000Z',
      '2026-06-20T18:00:00.000Z',
      '2026-07-20T18:00:00.000Z',
    ]);
    expect(mockPrisma.terminObjekta.create).toHaveBeenCalledTimes(3);
  });

  test('odbija nevalidan datum pri kreiranju termina', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1, vlasnikId: 10 });

    await expect(facilityService.createFacilityTermsService(
      1,
      { vrijemePocetka: 'nije-datum', trajanje: 60, ponavljanje: 'JEDNOM' },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 400,
      code: 'NEVALIDAN_DATUM',
    });

    expect(mockPrisma.terminObjekta.create).not.toHaveBeenCalled();
  });

  test('odbija nevalidno trajanje pri kreiranju termina', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1, vlasnikId: 10 });

    await expect(facilityService.createFacilityTermsService(
      1,
      { vrijemePocetka: '2026-05-20T18:00:00.000Z', trajanje: 45, ponavljanje: 'JEDNOM' },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 400,
      code: 'NEVALIDNO_TRAJANJE',
    });
  });

  test('odbija nevalidno ponavljanje pri kreiranju termina', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1, vlasnikId: 10 });

    await expect(facilityService.createFacilityTermsService(
      1,
      { vrijemePocetka: '2026-05-20T18:00:00.000Z', trajanje: 60, ponavljanje: 'DNEVNO' },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 400,
      code: 'NEVALIDNO_PONAVLJANJE',
    });
  });

  test('vraca 404 pri kreiranju termina ako objekat ne postoji', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue(null);

    await expect(facilityService.createFacilityTermsService(
      999,
      { vrijemePocetka: '2026-05-20T18:00:00.000Z', trajanje: 60 },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 404,
      code: 'OBJEKAT_NIJE_PRONADJEN',
    });
  });

  test('vraca 403 ako korisnik nije vlasnik objekta', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1, vlasnikId: 999 });

    await expect(facilityService.createFacilityTermsService(
      1,
      { vrijemePocetka: '2026-05-20T18:00:00.000Z', trajanje: 60 },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 403,
      code: 'NISTE_VLASNIK_OBJEKTA',
    });
  });

  test('ne kreira nijedan termin ako postoji preklapanje', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1, vlasnikId: 10 });
    mockPrisma.terminObjekta.findFirst.mockResolvedValue({
      terminId: 5,
      vrijemePocetka: new Date('2026-05-20T18:30:00.000Z'),
      vrijemeZavrsetka: new Date('2026-05-20T19:30:00.000Z'),
    });

    await expect(facilityService.createFacilityTermsService(
      1,
      { vrijemePocetka: '2026-05-20T18:00:00.000Z', trajanje: 60 },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 400,
      code: 'TERMIN_SE_PREKLAPA',
    });

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.terminObjekta.create).not.toHaveBeenCalled();
  });

  test('dohvata termine objekta koji se preklapaju sa datumskim opsegom', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1 });
    mockPrisma.terminObjekta.findMany.mockResolvedValue([{ terminId: 1 }]);

    const result = await facilityService.getFacilityTermsService(1, {
      od: '2026-05-20T00:00:00.000Z',
      do: '2026-05-21T00:00:00.000Z',
    });

    expect(result).toEqual([{ terminId: 1 }]);
    expect(mockPrisma.terminObjekta.findMany).toHaveBeenCalledWith({
      where: {
        objekatId: 1,
        vrijemePocetka: { lt: new Date('2026-05-21T00:00:00.000Z') },
        vrijemeZavrsetka: { gt: new Date('2026-05-20T00:00:00.000Z') },
      },
      orderBy: { vrijemePocetka: 'asc' },
    });
  });

  test('GET termini vraca i BLOKIRAN termine u opsegu', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1 });
    mockPrisma.terminObjekta.findMany.mockResolvedValue([
      { terminId: 1, status: 'SLOBODAN' },
      { terminId: 2, status: 'BLOKIRAN', tipTermina: 'BLOKIRAN' },
    ]);

    const result = await facilityService.getFacilityTermsService(1, {
      od: '2026-05-20T00:00:00.000Z',
      do: '2026-05-27T00:00:00.000Z',
    });

    expect(result).toEqual([
      { terminId: 1, status: 'SLOBODAN' },
      { terminId: 2, status: 'BLOKIRAN', tipTermina: 'BLOKIRAN' },
    ]);
    expect(mockPrisma.terminObjekta.findMany.mock.calls[0][0].where).not.toHaveProperty('status');
    expect(mockPrisma.terminObjekta.findMany.mock.calls[0][0].where).not.toHaveProperty('tipTermina');
  });

  test('GET termini vraca praznu listu ako nema termina', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue({ objekatId: 1 });
    mockPrisma.terminObjekta.findMany.mockResolvedValue([]);

    await expect(facilityService.getFacilityTermsService(1, {
      od: '2026-05-20T00:00:00.000Z',
      do: '2026-05-27T00:00:00.000Z',
    })).resolves.toEqual([]);
  });

  test('GET termini vraca 404 ako objekat ne postoji', async () => {
    mockPrisma.sportskiObjekat.findUnique.mockResolvedValue(null);

    await expect(facilityService.getFacilityTermsService(999, {
      od: '2026-05-20T00:00:00.000Z',
      do: '2026-05-27T00:00:00.000Z',
    })).rejects.toMatchObject({
      status: 404,
      code: 'OBJEKAT_NIJE_PRONADJEN',
    });
  });

  test('uspjesno mijenja termin ako je korisnik vlasnik objekta', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 7,
      objekatId: 1,
      vrijemePocetka: new Date('2026-05-20T18:00:00.000Z'),
      vrijemeZavrsetka: new Date('2026-05-20T19:00:00.000Z'),
      sportskiObjekat: { objekatId: 1, vlasnikId: 10 },
    });
    mockPrisma.terminObjekta.findFirst.mockResolvedValue(null);
    mockPrisma.terminObjekta.update.mockImplementation(({ data }) => Promise.resolve({ terminId: 7, ...data }));

    const result = await facilityService.updateFacilityTermService(
      7,
      {
        vrijemePocetka: '2026-05-20T19:00:00.000Z',
        trajanje: 90,
      },
      { korisnikId: 10, uloga: 'VLASNIK' }
    );

    expect(mockPrisma.terminObjekta.findFirst).toHaveBeenCalledWith({
      where: {
        objekatId: 1,
        vrijemePocetka: { lt: new Date('2026-05-20T20:30:00.000Z') },
        vrijemeZavrsetka: { gt: new Date('2026-05-20T19:00:00.000Z') },
        NOT: { terminId: 7 },
      },
    });
    expect(result.vrijemePocetka.toISOString()).toBe('2026-05-20T19:00:00.000Z');
    expect(result.vrijemeZavrsetka.toISOString()).toBe('2026-05-20T20:30:00.000Z');
  });

  test('zabranjuje izmjenu termina ako korisnik nije vlasnik objekta', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 7,
      objekatId: 1,
      vrijemePocetka: new Date('2026-05-20T18:00:00.000Z'),
      vrijemeZavrsetka: new Date('2026-05-20T19:00:00.000Z'),
      sportskiObjekat: { objekatId: 1, vlasnikId: 999 },
    });

    await expect(facilityService.updateFacilityTermService(
      7,
      { vrijemePocetka: '2026-05-20T19:00:00.000Z', trajanje: 90 },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 403,
      code: 'NISTE_VLASNIK_TERMINA',
    });
  });

  test('vraca 404 pri izmjeni ako termin ne postoji', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue(null);

    await expect(facilityService.updateFacilityTermService(
      999,
      { vrijemePocetka: '2026-05-20T19:00:00.000Z', trajanje: 90 },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 404,
      code: 'TERMIN_NIJE_PRONADJEN',
    });
  });

  test('zabranjuje izmjenu termina ako novi termin ima overlap', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 7,
      objekatId: 1,
      vrijemePocetka: new Date('2026-05-20T18:00:00.000Z'),
      vrijemeZavrsetka: new Date('2026-05-20T19:00:00.000Z'),
      sportskiObjekat: { objekatId: 1, vlasnikId: 10 },
    });
    mockPrisma.terminObjekta.findFirst.mockResolvedValue({ terminId: 8 });

    await expect(facilityService.updateFacilityTermService(
      7,
      { vrijemePocetka: '2026-05-20T19:00:00.000Z', trajanje: 90 },
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 400,
      code: 'TERMIN_SE_PREKLAPA',
    });

    expect(mockPrisma.terminObjekta.update).not.toHaveBeenCalled();
  });

  test('pri izmjeni ne tretira trenutni termin kao overlap sam sa sobom', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 7,
      objekatId: 1,
      vrijemePocetka: new Date('2026-05-20T18:00:00.000Z'),
      vrijemeZavrsetka: new Date('2026-05-20T19:00:00.000Z'),
      sportskiObjekat: { objekatId: 1, vlasnikId: 10 },
    });
    mockPrisma.terminObjekta.findFirst.mockResolvedValue(null);
    mockPrisma.terminObjekta.update.mockImplementation(({ data }) => Promise.resolve({ terminId: 7, ...data }));

    await facilityService.updateFacilityTermService(
      7,
      { vrijemePocetka: '2026-05-20T18:00:00.000Z', trajanje: 60 },
      { korisnikId: 10, uloga: 'VLASNIK' }
    );

    expect(mockPrisma.terminObjekta.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        NOT: { terminId: 7 },
      }),
    }));
    expect(mockPrisma.terminObjekta.update).toHaveBeenCalled();
  });

  test('uspjesno blokira termin ako je korisnik vlasnik objekta', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 7,
      objekatId: 1,
      sportskiObjekat: { objekatId: 1, vlasnikId: 10 },
    });
    mockPrisma.terminObjekta.update.mockResolvedValue({
      terminId: 7,
      tipTermina: 'BLOKIRAN',
      status: 'BLOKIRAN',
    });

    const result = await facilityService.blockFacilityTermService(
      7,
      { korisnikId: 10, uloga: 'VLASNIK' }
    );

    expect(mockPrisma.terminObjekta.update).toHaveBeenCalledWith({
      where: { terminId: 7 },
      data: {
        tipTermina: 'BLOKIRAN',
        status: 'BLOKIRAN',
      },
    });
    expect(result.status).toBe('BLOKIRAN');
  });

  test('zabranjuje blokiranje termina ako korisnik nije vlasnik objekta', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 7,
      objekatId: 1,
      sportskiObjekat: { objekatId: 1, vlasnikId: 999 },
    });

    await expect(facilityService.blockFacilityTermService(
      7,
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 403,
      code: 'NISTE_VLASNIK_TERMINA',
    });
  });

  test('vraca 404 pri blokiranju ako termin ne postoji', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue(null);

    await expect(facilityService.blockFacilityTermService(
      999,
      { korisnikId: 10, uloga: 'VLASNIK' }
    )).rejects.toMatchObject({
      status: 404,
      code: 'TERMIN_NIJE_PRONADJEN',
    });

    expect(mockPrisma.terminObjekta.update).not.toHaveBeenCalled();
  });
});
