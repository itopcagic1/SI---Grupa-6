const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createFacilityService = async (data, ownerId) => {
  return await prisma.sportskiObjekat.create({
    data: {
      vlasnikId: parseInt(ownerId), // Poveznica sa modelom Korisnik
      naziv: data.naziv,
      adresa: data.adresa || null,
      opis: data.opis || null,
      kapacitet: data.kapacitet ? parseInt(data.kapacitet) : null,
      status: data.status || "AKTIVAN" // Podrazumijevano aktivan pri kreiranju
    }
  });
};

const getAllFacilitiesService = async (filters, ownerId) => {
  const searchStatus = filters.status || "AKTIVAN";

  return await prisma.sportskiObjekat.findMany({
    where: {
      vlasnikId: parseInt(ownerId), 
      status: searchStatus,
      adresa: filters.grad ? { contains: filters.grad, mode: 'insensitive' } : undefined
    },
    include: {
      vlasnik: {
        select: { punoIme: true, email: true }
      }
    }
  });
};

const getFacilityByIdService = async (id) => {
  return await prisma.sportskiObjekat.findUnique({
    where: { objekatId: parseInt(id) },
    include: {
      vlasnik: { select: { punoIme: true, email: true } }
    }
  });
};

const updateFacilityService = async (id, data, currentUserId) => {
  const facility = await prisma.sportskiObjekat.findUnique({ where: { objekatId: parseInt(id) } });
  if (!facility) throw new Error("Sportski objekat ne postoji u bazi.");

  return await prisma.sportskiObjekat.update({
    where: { objekatId: parseInt(id) },
    data: {
      naziv: data.naziv,
      adresa: data.adresa,
      opis: data.opis,
      kapacitet: data.kapacitet ? parseInt(data.kapacitet) : null,
      status: data.status // Omogućava i ručnu promjenu statusa kroz formu
    }
  });
};

const deleteFacilityService = async (id, currentUserId) => {
  const facility = await prisma.sportskiObjekat.findUnique({ where: { objekatId: parseInt(id) } });
  if (!facility) throw new Error("Sportski objekat ne postoji.");

  // Izvršavanje zahtijevanog soft-delete-a (status = NEAKTIVAN) umjesto brisanja iz baze
  return await prisma.sportskiObjekat.update({
    where: { objekatId: parseInt(id) },
    data: { status: "NEAKTIVAN" }
  });
};

module.exports = {
  createFacilityService,
  getAllFacilitiesService,
  getFacilityByIdService,
  updateFacilityService,
  deleteFacilityService
};