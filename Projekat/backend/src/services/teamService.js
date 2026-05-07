const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// US-08: Get all teams with their sport info
const getAllTeams = async () => {
  return await prisma.tim.findMany({
    include: { sport: true }
  });
};

// US-08: Get full team details 
const getTeamById = async (id) => {
  return await prisma.tim.findUnique({
    where: { timId: parseInt(id) },
    include: {
      sport: true,
      clanstvaUcesnika: {
        include: {
          korisnik: {
            include: {
              statistikeIgraca: true
            }
          }
        }
      },
      ucescaUTakmicenjima: {
        include: {
          takmicenje: true
        }
      }
    }
  });
};

// US-05.3.1: Create team with duplicate name check
const createTeam = async (data) => {
  const existingTeam = await prisma.tim.findFirst({
    where: { naziv: data.name }
  });

  if (existingTeam) throw new Error("Tim sa ovim nazivom već postoji.");

  return await prisma.tim.create({
    data: {
      naziv: data.name,
      sportId: parseInt(data.sportId),
      opis: data.description || null,
      logoUrl: data.logoUrl || null,
      status: "ACTIVE"
    }
  });
};

// US-05.3.2 & US-06: Update team info
const updateTeam = async (id, data) => {
  return await prisma.tim.update({
    where: { timId: parseInt(id) },
    data: {
      naziv: data.name,
      opis: data.description,
      logoUrl: data.logoUrl,
      status: data.status
    }
  });
};

// US-05.3.3: Delete team (with a check if it's in a league)
const deleteTeam = async (id) => {
  const parsedId = parseInt(id);

  const inLeague = await prisma.ucesceUTakmicenju.findFirst({
    where: { timId: parsedId }
  });

  if (inLeague) {
    throw new Error("Ne možeš obrisati tim: Tim je trenutno registrovan u ligi.");
  }

  // prvo obriši sve članove iz ClanstvoTima
  await prisma.clanstvoTima.deleteMany({
    where: { timId: parsedId }
  });

  return await prisma.tim.delete({
    where: { timId: parsedId }
  });
};


// US-07 (Igrači) & US-05.4 (Treneri)
const addMemberToTeam = async (teamId, userId, roleInTeam, currentUserRole) => {
  const team = await prisma.tim.findUnique({
    where: { timId: parseInt(teamId) }
  });

  if (!team) {
    throw new Error(`Tim sa ID-em ${teamId} ne postoji u sistemu.`);
  }

  // 1. Pronađi korisnika kojeg želimo dodati
  const user = await prisma.korisnik.findUnique({
    where: { korisnikId: parseInt(userId) }
  });

  if (!user) throw new Error("Korisnik nije pronađen.");

  // 2. Provjera uloge: Ako korisnik već nema tu ulogu u sistemu
  if (user.uloga !== roleInTeam) {
    
    // Samo Administrator može mijenjati/odobravati uloge pri dodavanju u tim
    if (currentUserRole !== 'ADMINISTRATOR') {
      throw new Error(`Korisnik je ${user.uloga} i ne može biti dodan kao ${roleInTeam} bez odobrenja administratora.`);
    }

    // Admin ga može dodati samo ako se uloga poklapa sa onom koju je korisnik tražio
    if (user.trazenaUloga !== roleInTeam) {
      throw new Error(
        `Administrator ne može dodati korisnika kao ${roleInTeam} jer je korisnik tražio da bude ${user.trazenaUloga}.`
      );
    }

    // Ako je sve u redu, ažuriraj korisnika u bazi
    console.log(`Admin odobrava ulogu ${roleInTeam} za korisnika ${userId}`);
    await prisma.korisnik.update({
      where: { korisnikId: user.korisnikId },
      data: { 
        uloga: roleInTeam, 
        statusUloge: 'ODOBREN' 
      }
    });
  }

  // 3. Provjeri da li je korisnik već član tog konkretnog tima
  const alreadyInThisTeam = await prisma.clanstvoTima.findFirst({
    where: {
      timId: parseInt(teamId),
      korisnikId: parseInt(userId)
    }
  });

  if (alreadyInThisTeam) {
    throw new Error("Korisnik je već član ovog tima.");
  }

  // 4. Provjeri da li je korisnik već aktivan u nekom drugom timu
  const alreadyInAnotherTeam = await prisma.clanstvoTima.findFirst({
    where: {
      korisnikId: parseInt(userId),
      status: "ACTIVE"
    }
  });

  if (alreadyInAnotherTeam) {
    const errorMsg = roleInTeam === "TRENER"
      ? "Ovaj trener već vodi drugi tim!"
      : "Ovaj igrač je već član drugog tima!";
    throw new Error(errorMsg);
  }

  // 5. Ako su sve provjere prošle, kreiraj zapis u tabeli ClanstvoTima
  return await prisma.clanstvoTima.create({
    data: {
      timId: parseInt(teamId),
      korisnikId: parseInt(userId),
      ulogaUTimu: roleInTeam,
      status: "ACTIVE"
    }
  });
};

// US-07: Remove member from team
const removeMemberFromTeam = async (teamId, userId) => {
  return await prisma.clanstvoTima.deleteMany({
    where: {
      timId: parseInt(teamId),
      korisnikId: parseInt(userId)
    }
  });
};

const isUserCoachOfTeam = async (teamId, userId) => {
 if (!userId) {
    console.error("Greška: userId nije proslijeđen funkciji isUserCoachOfTeam!");
    return false;
  }

  const membership = await prisma.clanstvoTima.findFirst({
    where: {
      timId: parseInt(teamId),
      korisnikId: parseInt(userId), 
      ulogaUTimu: 'TRENER',
      status: 'ACTIVE'
    }
  });
  return !!membership;
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  isUserCoachOfTeam
};