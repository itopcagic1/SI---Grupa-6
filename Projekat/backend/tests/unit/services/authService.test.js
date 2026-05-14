const authService = require('../../../src/services/authService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Auth Service - Unit Testovi (Maida)', () => {
  
  // Test za dohvaćanje profila (US-07/08)
  test('getUserProfile treba vratiti korisnika bez lozinke', async () => {
    // Pretpostavljamo da ID 1 postoji u bazi
    const profil = await authService.getUserProfile(1);
    
    if (profil) {
      expect(profil).toHaveProperty('punoIme');
      expect(profil).not.toHaveProperty('lozinkaHash');
      expect(Array.isArray(profil.clanstvaUTimovima)).toBe(true);
    }
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