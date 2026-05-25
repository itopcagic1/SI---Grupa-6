const mockReservationQueue = {
  add: jest.fn(),
};

const mockReservationService = {
  getAllTermsService: jest.fn(),
  createIndividualReservationService: jest.fn(),
  cancelIndividualReservationService: jest.fn(),
  getMojeRezervacijeService: jest.fn(),
};

jest.mock('../../../src/services/rezervacijaService', () => mockReservationService);

jest.mock('../../../src/services/grupneRezervacijeService', () => ({
  kreirajGrupniTreningService: jest.fn(),
  prijaviSeNaGrupniTreningService: jest.fn(),
  getTrenerGrupniTreninziService: jest.fn(),
  getGrupniTreninziService: jest.fn(),
  otkaziGrupniTreningService: jest.fn(),
  odjaviSeSaGrupnogTreningaService: jest.fn(),
  getTrenerNotifikacijeService: jest.fn(),
}));

jest.mock('../../../src/queues/reservationQueue', () => ({
  reservationQueue: mockReservationQueue,
}));

jest.mock('../../../src/utils/timeoutCalculator', () => ({
  calculateTimeoutMilliseconds: jest.fn(() => 60 * 60 * 1000),
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    rezervacija: { count: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    terminObjekta: { findUnique: jest.fn() },
    korisnik: { update: jest.fn(), findUnique: jest.fn() },
    grupniTrening: { findUnique: jest.fn() },
  })),
}));

const { calculateTimeoutMilliseconds } = require('../../../src/utils/timeoutCalculator');
const { kreirajIndividualnuRezervaciju } = require('../../../src/controllers/rezervacijaController');

function mockRes() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
}

describe('Developer 3 - BullMQ delayed job za pending rezervacije', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('dodaje delayed job od 60 minuta kada se kreira NA_CEKANJU zahtjev', async () => {
    mockReservationService.createIndividualReservationService.mockResolvedValue({
      tip: 'NA_CEKANJU',
      reservationId: 77,
      termStartTime: '2026-05-25T20:00:00.000Z',
    });

    const req = {
      params: { id: '33' },
      user: { korisnikId: 12, statusPouzdanosti: 'NEPOUZDAN' },
    };
    const res = mockRes();

    await kreirajIndividualnuRezervaciju(req, res);

    expect(mockReservationService.createIndividualReservationService).toHaveBeenCalledWith(
      '33',
      req.user,
      false
    );
    expect(calculateTimeoutMilliseconds).toHaveBeenCalledWith('2026-05-25T20:00:00.000Z');
    expect(mockReservationQueue.add).toHaveBeenCalledWith(
      'check-reservation-timeout',
      { reservationId: 77, termId: '33' },
      { delay: 60 * 60 * 1000 }
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'NA_CEKANJU',
      })
    );
  });
});
