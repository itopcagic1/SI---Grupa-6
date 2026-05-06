const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dohvatiSveSporte(req, res) {
  try {
    const sportovi = await prisma.sport.findMany({
      orderBy: { naziv: 'asc' }
    });
    return res.status(200).json({
      uspjeh: true,
      sportovi
    });
  } catch (error) {
    return res.status(500).json({
      greska: 'GRESKA_DOHVATANJA_SPORTOVA',
      poruka: 'Greška pri dohvatanju sportova'
    });
  }
}

module.exports = {
  dohvatiSveSporte
};
