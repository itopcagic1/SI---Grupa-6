const { register } = require('../../controllers/authController');
const authService = require('../../services/authService');
jest.mock('../../services/authService');


// ─── Helper ───────────────────────────────────────────────────────────────────

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ─── REGISTER ────────────────────────────────────────────────────────────────

describe('register()', () => {
  const mockKorisnik = {
    korisnikId: 1,
    email: 'test@example.com',
    punoIme: 'Test Korisnik',
    uloga: 'NAVIJAC',
    trazenaUloga: 'NAVIJAC',
    statusUloge: 'ODOBREN',
    datumZahtjeva: null,
  };

  test('uspjesna registracija kao NAVIJAC → 201, statusUloge ODOBREN', async () => {
    authService.registerUser.mockResolvedValue(mockKorisnik);
    const req = {
      body: {
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        lozinka: 'Lozinka123!',
        trazenaUloga: 'NAVIJAC',
      },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        korisnik: expect.objectContaining({
          email: 'test@example.com',
          trenutnaUloga: 'NAVIJAC',
          statusUloge: 'ODOBREN',
        }),
        poruka_uloge: expect.objectContaining({
          status: 'ODOBREN',
        }),
      })
    );
  });

  test('registracija kao IGRAC → 201, statusUloge PENDING', async () => {
    authService.registerUser.mockResolvedValue({
      ...mockKorisnik,
      trazenaUloga: 'IGRAC',
      statusUloge: 'PENDING',
      datumZahtjeva: new Date().toISOString(),
    });
    const req = {
      body: {
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        lozinka: 'Lozinka123!',
        trazenaUloga: 'IGRAC',
      },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        poruka_uloge: expect.objectContaining({
          trazena: 'IGRAC',
          status: 'PENDING',
        }),
      })
    );
  });

  test('registracija kao TRENER → 201, statusUloge PENDING', async () => {
    authService.registerUser.mockResolvedValue({
      ...mockKorisnik,
      trazenaUloga: 'TRENER',
      statusUloge: 'PENDING',
      datumZahtjeva: new Date().toISOString(),
    });
    const req = {
      body: {
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        lozinka: 'Lozinka123!',
        trazenaUloga: 'TRENER',
      },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        poruka_uloge: expect.objectContaining({
          trazena: 'TRENER',
          status: 'PENDING',
        }),
      })
    );
  });

  test('registracija kao VLASNIK → 201, statusUloge PENDING', async () => {
    authService.registerUser.mockResolvedValue({
      ...mockKorisnik,
      trazenaUloga: 'VLASNIK',
      statusUloge: 'PENDING',
      datumZahtjeva: new Date().toISOString(),
    });
    const req = {
      body: {
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        lozinka: 'Lozinka123!',
        trazenaUloga: 'VLASNIK',
      },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        poruka_uloge: expect.objectContaining({
          status: 'PENDING',
        }),
      })
    );
  });

  test('dupli email → 409 EMAIL_VEC_POSTOJI', async () => {
    authService.registerUser.mockRejectedValue({
      status: 409,
      code: 'EMAIL_VEC_POSTOJI',
      message: 'Korisnik sa ovim email-om je vec registriran',
    });
    const req = {
      body: {
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        lozinka: 'Lozinka123!',
        trazenaUloga: 'NAVIJAC',
      },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'EMAIL_VEC_POSTOJI' })
    );
  });

  test('nedozvoljena uloga → 400 NEDOZVOLJENA_ULOGA sa listom dozvoljenih', async () => {
    authService.registerUser.mockRejectedValue({
      status: 400,
      code: 'NEDOZVOLJENA_ULOGA',
      message: 'Uloga mora biti: NAVIJAC, IGRAC, TRENER ili VLASNIK',
      dozvoljene: ['NAVIJAC', 'IGRAC', 'TRENER', 'VLASNIK'],
    });
    const req = {
      body: {
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        lozinka: 'Lozinka123!',
        trazenaUloga: 'ADMINISTRATOR', // nije dozvoljena
      },
    };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        greska: 'NEDOZVOLJENA_ULOGA',
        dozvoljene: ['NAVIJAC', 'IGRAC', 'TRENER', 'VLASNIK'],
      })
    );
  });

  test('lozinka nije hashirana — hash !== plain text', async () => {
    authService.registerUser.mockResolvedValue(mockKorisnik);
    const req = {
      body: {
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        lozinka: 'Lozinka123!',
        trazenaUloga: 'NAVIJAC',
      },
    };
    const res = mockRes();

    await register(req, res);

    // response ne smije sadrzavati lozinku ni hash
    const jsonCall = res.json.mock.calls[0][0];
    expect(JSON.stringify(jsonCall)).not.toContain('Lozinka123!');
    expect(JSON.stringify(jsonCall)).not.toContain('lozinkaHash');
  });

  test('neocekivana greska → 500 GRESKA_REGISTRACIJE', async () => {
    authService.registerUser.mockRejectedValue(new Error('DB pao'));
    const req = { body: {} };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'GRESKA_REGISTRACIJE' })
    );
  });
});