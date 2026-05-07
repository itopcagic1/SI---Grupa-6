const teamService = require('../services/teamService');

// Pomoćna funkcija za vađenje ID-a (sigurnosna mreža)
const getUserIdFromToken = (req) => req.user.id || req.user.korisnikId || req.user.userId;

exports.getTeams = async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dobavljanju timova." });
  }
};

exports.getCoaches = async (req, res) => {
  try {
    const coaches = await teamService.getAllCoaches();
    
    const formattedCoaches = coaches.map(c => ({
  id: c.korisnikId,
  ime: c.punoIme,
  prezime: ''
}));

    res.json(formattedCoaches);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dobavljanju trenera." });
  }
};

exports.getTeamDetails = async (req, res) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    if (!team) return res.status(404).json({ message: "Tim nije pronađen." });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNewTeam = async (req, res) => {
  try {
    const { name, sportId } = req.body;
    if (!name || !sportId) return res.status(400).json({ message: "Ime i ID sporta su obavezni." });
    
    const team = await teamService.createTeam(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getPlayers = async (req, res) => {
  try {
    const players = await teamService.getAllPlayers();
    const formatted = players.map(p => ({
      id: p.korisnikId,
      ime: p.punoIme,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dobavljanju igrača." });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    const isCoach = await teamService.isUserCoachOfTeam(req.params.id, currentUserId);
    const isAdmin = req.user.uloga === 'ADMIN' || req.user.uloga === 'ADMINISTRATOR';

    if (!isAdmin && !isCoach) {
      return res.status(403).json({ message: "Samo administrator ili trener ovog tima mogu mijenjati podatke." });
    }

    const updated = await teamService.updateTeam(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    await teamService.deleteTeam(req.params.id);
    res.json({ message: "Tim je uspješno obrisan." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addPlayer = async (req, res) => {
    return await handleMemberAddition(req, res, "IGRAC");
};

exports.addCoach = async (req, res) => {
    return await handleMemberAddition(req, res, "TRENER");
};

const handleMemberAddition = async (req, res, defaultRole) => {
    try {
        const currentUserId = getUserIdFromToken(req);
        const isCoach = await teamService.isUserCoachOfTeam(req.params.id, currentUserId);
        const isAdmin = req.user.uloga === 'ADMIN' || req.user.uloga === 'ADMINISTRATOR';

        if (!isAdmin && !isCoach) {
          return res.status(403).json({ message: "Samo administrator ili trener ovog tima mogu upravljati članovima." });
        }

        const { userId, roleInTeam } = req.body;
        const role = roleInTeam || defaultRole;
        
        const member = await teamService.addMemberToTeam(req.params.id, userId, role, req.user.uloga);
        res.status(201).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.removePlayer = async (req, res) => {
  try {
    const { id, playerId } = req.params; 
    const currentUserId = getUserIdFromToken(req);

    const isCoach = await teamService.isUserCoachOfTeam(id, currentUserId);
    const isAdmin = req.user.uloga === 'ADMIN' || req.user.uloga === 'ADMINISTRATOR';
    
    if (!isAdmin && !isCoach) {
      return res.status(403).json({ 
        message: "Samo administrator ili trener ovog tima mogu ukloniti članove." 
      });
    }

    await teamService.removeMemberFromTeam(id, playerId);
    res.json({ message: "Igrač uspješno uklonjen iz tima." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};