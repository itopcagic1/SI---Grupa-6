const { registerSchema, loginSchema } = require('../utils/validators');
const { registerUser, loginUser } = require('../services/authService');

function getFirstValidationError(error) {
  return error.errors[0]?.message || 'Neispravan unos';
}

async function register(req, res) {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: getFirstValidationError(parseResult.error) });
  }

  const { ime, email, password } = parseResult.data;

  try {
    const user = await registerUser({ ime, email, password });
    return res.status(201).json({ user });
  } catch (error) {
    const status = error?.status || 500;
    const message = error?.message || 'Internal server error';
    return res.status(status).json({ error: message });
  }
}

async function login(req, res) {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: getFirstValidationError(parseResult.error) });
  }

  const { email, password } = parseResult.data;

  try {
    const user = await loginUser({ email, password });
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
