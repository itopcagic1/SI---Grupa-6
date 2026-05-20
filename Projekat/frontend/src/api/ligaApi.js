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

let sportoviCache = null;
export const fetchSportovi = async () => {
  if (sportoviCache) return sportoviCache;
  const response = await api.get('/sports');
  sportoviCache = response.data;
  return response.data;
};

let ligeCache = {};
export const fetchLige = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const cacheKey = query || 'default';
  if (ligeCache[cacheKey]) return ligeCache[cacheKey];
  
  const response = await api.get(`/lige${query ? `?${query}` : ''}`);
  ligeCache[cacheKey] = response.data;
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

export const dodajTimULigu = async (ligaId, timId) => {
  const response = await api.post(`/lige/${ligaId}/timovi`, { timId }, getAuthHeaders());
  return response.data;
};

export const ukloniTimIzLige = async (ligaId, timId) => {
  const response = await api.delete(`/lige/${ligaId}/timovi/${timId}`, getAuthHeaders());
  return response.data;
};

export const fetchLigaDetalji = async (id) => {
  const response = await api.get(`/lige/${id}`);
  return response.data;
};