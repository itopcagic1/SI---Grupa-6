const teamService = require('../services/teamService');

exports.getTeams = async (req, res) => {
  try {
    const teams = await teamService.getAllTeams();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams." });
  }
};

exports.getTeamDetails = async (req, res) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found." });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNewTeam = async (req, res) => {
  try {
    const { name, sportId } = req.body;
    if (!name || !sportId) return res.status(400).json({ message: "Name and Sport ID are required." });
    
    const team = await teamService.createTeam(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const updated = await teamService.updateTeam(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    await teamService.deleteTeam(req.params.id);
    res.json({ message: "Team deleted successfully." });
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
        const { userId, roleInTeam } = req.body;
        const role = roleInTeam || defaultRole;
        
        const member = await teamService.addMemberToTeam(req.params.id, userId, role);
        
        res.status(201).json(member);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.removePlayer = async (req, res) => {
  try {
    await teamService.removeMemberFromTeam(req.params.id, req.params.userId);
    res.json({ message: "Member removed from team." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};