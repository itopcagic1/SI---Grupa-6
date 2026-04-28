const { registerSchema, loginSchema } = require('../utils/validators');
const { registerUser, loginUser } = require('../services/authService');

/**
 * Extract the first validation error message from Zod error
 */
function getFirstValidationError(error) {
  return error.errors[0]?.message || 'Neispravan unos';
}

/**
 * POST /register
 * Register a new user with validation
 * Request body: { ime, email, password }
 */
async function register(req, res) {
  try {
    // Validate input
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: getFirstValidationError(parseResult.error) 
      });
    }

    const { ime, email, password } = parseResult.data;

    // Call service to register user
    const user = await registerUser({ ime, email, password });
    
    return res.status(201).json({ 
      message: 'Korisnik uspješno registriran',
      user 
    });
  } catch (error) {
    const status = error?.status || 500;
    const message = error?.message || 'Greška pri registraciji';
    return res.status(status).json({ error: message });
  }
}

/**
 * POST /login
 * Login user and return user data (without password)
 * Request body: { email, password }
 */
async function login(req, res) {
  try {
    // Validate input
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: getFirstValidationError(parseResult.error) 
      });
    }

    const { email, password } = parseResult.data;

    // Call service to login user
    const user = await loginUser({ email, password });
    
    return res.status(200).json({ 
      message: 'Uspješna prijava',
      user 
    });
  } catch (error) {
    const status = error?.status || 500;
    const message = error?.message || 'Greška pri prijavi';
    return res.status(status).json({ error: message });
  }
}

module.exports = {
  register,
  login,
};
