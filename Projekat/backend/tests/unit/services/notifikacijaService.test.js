// TAČNA PUTANJA: Izlazi 3 nivoa unazad i ulazi u src/services i src/config
const notifikacijaService = require('../../../src/services/notifikacijaService');
const prisma = require('../../../src/config/db');

// Ispravna putanja za mock:
jest.mock('../../../src/config/db', () => ({
  notifikacija: {
    findMany: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
  },
}));

describe('Notifikacija Service - Unit Testovi', () => {
  const MOCK_USER_ID = 10;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getNotifikacijeService - treba vratiti sve notifikacije sortirane od najnovije', async () => {
    const mockLista = [
      { notifikacijaId: 1, sadrzajPoruke: 'Prva', vrijemeSlanja: new Date() },
      { notifikacijaId: 2, sadrzajPoruke: 'Druga', vrijemeSlanja: new Date() },
    ];
    
    prisma.notifikacija.findMany.mockResolvedValue(mockLista);

    const rezultat = await notifikacijaService.getNotifikacijeService(MOCK_USER_ID);

    expect(prisma.notifikacija.findMany).toHaveBeenCalledWith({
      where: { korisnikId: MOCK_USER_ID },
      orderBy: { vrijemeSlanja: 'desc' },
    });
    expect(rezultat).toEqual(mockLista);
  });

  it('getNeprocitaneCountService - treba vratiti broj nepročitanih notifikacija', async () => {
    prisma.notifikacija.count.mockResolvedValue(3);

    const rezultat = await notifikacijaService.getNeprocitaneCountService('10');

    expect(prisma.notifikacija.count).toHaveBeenCalledWith({
      where: {
        korisnikId: MOCK_USER_ID,
        status: 'NEPROCITANO',
      },
    });
    expect(rezultat).toBe(3);
  });

  it('oznaciKaoProcitanoService - treba ažurirati točno određenu notifikaciju', async () => {
    prisma.notifikacija.updateMany.mockResolvedValue({ count: 1 });

    await notifikacijaService.oznaciKaoProcitanoService('55', MOCK_USER_ID);

    expect(prisma.notifikacija.updateMany).toHaveBeenCalledWith({
      where: {
        notifikacijaId: 55,
        korisnikId: MOCK_USER_ID,
      },
      data: {
        status: 'PROCITANO',
        vrijemeCitanja: expect.any(Date),
      },
    });
  });
});