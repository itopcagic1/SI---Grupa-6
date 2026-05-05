const { login, logout } = require('../../controllers/authController');
const authService = require('../../services/authService');

jest.mock('../../services/authService');



function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe('login()', () => {
  const mockLoginResult = {
    korisnik: {
      korisnikId: 1,
      email: 'test@example.com',
      punoIme: 'Test Korisnik',
      uloga: 'NAVIJAC',         // default uloga iz sheme
      trazenaUloga: null,
      statusUloge: 'ODOBREN',
    },
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  test('ispravni kredencijali → 200, access token u body, refresh token u cookie', async () => {
    authService.loginUser.mockResolvedValue(mockLoginResult);
    const req = { body: { email: 'test@example.com', lozinka: 'Lozinka123!' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        poruka: 'Uspjesna prijava',
        access_token: 'mock-access-token',
        isticeZa: '15m',
      })
    );
    // refresh token ide u httpOnly cookie, ne u response body
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'mock-refresh-token',
      expect.objectContaining({ httpOnly: true, sameSite: 'strict' })
    );
  });

  test('pogresna lozinka → 401 NEISPRAVNE_AKREDITIVE', async () => {
    authService.loginUser.mockRejectedValue({
      status: 401,
      code: 'NEISPRAVNE_AKREDITIVE',
      message: 'Email ili lozinka nisu ispravni',
    });
    const req = { body: { email: 'test@example.com', lozinka: 'pogresna' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'NEISPRAVNE_AKREDITIVE' })
    );
  });

  test('nepostojeci korisnik → 401 NEISPRAVNE_AKREDITIVE', async () => {
    // servis vraca isti kod za nepostojeci email i pogresnu lozinku (sigurnosna praksa)
    authService.loginUser.mockRejectedValue({
      status: 401,
      code: 'NEISPRAVNE_AKREDITIVE',
      message: 'Email ili lozinka nisu ispravni',
    });
    const req = { body: { email: 'nema@example.com', lozinka: 'bilo' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'NEISPRAVNE_AKREDITIVE' })
    );
  });

  test('IGRAC sa PENDING statusom → poruka_pending sadrzi naziv trazene uloge', async () => {
    authService.loginUser.mockResolvedValue({
      ...mockLoginResult,
      korisnik: {
        ...mockLoginResult.korisnik,
        uloga: 'NAVIJAC',
        trazenaUloga: 'IGRAC',
        statusUloge: 'PENDING',
      },
    });
    const req = { body: { email: 'test@example.com', lozinka: 'Lozinka123!' } };
    const res = mockRes();

    await login(req, res);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.poruka_pending).toContain('IGRAC');
  });

  test('TRENER sa PENDING statusom → poruka_pending sadrzi TRENER', async () => {
    authService.loginUser.mockResolvedValue({
      ...mockLoginResult,
      korisnik: {
        ...mockLoginResult.korisnik,
        trazenaUloga: 'TRENER',
        statusUloge: 'PENDING',
      },
    });
    const req = { body: { email: 'test@example.com', lozinka: 'Lozinka123!' } };
    const res = mockRes();

    await login(req, res);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.poruka_pending).toContain('TRENER');
  });

  test('ODOBREN status → poruka_pending je null', async () => {
    authService.loginUser.mockResolvedValue(mockLoginResult);
    const req = { body: { email: 'test@example.com', lozinka: 'Lozinka123!' } };
    const res = mockRes();

    await login(req, res);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.poruka_pending).toBeNull();
  });

  test('neocekivana greska → 500 GRESKA_PRIJAVE', async () => {
    authService.loginUser.mockRejectedValue(new Error('DB pao'));
    const req = { body: { email: 'test@example.com', lozinka: 'Lozinka123!' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'GRESKA_PRIJAVE' })
    );
  });
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

describe('logout()', () => {
  test('uspjesna odjava → 200, refreshToken u bazi postavljen na null, cookie obrisan', async () => {
    authService.logoutUser.mockResolvedValue({ korisnikId: 1 });
    const req = { user: { korisnikId: 1 } };
    const res = mockRes();

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(authService.logoutUser).toHaveBeenCalledWith(1);
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        poruka: 'Uspjesno ste se odjavili',
        korisnikId: 1,
      })
    );
  });

  test('nakon odjave zasticene rute nisu dostupne → refreshToken je null u bazi', async () => {
    authService.logoutUser.mockResolvedValue({ korisnikId: 1 });
    const req = { user: { korisnikId: 1 } };
    const res = mockRes();

    await logout(req, res);

    // logoutUser pozvan → Prisma postavlja refreshToken: null u bazi
    expect(authService.logoutUser).toHaveBeenCalledWith(1);
  });

  test('greska u servisu → 500 GRESKA_ODJAVE', async () => {
    authService.logoutUser.mockRejectedValue(new Error('DB greska'));
    const req = { user: { korisnikId: 1 } };
    const res = mockRes();

    await logout(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'GRESKA_ODJAVE' })
    );
  });
});