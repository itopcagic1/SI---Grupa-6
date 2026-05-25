const mockTx = {
  zahtjevZaRezervaciju: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  rezervacija: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  terminObjekta: {
    update: jest.fn(),
  },
  notifikacija: {
    create: jest.fn(),
  },
};

const mockPrisma = {
  zahtjevZaRezervaciju: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  rezervacija: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockTx)),
};

jest.mock('../../../src/config/db', () => mockPrisma);

const { obradiZahtjevVerifikacijeService } = require('../../../src/services/vlasnikService');

const vlasnik = { korisnikId: 1, uloga: 'VLASNIK' };

function pendingZahtjev(overrides = {}) {
  return {
    zahtjevId: 10,
    terminId: 20,
    korisnikId: 30,
    status: 'NA_CEKANJU',
    korisnik: {
      korisnikId: 30,
      punoIme: 'Test Igrac',
      email: 'igrac@test.ba',
    },
    terminObjekta: {
      terminId: 20,
      status: 'SLOBODAN',
      sportskiObjekat: {
        objekatId: 40,
        naziv: 'Dvorana',
        vlasnikId: 1,
      },
    },
    ...overrides,
  };
}

describe('Vlasnik Service - obrada zahtjeva za verifikaciju', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((callback) => callback(mockTx));
  });

  test('VLASNIK može odobriti pending zahtjev', async () => {
    const zahtjev = pendingZahtjev();
    const odobrenZahtjev = { ...zahtjev, status: 'ODOBRENO' };
    const rezervacija = { rezervacijaId: 99, zahtjevId: 10, terminId: 20, status: 'POTVRDJENA' };

    mockTx.zahtjevZaRezervaciju.findUnique.mockResolvedValue(zahtjev);
    mockTx.rezervacija.findFirst.mockResolvedValue(null);
    mockTx.zahtjevZaRezervaciju.update.mockResolvedValue(odobrenZahtjev);
    mockTx.rezervacija.create.mockResolvedValue(rezervacija);
    mockTx.terminObjekta.update.mockResolvedValue({ terminId: 20, status: 'ZAUZET' });
    mockTx.notifikacija.create.mockResolvedValue({ notifikacijaId: 1 });

    const rezultat = await obradiZahtjevVerifikacijeService(vlasnik, '10', { akcija: 'ODOBRI' });

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockTx.zahtjevZaRezervaciju.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { zahtjevId: 10 },
        data: expect.objectContaining({
          status: 'ODOBRENO',
          obradioKorisnikId: 1,
          razlogOdbijanja: null,
        }),
      })
    );
    expect(mockTx.rezervacija.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        zahtjevId: 10,
        terminId: 20,
        status: 'POTVRDJENA',
      }),
    });
    expect(mockTx.terminObjekta.update).toHaveBeenCalledWith({
      where: { terminId: 20 },
      data: { status: 'ZAUZET' },
    });
    expect(mockTx.notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          korisnikId: 30,
          tipNotifikacije: 'ZAHTJEV_REZERVACIJE_ODOBREN',
        }),
      })
    );
    expect(rezultat).toEqual({
      message: 'Zahtjev je odobren.',
      zahtjev: odobrenZahtjev,
      rezervacija,
    });
  });

  test('VLASNIK može odbiti pending zahtjev sa validnim razlogom', async () => {
    const zahtjev = pendingZahtjev();
    const odbijenZahtjev = { ...zahtjev, status: 'ODBIJENO', razlogOdbijanja: 'Termin nije dostupan.' };

    mockTx.zahtjevZaRezervaciju.findUnique.mockResolvedValue(zahtjev);
    mockTx.zahtjevZaRezervaciju.update.mockResolvedValue(odbijenZahtjev);
    mockTx.notifikacija.create.mockResolvedValue({ notifikacijaId: 2 });

    const rezultat = await obradiZahtjevVerifikacijeService(vlasnik, '10', {
      akcija: 'ODBIJ',
      razlogOdbijanja: 'Termin nije dostupan.',
    });

    expect(mockTx.zahtjevZaRezervaciju.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { zahtjevId: 10 },
        data: expect.objectContaining({
          status: 'ODBIJENO',
          razlogOdbijanja: 'Termin nije dostupan.',
          obradioKorisnikId: 1,
        }),
      })
    );
    expect(mockTx.rezervacija.create).not.toHaveBeenCalled();
    expect(mockTx.notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          korisnikId: 30,
          tipNotifikacije: 'ZAHTJEV_REZERVACIJE_ODBIJEN',
        }),
      })
    );
    expect(rezultat).toEqual({
      message: 'Zahtjev je odbijen.',
      zahtjev: odbijenZahtjev,
    });
  });

  test('ODBIJ bez validnog razloga vraća 400', async () => {
    mockTx.zahtjevZaRezervaciju.findUnique.mockResolvedValue(pendingZahtjev());

    await expect(
      obradiZahtjevVerifikacijeService(vlasnik, '10', {
        akcija: 'ODBIJ',
        razlogOdbijanja: 'kratko',
      })
    ).rejects.toMatchObject({
      status: 400,
      code: 'NEVALIDAN_RAZLOG_ODBIJANJA',
    });
  });

  test('nevalidna akcija vraća 400', async () => {
    await expect(
      obradiZahtjevVerifikacijeService(vlasnik, '10', { akcija: 'MOZDA' })
    ).rejects.toMatchObject({
      status: 400,
      code: 'NEISPRAVNA_AKCIJA',
    });
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  test('ne može se obraditi zahtjev koji nije pending', async () => {
    mockTx.zahtjevZaRezervaciju.findUnique.mockResolvedValue(
      pendingZahtjev({ status: 'ODOBRENO' })
    );

    await expect(
      obradiZahtjevVerifikacijeService(vlasnik, '10', { akcija: 'ODOBRI' })
    ).rejects.toMatchObject({
      status: 409,
      code: 'ZAHTJEV_NIJE_PENDING',
    });
  });

  test('ne može se odobriti zahtjev ako je termin zauzet', async () => {
    mockTx.zahtjevZaRezervaciju.findUnique.mockResolvedValue(
      pendingZahtjev({
        terminObjekta: {
          terminId: 20,
          status: 'ZAUZET',
          sportskiObjekat: {
            objekatId: 40,
            naziv: 'Dvorana',
            vlasnikId: 1,
          },
        },
      })
    );

    await expect(
      obradiZahtjevVerifikacijeService(vlasnik, '10', { akcija: 'ODOBRI' })
    ).rejects.toMatchObject({
      status: 409,
      code: 'TERMIN_NIJE_SLOBODAN',
    });
  });

  test('VLASNIK ne može obraditi zahtjev koji ne pripada njegovom objektu', async () => {
    mockTx.zahtjevZaRezervaciju.findUnique.mockResolvedValue(
      pendingZahtjev({
        terminObjekta: {
          terminId: 20,
          status: 'SLOBODAN',
          sportskiObjekat: {
            objekatId: 40,
            naziv: 'Dvorana',
            vlasnikId: 999,
          },
        },
      })
    );

    await expect(
      obradiZahtjevVerifikacijeService(vlasnik, '10', { akcija: 'ODOBRI' })
    ).rejects.toMatchObject({
      status: 403,
      code: 'ZABRANJEN_PRISTUP',
    });
  });
});
