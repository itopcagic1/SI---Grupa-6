const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 10,
  message: { 
    greska: "PREVISE_ZAHTJEVA", 
    poruka: "Pokušajte ponovo kasnije." 
  }
});


const validate = (schema) => (req, res, next) => {
  console.log("Request body:", req.body);
  const result = schema.safeParse(req.body);

  if (!result.success) {
    console.log("Zod greške:", JSON.stringify(result.error.errors, null, 2));
    return res.status(400).json({ 
      greska: "GRESKA_VALIDACIJE", 
      poruka: result.error.errors[0]?.message || "Neispravni podaci"
    });
  }

  req.body = result.data; // overwrite sa validiranim podacima
  next();
};


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      greska: "NEOVLASTEN",
      poruka: "Token nije pronadjen ili je nevaljan"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // kasnije koristimo userId
    next();
  } catch (err) {
    return res.status(403).json({
      greska: "TOKEN_ISTEKAO",
      poruka: "Vas token je istekao. Molimo prijavite se ponovo"
    });
  }
};

module.exports = { 
  authLimiter, 
  validate, 
  authenticateToken 
};