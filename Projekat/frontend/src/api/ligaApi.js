import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Helper function to get token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const fetchSportovi = async () => {
  const response = await api.get('/sportovi');
  return response.data;
};

export const fetchLige = async () => {
  const response = await api.get('/lige');
  return response.data;
};

export const fetchLigaById = async (id) => {
  const response = await api.get(`/lige/${id}`);
  return response.data;
};

export const createLiga = async (ligaData) => {
  const response = await api.post('/lige', ligaData, getAuthHeaders());
  return response.data;
};

export const updateLiga = async (id, ligaData) => {
  const response = await api.patch(`/lige/${id}`, ligaData, getAuthHeaders());
  return response.data;
};

export const deleteLiga = async (id) => {
  const response = await api.delete(`/lige/${id}`, getAuthHeaders());
  return response.data;
};
