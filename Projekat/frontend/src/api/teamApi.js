import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

const authConfig = () => {
  const token = localStorage.getItem('token');
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

export const fetchTeams = async () => {
  const response = await api.get('/teams', authConfig());
  return response.data;
};

export const fetchSports = async () => {
  const response = await api.get('/sports', authConfig());
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await api.post('/teams', teamData, authConfig());
  return response.data;
};

export const updateTeam = async (teamId, teamData) => {
  const response = await api.patch(`/teams/${teamId}`, teamData, authConfig());
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await api.delete(`/teams/${teamId}`, authConfig());
  return response.data;
};
