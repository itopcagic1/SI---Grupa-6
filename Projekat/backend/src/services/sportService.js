const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllSports = async () => {
  return await prisma.sport.findMany();
};

const getSportById = async (id) => {
  return await prisma.sport.findUnique({
    where: { sportId: parseInt(id) }
  });
};

const createSport = async (data) => {
  // US-05.1: Provjera duplikata
  const existing = await prisma.sport.findUnique({
    where: { naziv: data.naziv }
  });
  if (existing) {
  throw new Error("Sport with this name already exists.");
}
  return await prisma.sport.create({
    data: {
      naziv: data.naziv,
      opis: data.opis,
      jeTimskiSport: data.jeTimskiSport ?? true
    }
  });
};

const updateSport = async (id, data) => {
  return await prisma.sport.update({
    where: { sportId: parseInt(id) },
    data: data
  });
};

const deleteSport = async (id) => {
  return await prisma.sport.delete({
    where: { sportId: parseInt(id) }
  });
};
module.exports = { 
  getAllSports, 
  getSportById, 
  createSport, 
  updateSport, 
  deleteSport 
};