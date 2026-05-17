import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const fetchTipoviStatistike = async (sportId) => {
  if (!sportId) return [];
  const response = await api.get(`/tipovi-statistike?sportId=${sportId}`);
  return response.data;
};

export const snimiStatistikuIgraca = async (utakmicaId, payload) => {
  const response = await api.post(`/matches/${utakmicaId}/statistika/igraci`, payload, getAuthHeaders());
  return response.data;
};

export const snimiStatistikuTima = async (utakmicaId, payload) => {
  const response = await api.post(`/matches/${utakmicaId}/statistika/timovi`, payload, getAuthHeaders());
  return response.data;
};
