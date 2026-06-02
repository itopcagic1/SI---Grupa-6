const prisma = require('../config/db');

exports.getNotifikacijeService = async (korisnikId) => {
  const parsedId = parseInt(korisnikId, 10);
  return await prisma.notifikacija.findMany({
    where: { korisnikId: parsedId },
    orderBy: { vrijemeSlanja: 'desc' },
  });
};

exports.getNeprocitaneCountService = async (korisnikId) => {
  const parsedId = parseInt(korisnikId, 10);
  return await prisma.notifikacija.count({
    where: {
      korisnikId: parsedId,
      status: 'NEPROCITANO'
    }
  });
};

exports.oznaciKaoProcitanoService = async (notifikacijaId, korisnikId) => {
  const parsedNotifId = parseInt(notifikacijaId, 10);
  const parsedKorisnikId = parseInt(korisnikId, 10);

  return await prisma.notifikacija.updateMany({
    where: {
      notifikacijaId: parsedNotifId,
      korisnikId: parsedKorisnikId,
    },
    data: {
      status: 'PROCITANO',
      vrijemeCitanja: new Date(),
    },
  });
};

exports.oznaciSveKaoProcitanoService = async (korisnikId) => {
  const parsedId = parseInt(korisnikId, 10);
  return await prisma.notifikacija.updateMany({
    where: {
      korisnikId: parsedId,
      status: 'NEPROCITANO',
    },
    data: {
      status: 'PROCITANO',
      vrijemeCitanja: new Date(),
    },
  });
};

exports.kreirajNotifikacijuService = async (korisnikId, tipNotifikacije, sadrzajPoruke) => {
  return await prisma.notifikacija.create({
    data: {
      korisnikId: parseInt(korisnikId, 10),
      tipNotifikacije,
      sadrzajPoruke,
      status: 'NEPROCITANO',
      vrijemeSlanja: new Date(),
    },
  });
};