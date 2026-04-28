const rateLimit = require('express-rate-limit');

// potrebna je zastita od brute-force napada
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: { greska: "PREVISE_ZAHTJEVA", poruka: "Pokušajte ponovo kasnije." }
});

// validacijski middleware 
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      greska: "GRESKA_VALIDACIJE", 
      poruka: result.error.errors[0].message 
    });
  }
  next();
};

module.exports = { authLimiter, validate };