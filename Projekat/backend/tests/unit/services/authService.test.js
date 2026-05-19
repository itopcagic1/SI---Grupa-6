const mockPrisma = {
  korisnik: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../../src/services/emailService', () => ({
  posaljiResetEmail: jest.fn()
}));

const authService = require('../../../src/services/authService');

describe('Auth Service - Unit Testovi (Maida)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserProfile treba vratiti korisnika bez lozinke', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 1,
      punoIme: 'Test Korisnik',
      email: 'test@example.com',
      uloga: 'NAVIJAC',
      statusPouzdanosti: 'AKTIVAN',
      clanstvaUTimovima: []
    });

    const profil = await authService.getUserProfile(1);

    expect(profil).toHaveProperty('punoIme');
    expect(profil).not.toHaveProperty('lozinkaHash');
    expect(Array.isArray(profil.clanstvaUTimovima)).toBe(true);
    expect(mockPrisma.korisnik.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { korisnikId: 1 }
    }));
  });

  test('changePassword treba baciti Error ako se lozinke ne podudaraju', async () => {
    const podaci = {
      trenutnaLozinka: 'Stara123!',
      novaLozinka: 'Nova123!',
      potvrda: 'Pogresna123!'
    };

    await expect(authService.changePassword(1, podaci))
      .rejects.toThrow('Nova lozinka i potvrda se ne poklapaju.');
  });
});
