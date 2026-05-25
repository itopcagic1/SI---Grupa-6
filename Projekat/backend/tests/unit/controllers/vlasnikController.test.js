const mockService = {
  dohvatiSveRezervacijeService: jest.fn(),
  obradiZahtjevVerifikacijeService: jest.fn(),
};

jest.mock('../../../src/services/vlasnikService', () => mockService);

const {
  dohvatiSveRezervacije,
  obradiZahtjevVerifikacije,
} = require('../../../src/controllers/vlasnikController');

function mockRes() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
}

describe('Vlasnik Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('dohvatiSveRezervacije vraća rezultat servisa', async () => {
    const req = { user: { korisnikId: 1, uloga: 'VLASNIK' }, query: {} };
    const res = mockRes();
    const rezultat = { data: [], analytics: { zahtjeviNaCekanju: 0 } };

    mockService.dohvatiSveRezervacijeService.mockResolvedValue(rezultat);

    await dohvatiSveRezervacije(req, res);

    expect(mockService.dohvatiSveRezervacijeService).toHaveBeenCalledWith(req.user, req.query);
    expect(res.json).toHaveBeenCalledWith(rezultat);
  });

  test('obradiZahtjevVerifikacije prosljeđuje id, akciju i razlog servisu', async () => {
    const req = {
      user: { korisnikId: 1, uloga: 'VLASNIK' },
      params: { id: '10' },
      body: { akcija: 'ODBIJ', razlogOdbijanja: 'Termin nije dostupan.' },
    };
    const res = mockRes();
    const rezultat = { message: 'Zahtjev je odbijen.', zahtjev: { zahtjevId: 10 } };

    mockService.obradiZahtjevVerifikacijeService.mockResolvedValue(rezultat);

    await obradiZahtjevVerifikacije(req, res);

    expect(mockService.obradiZahtjevVerifikacijeService).toHaveBeenCalledWith(
      req.user,
      '10',
      req.body
    );
    expect(res.json).toHaveBeenCalledWith(rezultat);
  });

  test('obradiZahtjevVerifikacije vraća status i grešku iz servisa', async () => {
    const req = {
      user: { korisnikId: 1, uloga: 'VLASNIK' },
      params: { id: '10' },
      body: { akcija: 'ODBIJ', razlogOdbijanja: 'kratko' },
    };
    const res = mockRes();
    const error = new Error('Razlog odbijanja mora imati najmanje 10 karaktera.');
    error.status = 400;
    error.code = 'NEVALIDAN_RAZLOG_ODBIJANJA';

    mockService.obradiZahtjevVerifikacijeService.mockRejectedValue(error);

    await obradiZahtjevVerifikacije(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      greska: 'NEVALIDAN_RAZLOG_ODBIJANJA',
      poruka: 'Razlog odbijanja mora imati najmanje 10 karaktera.',
    });
  });
});
