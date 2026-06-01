const prisma = require('../config/db');

const setOmiljeniTimService = async (korisnikId, timId) => {
  const parsedKorisnikId = parseInt(korisnikId);
  const parsedTimId = parseInt(timId);

  // Check if it already exists
  const existing = await prisma.omiljeniTim.findUnique({
    where: {
      korisnikId_timId: {
        korisnikId: parsedKorisnikId,
        timId: parsedTimId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  // Create
  return await prisma.omiljeniTim.create({
    data: {
      korisnikId: parsedKorisnikId,
      timId: parsedTimId,
    },
  });
};

const removeOmiljeniTimService = async (korisnikId, timId) => {
  const parsedKorisnikId = parseInt(korisnikId);
  const parsedTimId = parseInt(timId);

  const existing = await prisma.omiljeniTim.findUnique({
    where: {
      korisnikId_timId: {
        korisnikId: parsedKorisnikId,
        timId: parsedTimId,
      },
    },
  });

  if (!existing) {
    return null;
  }

  return await prisma.omiljeniTim.delete({
    where: {
      korisnikId_timId: {
        korisnikId: parsedKorisnikId,
        timId: parsedTimId,
      },
    },
  });
};

const getOmiljeniTimoviService = async (korisnikId) => {
  const parsedKorisnikId = parseInt(korisnikId);

  return await prisma.omiljeniTim.findMany({
    where: {
      korisnikId: parsedKorisnikId,
    },
    include: {
      tim: {
        include: {
          sport: true,
        },
      },
    },
  });
};

module.exports = {
  setOmiljeniTimService,
  removeOmiljeniTimService,
  getOmiljeniTimoviService,
};
