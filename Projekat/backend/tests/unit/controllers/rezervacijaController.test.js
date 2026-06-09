const mockService = {
  getAllTermsService: jest.fn(),
  createIndividualReservationService: jest.fn(),
  cancelIndividualReservationService: jest.fn(),
};

jest.mock('../../../src/services/rezervacijaService', () => mockService);

const mockPrisma = {
  korisnik: {
    findUnique: jest.fn().mockImplementation((args) => {
      const id = args.where.korisnikId;
      if (id === 12) {
        return Promise.resolve({ statusPouzdanosti: 'NEPOUZDAN', brojPreksrenihRezervacija: 3 });
      }
      return Promise.resolve({ statusPouzdanosti: 'POUZDAN', brojPreksrenihRezervacija: 0 });
    }),
    update: jest.fn().mockResolvedValue({}),
  },
  terminObjekta: {
    findUnique: jest.fn().mockResolvedValue({
      terminId: 10,
      vrijemePocetka: new Date(Date.now() + 48 * 3600000),
      vrijemeZavrsetka: new Date(Date.now() + 49 * 3600000),
      status: 'SLOBODAN',
    }),
    update: jest.fn().mockResolvedValue({}),
  },
  grupniTrening: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const {
  getFreeIndividualTerms,
  kreirajIndividualnuRezervaciju,
  otkaziIndividualnuRezervaciju,
} = require('../../../src/controllers/rezervacijaController');

describe('Rezervacija Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  it('getFreeIndividualTerms vraća termine', async () => {
    mockService.getAllTermsService.mockResolvedValue([{ terminId: 1 }]);

    const req = { user: { korisnikId: 5 } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getFreeIndividualTerms(req, res);


    expect(mockService.getAllTermsService).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith({ termini: [{ terminId: 1 }] });
  });

  it('getFreeIndividualTerms vraća 500 pri grešci servisa', async () => {
    mockService.getAllTermsService.mockRejectedValue(new Error('DB greška'));

    const req = { user: { korisnikId: 5 } };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await getFreeIndividualTerms(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'SERVER_ERROR' })
    );
  });


  it('kreirajIndividualnuRezervaciju vraća potvrdu kada je rezervacija uspješna', async () => {
    mockService.createIndividualReservationService.mockResolvedValue({ tip: 'REZERVISANO' });

    const req = {
      params: { id: '22' },
      user: { korisnikId: 11, statusPouzdanosti: 'POUZDAN' },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await kreirajIndividualnuRezervaciju(req, res);

    expect(mockService.createIndividualReservationService).toHaveBeenCalledWith(
      22,
      { id: 11, korisnikId: 11, statusPouzdanosti: 'POUZDAN' },
      true 
    );
    expect(res.json).toHaveBeenCalledWith({
      poruka: 'Termin je uspješno rezervisan.',
      status: 'POTVRDJENA',
    });
  });

  it('kreirajIndividualnuRezervaciju vraća NA_CEKANJU za nepouzdanog igrača', async () => {
    mockService.createIndividualReservationService.mockResolvedValue({ tip: 'NA_CEKANJU' });

    const req = {
      params: { id: '33' },
      user: { korisnikId: 12, statusPouzdanosti: 'NEPOUZDAN' },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await kreirajIndividualnuRezervaciju(req, res);

    expect(mockService.createIndividualReservationService).toHaveBeenCalledWith(
      33,
      { id: 12, korisnikId: 12, statusPouzdanosti: 'NEPOUZDAN' },
      false 
    );
    expect(res.json).toHaveBeenCalledWith({
      poruka: 'Vaš zahtjev je poslan na listu čekanja zbog pravila pouzdanosti računa (3 ili više kaznena profila). Vlasnik objekta mora ručno odobriti termin.',
      status: 'NA_CEKANJU',
      zahtjevId: undefined,
      terminId: 33,
    });
  });

  it('kreirajIndividualnuRezervaciju vraća grešku pri neuspjehu servisa', async () => {
    const error = new Error('Termin nije dostupan za rezervaciju.');
    error.status = 404;
    error.code = 'TERMIN_NIJE_DOSTUPAN';
    mockService.createIndividualReservationService.mockRejectedValue(error);

    const req = {
      params: { id: '99' },
      user: { korisnikId: 1, statusPouzdanosti: 'POUZDAN' },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await kreirajIndividualnuRezervaciju(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        greska: 'TERMIN_NIJE_DOSTUPAN',
        poruka: 'Termin nije dostupan za rezervaciju.',
      })
    );
  });



  it('otkaziIndividualnuRezervaciju vraća potvrdu otkazivanja', async () => {
    mockService.cancelIndividualReservationService.mockResolvedValue({
      poruka: 'Rezervacija je uspješno otkazana.',
    });

    const req = {
      params: { id: '55' },
      user: { korisnikId: 7 },
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    await otkaziIndividualnuRezervaciju(req, res);

    expect(mockService.cancelIndividualReservationService).toHaveBeenCalledWith(55, 7);
    expect(res.json).toHaveBeenCalledWith({
      poruka: 'Uspješno otkazano na vrijeme. Termin je ponovo slobodan.',
      brojPrekrsaja: 0,
      maxDozvoljeno: 3,
    });
  });
});