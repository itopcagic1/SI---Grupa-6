const mockService = {
  getAllTermsService: jest.fn(),
  createIndividualReservationService: jest.fn(),
  cancelIndividualReservationService: jest.fn(),
};

jest.mock('../../../src/services/rezervacijaService', () => mockService);

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
      '22',
      req.user,
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
      '33',
      req.user,
      false 
    );
    expect(res.json).toHaveBeenCalledWith({
      poruka: 'Vaš zahtjev je poslan na čekanje i biće obrađen od strane administratora.',
      status: 'NA_CEKANJU',
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

    expect(mockService.cancelIndividualReservationService).toHaveBeenCalledWith('55', 7);
    expect(res.json).toHaveBeenCalledWith({ poruka: 'Rezervacija je uspješno otkazana.' });
  });
});