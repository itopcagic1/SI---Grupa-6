const mockPrisma = {
  terminObjekta: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  rezervacija: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  zahtjevZaRezervaciju: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../../src/config/db', () => mockPrisma);

const {

  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
} = require('../../../src/services/rezervacijaService');

describe('Rezervacija Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  test('getAllTermsService vraća slobodne i korisnikove rezervisane termine', async () => {
    const now = new Date();
    const buduciTermin = new Date(now.getTime() + 3600000);


    mockPrisma.rezervacija.findMany.mockResolvedValue([]);

    mockPrisma.terminObjekta.findMany.mockResolvedValue([
      {
        terminId: 1,
        tipTermina: 'INDIVIDUALNI',
        status: 'SLOBODAN',
        vrijemePocetka: buduciTermin,
        sportskiObjekat: { naziv: 'Dvorana' },
      },
    ]);

    const termini = await getAllTermsService(5);


    expect(mockPrisma.rezervacija.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'POTVRDJENA' }),
      })
    );

    expect(mockPrisma.terminObjekta.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          vrijemePocetka: expect.objectContaining({ gt: expect.any(Date) }),
          OR: expect.any(Array),
        }),
      })
    );
    expect(termini).toHaveLength(1);
    expect(termini[0].terminId).toBe(1);
  });

  test('getAllTermsService uključuje korisnikove zauzete termine', async () => {
    const now = new Date();
    const buduciTermin = new Date(now.getTime() + 3600000);


    mockPrisma.rezervacija.findMany.mockResolvedValue([{ terminId: 10 }]);

    mockPrisma.terminObjekta.findMany.mockResolvedValue([
      {
        terminId: 10,
        status: 'ZAUZET',
        vrijemePocetka: buduciTermin,
        sportskiObjekat: { naziv: 'Bazen' },
      },
    ]);

    const termini = await getAllTermsService(7);


    expect(mockPrisma.terminObjekta.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ status: 'SLOBODAN' }),
            expect.objectContaining({ terminId: { in: [10] } }),
          ]),
        }),
      })
    );
    expect(termini[0].terminId).toBe(10);
  });



  test('createIndividualReservationService kreira potvrđenu rezervaciju ako je igrač pouzdan', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 52,
      tipTermina: 'INDIVIDUALNI',
      status: 'SLOBODAN',
      vrijemePocetka: new Date(Date.now() + 3600000),
      sportskiObjekat: { objekatId: 1, naziv: 'Dvorana' },
    });
    mockPrisma.zahtjevZaRezervaciju.findFirst.mockResolvedValue(null);


    mockPrisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        zahtjevZaRezervaciju: {
          create: jest.fn().mockResolvedValue({ zahtjevId: 1, terminId: 52, status: 'ODOBRENO' }),
        },
        rezervacija: {
          create: jest.fn().mockResolvedValue({ terminId: 52, status: 'POTVRDJENA' }),
        },
        terminObjekta: {
          update: jest.fn().mockResolvedValue({}),
        },
      };
      return callback(tx);
    });

    const rezultat = await createIndividualReservationService('52', { korisnikId: 7 }, true);

    expect(mockPrisma.terminObjekta.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { terminId: 52 } })
    );
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(rezultat.tip).toBe('REZERVISANO');
    expect(rezultat.termin.terminId).toBe(52);
  });

  test('createIndividualReservationService kreira zahtjev ako igrač nije pouzdan', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 60,
      tipTermina: 'INDIVIDUALNI',
      status: 'SLOBODAN',
      vrijemePocetka: new Date(Date.now() + 3600000),
      sportskiObjekat: { objekatId: 2, naziv: 'Teren' },
    });
    mockPrisma.zahtjevZaRezervaciju.findFirst.mockResolvedValue(null);
    mockPrisma.zahtjevZaRezervaciju.create.mockResolvedValue({
      zahtjevId: 5,
      terminId: 60,
      korisnikId: 9,
      status: 'CEKANJE',
    });

    const rezultat = await createIndividualReservationService('60', { korisnikId: 9 }, false);


    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.zahtjevZaRezervaciju.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          terminId: 60,
          korisnikId: 9,
          status: 'CEKANJE',
        }),
      })
    );
    expect(rezultat.tip).toBe('NA_CEKANJU');
  });

  test('createIndividualReservationService baca grešku kada termin ne postoji', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue(null);

    await expect(
      createIndividualReservationService('99', { korisnikId: 1 }, true)
    ).rejects.toThrow('Termin nije dostupan za rezervaciju.');
  });

  test('createIndividualReservationService baca grešku za neispravan terminId', async () => {
    await expect(
      createIndividualReservationService('abc', { korisnikId: 1 }, true)
    ).rejects.toThrow('terminId mora biti pozitivan cijeli broj.');
  });

  test('createIndividualReservationService baca grešku za duplu rezervaciju', async () => {
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 70,
      status: 'SLOBODAN',
      vrijemePocetka: new Date(Date.now() + 3600000),
      sportskiObjekat: { objekatId: 3, naziv: 'Sala' },
    });
    mockPrisma.zahtjevZaRezervaciju.findFirst.mockResolvedValue({
      zahtjevId: 3,
      status: 'CEKANJE',
    });

    await expect(
      createIndividualReservationService('70', { korisnikId: 5 }, true)
    ).rejects.toThrow('Već imate aktivan zahtjev ili rezervaciju za ovaj termin.');
  });



  test('cancelIndividualReservationService uspješno otkazuje rezervaciju', async () => {
    mockPrisma.rezervacija.findFirst.mockResolvedValue({
      rezervacijaId: 20,
      zahtjevId: 10,
      terminId: 80,
      status: 'POTVRDJENA',
      zahtjev: { korisnikId: 4 },
    });
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 80,
      vrijemePocetka: new Date(Date.now() + 7200000),
    });


    mockPrisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        rezervacija: { update: jest.fn().mockResolvedValue({}) },
        zahtjevZaRezervaciju: { update: jest.fn().mockResolvedValue({}) },
        terminObjekta: { update: jest.fn().mockResolvedValue({}) },
      };
      return callback(tx);
    });

    const rezultat = await cancelIndividualReservationService('80', 4);

    expect(mockPrisma.rezervacija.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          terminId: 80,
          status: 'POTVRDJENA',
        }),
      })
    );
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(rezultat).toEqual({ poruka: 'Rezervacija je uspješno otkazana.' });
  });

  test('cancelIndividualReservationService baca grešku kada rezervacija ne postoji', async () => {
    mockPrisma.rezervacija.findFirst.mockResolvedValue(null);

    await expect(
      cancelIndividualReservationService('80', 4)
    ).rejects.toThrow('Nemate aktivnu rezervaciju za ovaj termin.');
  });

  test('cancelIndividualReservationService baca grešku za termin koji je već prošao', async () => {
    mockPrisma.rezervacija.findFirst.mockResolvedValue({
      rezervacijaId: 21,
      zahtjevId: 11,
      terminId: 85,
      status: 'POTVRDJENA',
      zahtjev: { korisnikId: 4 },
    });
    mockPrisma.terminObjekta.findUnique.mockResolvedValue({
      terminId: 85,
      vrijemePocetka: new Date(Date.now() - 3600000),
    });

    await expect(
      cancelIndividualReservationService('85', 4)
    ).rejects.toThrow('Nije moguće otkazati termin koji je već počeo ili prošao.');
  });
});