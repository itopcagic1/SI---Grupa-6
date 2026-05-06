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

  if (existingTeam) throw new Error("A team with this name already exists.");

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
  const inLeague = await prisma.ucesceUTakmicenju.findFirst({
    where: { timId: parseInt(id) }
  });

  if (inLeague) throw new Error("Cannot delete team: It is currently registered in a league.");

  return await prisma.tim.delete({
    where: { timId: parseInt(id) }
  });
};


// US-07 (Igrači) & US-05.4 (Treneri)
const addMemberToTeam = async (teamId, userId, roleInTeam) => {

  const user = await prisma.korisnik.findUnique({
    where: { korisnikId: parseInt(userId) }
  });

  if (!user) throw new Error("User not found.");

  if (user.uloga !== roleInTeam) {
    throw new Error(`User is ${user.uloga} in system, cannot be added as ${roleInTeam}.`);
  }

  // provjeri da li je korisnik vec u ovom konkretnom timu
  const alreadyInThisTeam = await prisma.clanstvoTima.findFirst({
    where: {
      timId: parseInt(teamId),
      korisnikId: parseInt(userId)
    }
  });

  if (alreadyInThisTeam) {
    throw new Error("User is already a member of this team.");
  }

  // zatim provjeri da li je korisnik u nekom drugom timu
  const alreadyInAnotherTeam = await prisma.clanstvoTima.findFirst({
    where: {
      korisnikId: parseInt(userId),
      status: "ACTIVE"

    }
  });

  if (alreadyInAnotherTeam) {
    const errorMsg = roleInTeam === "TRENER"
      ? "This coach is already leading another team!"
      : "This player is already a member of another team!";
    throw new Error(errorMsg);
  }

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

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam
};