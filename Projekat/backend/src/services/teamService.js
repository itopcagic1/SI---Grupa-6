const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sanitizeTeamUsers = (team) => {
  if (!team?.clanstvaUcesnika) return team;

  return {
    ...team,
    clanstvaUcesnika: team.clanstvaUcesnika.map((clanstvo) => {
      if (!clanstvo.korisnik) return clanstvo;

      const {
        lozinkaHash,
        refreshToken,
        password,
        hash,
        ...safeKorisnik
      } = clanstvo.korisnik;

      return {
        ...clanstvo,
        korisnik: safeKorisnik,
      };
    }),
  };
};

// US-08: Get all teams with their sport info
const getAllTeams = async () => {
  return await prisma.tim.findMany({
    include: {
      sport: true,
      clanstvaUcesnika: {
  select: { 
    korisnikId: true,
    ulogaUTimu: true,
    status: true,
    korisnik: {
      select: { punoIme: true }
    }
  }
}
    }
  });
};

// US-08: Get full team details 
const getTeamById = async (id) => {
  const team = await prisma.tim.findUnique({
    where: { timId: parseInt(id) },
    include: {
      sport: true,
      clanstvaUcesnika: {
        include: {
          korisnik: {
            select: {
              korisnikId: true,
              punoIme: true,
              email: true,
              uloga: true,
              trazenaUloga: true,
              statusUloge: true,
              statusPouzdanosti: true,
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

  return sanitizeTeamUsers(team);
};

// US-05.3.1: Create team with duplicate name check
const createTeam = async (data, currentUserId, currentUserRole) => {
  const existingTeam = await prisma.tim.findFirst({
    where: { naziv: data.name }
  });

  if (existingTeam) throw new Error("Tim sa ovim nazivom već postoji.");

  let trenerId = null;

  if (currentUserRole === 'TRENER') {
    trenerId = Number(currentUserId);
  } else if (data.trenerId) {
    trenerId = Number(data.trenerId);
  }

  const noviTim = await prisma.tim.create({
    data: {
      naziv: data.name,
      sportId: parseInt(data.sportId),
      opis: data.description || null,
      logoUrl: data.logoUrl || null,
      status: "ACTIVE"
    }
  });

  if (trenerId) {
    await prisma.clanstvoTima.create({
      data: {
        timId: noviTim.timId,
        korisnikId: trenerId,
        ulogaUTimu: 'TRENER',
        status: 'ACTIVE'
      }
    });
  }

  return await prisma.tim.findUnique({
    where: { timId: noviTim.timId },
    include: {
      sport: true,
      clanstvaUcesnika: {
        select: {
          korisnikId: true,
          ulogaUTimu: true,
          status: true,
          korisnik: {
            select: { punoIme: true }
          }
        }
      }
    }
  });
};

// US-05.3.2 & US-06: Update team info
const updateTeam = async (id, data) => {
  const teamId = parseInt(id);

  // 1. Ažuriraj osnovne podatke tima
  const updatedTeam = await prisma.tim.update({
    where: { timId: teamId },
    data: {
      naziv: data.name,
      opis: data.description,
      logoUrl: data.logoUrl,
      status: data.status
    }
  });

  // 2. Ako je proslijeđen novi trenerId, ažuriraj članstvo
  if (data.trenerId) {
    const noviTrenerId = parseInt(data.trenerId);

    // Prvo ukloni bilo kojeg trenutnog trenera iz tog tima
    await prisma.clanstvoTima.deleteMany({
      where: {
        timId: teamId,
        ulogaUTimu: 'TRENER'
      }
    });

    // Dodaj novog trenera kao aktivnog člana
    await prisma.clanstvoTima.create({
      data: {
        timId: teamId,
        korisnikId: noviTrenerId,
        ulogaUTimu: 'TRENER',
        status: 'ACTIVE'
      }
    });
  }

  return updatedTeam;
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

// Dobavljanje svih trenera iz baze
const getAllCoaches = async () => {
  return await prisma.korisnik.findMany({
    where: {
      uloga: 'TRENER'
    },
    // Selektujemo samo podatke koji nam trebaju za padajući meni
    
      select: {
  korisnikId: true,
  punoIme: true
}
    
  });
};
const getAllPlayers = async () => {
  return await prisma.korisnik.findMany({
    where: { uloga: 'IGRAC' },
    select: { korisnikId: true, punoIme: true }
  });
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  isUserCoachOfTeam,
  getAllCoaches,
  getAllPlayers
};
