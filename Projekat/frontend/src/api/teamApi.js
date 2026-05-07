import axios from 'axios';

// Instanca koja zna gdje je backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

// Funkcija koja uzima token iz lokala za zaštićene rute
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const fetchTeams = () => api.get('/teams').then(res => res.data);

export const fetchSports = async () => {
  // 'api' instanca već ima u sebi 'http://localhost:3000/api'
  const response = await api.get('/sports'); 
  return response.data;
};

export const fetchCoaches = async () => {
  try {
    const response = await api.get('/teams/coaches');
    return response.data;
  } catch (error) {
    console.error("Greška kod trenera:", error);
    return []; 
  }
};

export const createSport = (data) => api.post('/sports', data, getAuthHeader()).then(res => res.data);
export const updateSport = (id, data) => api.patch(`/sports/${id}`, data, getAuthHeader()).then(res => res.data);
export const deleteSport = (id) => api.delete(`/sports/${id}`, getAuthHeader()).then(res => res.data);

export const createTeam = (teamData) => api.post('/teams', teamData, getAuthHeader()).then(res => res.data);
export const updateTeam = (id, teamData) => api.patch(`/teams/${id}`, teamData, getAuthHeader()).then(res => res.data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`, getAuthHeader()).then(res => res.data);

export const fetchTeamDetails = (id) => api.get(`/teams/${id}`, getAuthHeader()).then(res => res.data);
export const fetchPlayers = () => api.get('/teams/players', getAuthHeader()).then(res => res.data);
export const addPlayerToTeam = (teamId, userId) => api.post(`/teams/${teamId}/players`, { userId }, getAuthHeader()).then(res => res.data);
export const removePlayerFromTeam = (teamId, playerId) => api.delete(`/teams/${teamId}/players/${playerId}`, getAuthHeader()).then(res => res.data);