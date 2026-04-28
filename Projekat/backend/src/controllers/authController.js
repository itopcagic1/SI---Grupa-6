const authService = require('../services/authService');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function register(req, res) {
  try {
    const result = await authService.registerUser(req.body);

    return res.status(201).json({
      korisnik: {
        korisnikId: result.korisnikId,
        email: result.email,
        punoIme: result.punoIme,
        trenutnaUloga: result.uloga,
        trazenaUloga: result.trazenaUloga,
        statusUloge: result.statusUloge,
        datumZahtjeva: result.datumZahtjeva,
      },
      poruka_uloge: {
        trenutna: result.uloga,
        trazena: result.trazenaUloga,
        status: result.statusUloge,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_REGISTRACIJE',
      poruka: error.message || 'Greska pri registraciji korisnika',
      ...(error.dozvoljene && { dozvoljene: error.dozvoljene }),
    });
  }
}

async function login(req, res) {
  try {
    const { korisnik, accessToken, refreshToken } = await authService.loginUser(req.body);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    return res.status(200).json({
      poruka: 'Uspjesna prijava',
      korisnik: {
        korisnikId: korisnik.korisnikId,
        email: korisnik.email,
        punoIme: korisnik.punoIme,
        trenutnaUloga: korisnik.uloga,
        trazenaUloga: korisnik.trazenaUloga,
        statusUloge: korisnik.statusUloge,
      },
      access_token: accessToken,
      isticeZa: '15m',
      poruka_pending:
        korisnik.statusUloge === 'PENDING'
          ? `Trebam odobrenje administratora za ulogu ${korisnik.trazenaUloga}`
          : null,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_PRIJAVE',
      poruka: error.message || 'Greska pri prijavi korisnika',
    });
  }
}

async function logout(req, res) {
  try {
    const korisnikId = req.user.korisnikId;

    await authService.logoutUser(korisnikId);

    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({
      poruka: 'Uspjesno ste se odjavili',
      korisnikId,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_ODJAVE',
      poruka: error.message || 'Greska pri odjavi korisnika',
    });
  }
}

async function profile(req, res) {
  try {
    const korisnik = await authService.getUserProfile(req.user.korisnikId);

    return res.status(200).json({
      uspjeh: true,
      korisnik,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      greska: error.code || 'GRESKA_PROFILA',
      poruka: error.message || 'Greska pri dohvatanju profila',
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  profile,
};