const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    greska: 'PREVISE_ZAHTJEVA',
    poruka: 'Previše pokušaja. Pokušajte ponovo kasnije.'
  }
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      greska: 'GRESKA_VALIDACIJE',
      poruka: result.error.errors[0]?.message || 'Neispravni podaci'
    });
  }

  req.body = result.data;
  next();
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      greska: 'NEOVLASTEN',
      poruka: 'Token nije pronadjen ili je nevaljan'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      greska: 'TOKEN_ISTEKAO',
      poruka: 'Vas token je istekao. Molimo prijavite se ponovo'
    });
  }
};

module.exports = {
  authLimiter,
  validate,
  authenticateToken
};