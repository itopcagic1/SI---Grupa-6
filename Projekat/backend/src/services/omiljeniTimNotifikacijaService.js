const prisma = require('../config/db');
const { kreirajNotifikacijuService } = require('./notifikacijaService');

exports.notificirajNavijaceTima = async (timId, tipNotifikacije, sadrzajPoruke) => {
  try {
    const parsedTimId = parseInt(timId, 10);
    
    // Pronađi sve korisnike koji prate ovaj tim
    const pratioci = await prisma.omiljeniTim.findMany({
      where: { timId: parsedTimId },
      select: { korisnikId: true }
    });

    // Kreiraj notifikaciju za svakog od njih
    const obecanja = pratioci.map((pratilac) =>
      kreirajNotifikacijuService(pratilac.korisnikId, tipNotifikacije, sadrzajPoruke)
    );

    await Promise.all(obecanja);
    console.log(`Uspješno poslane notifikacije za ${pratioci.length} pratilaca tima ID: ${timId}`);
  } catch (error) {
    console.error('Greška pri slanju grupnih notifikacija za omiljeni tim:', error);
  }
};