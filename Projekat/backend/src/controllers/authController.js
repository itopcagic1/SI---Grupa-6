const { registerSchema, loginSchema } = require('../utils/validators');
const { registerUser, loginUser } = require('../services/authService');

function getFirstValidationError(error) {
  return error.errors[0]?.message || 'Neispravan unos';
}

async function register(req, res) {
  const { punoIme, email, lozinka, trazenaUloga, documents } = req.body;
  // prvo rucno provjerim format
  if (!email || !lozinka || !punoIme) {
    return res.status(400).json({ 
      greska: "GRESKA_VALIDACIJE", 
      poruka: "Email, lozinka i puno ime su obavezni" 
    });
  }

  //neka sada zod provjeri format
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      greska: "GRESKA_VALIDACIJE", 
      poruka: getFirstValidationError(parseResult.error) 
    });
  }

  try {
    const result = await registerUser({ ime: punoIme, email, lozinka, trazenaUloga, documents });
    
    return res.status(201).json({
      korisnik: {
        korisnikId: result.korisnikId,
        email: result.email,
        punoIme: result.punoIme,
        trenutnaUloga: result.uloga, 
        trazenaUloga: result.trazenaUloga,
        statusUloge: result.statusUloge,
        datumZahtjeva: result.datumZahtjeva
      },
      poruka_uloge: {
        trenutna: result.uloga,
        trazena: result.trazenaUloga,
        status: result.statusUloge
      }
    });
  } catch (error) {
    const status = error?.status || 500;

    if (error.code === "NEVALJANA_ULOGA") {
      return res.status(status).json({
        greska: error.code,
        poruka: error.message,
        dozvoljene: ["NAVIJAC", "IGRAC", "TRENER", "VLASNIK"] 
      });
    }

    return res.status(status).json({ 
      greska: error.code || "GREŠKA_REGISTRACIJE", 
      poruka: error.message 
    });
  }
}

async function login(req, res) {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: getFirstValidationError(parseResult.error) });
  }

  const { email, lozinka } = parseResult.data;

  try {
    const user = await loginUser({ email, lozinka });
    return res.status(200).json({ user });
  } catch (error) {
    const status = error?.status || 401;
    const message = error?.message || 'Neispravni podaci za prijavu';
    return res.status(status).json({ error: message });
  }
}

module.exports = {
  register,
  login,
};
