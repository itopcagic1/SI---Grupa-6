const prisma = require('../config/db');

const reliabilityMiddleware = async (req, res, next) => {
  const korisnikId = req.user?.korisnikId;
  if (!korisnikId) {
    return res.status(401).json({
      greska: 'NEOVLASTEN',
      poruka: 'Token nije pronađen ili je nevažeći.',
    });
  }

  const korisnik = await prisma.korisnik.findUnique({
    where: { korisnikId },
    select: { brojPreksrenihRezervacija: true, statusPouzdanosti: true },
  });

  if (!korisnik) {
    return res.status(404).json({
      greska: 'KORISNIK_NIJE_PRONADJEN',
      poruka: 'Korisnik nije pronađen.',
    });
  }

  req.user.isTrusted = korisnik.brojPreksrenihRezervacija === 0;
  req.user.statusPouzdanosti = korisnik.statusPouzdanosti;
  next();
};

module.exports = { reliabilityMiddleware };
