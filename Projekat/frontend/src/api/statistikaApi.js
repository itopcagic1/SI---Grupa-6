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

export const dohvatiStatistikuIgraca = async (igracId, takmicenjeId = null, sezona = null) => {
  const params = {};
  if (takmicenjeId) params.takmicenjeId = takmicenjeId;
  if (sezona) params.sezona = sezona;

  const response = await api.get(`/igraci/${igracId}/statistika`, { params });
  return response.data;
};

export const dohvatiStatistikuTima = async (timId, takmicenjeId = null, sezona = null) => {
  const params = {};
  if (takmicenjeId) params.takmicenjeId = takmicenjeId;
  if (sezona) params.sezona = sezona;

  const response = await api.get(`/timovi/${timId}/statistika`, { params });
  return response.data;
};

export const dohvatiTopStrijelce = async (takmicenjeId, tipStatistikeId, limit = 10) => {
  const params = {};
  if (tipStatistikeId) params.tipStatistikeId = tipStatistikeId;
  if (limit) params.limit = limit;

  const response = await api.get(`/takmicenja/${takmicenjeId}/top-strijelci`, { params });
  return response.data;
};

export const dohvatiTakmicenjaIgraca = async (igracId) => {
  const response = await api.get(`/igraci/${igracId}/takmicenja`);
  return response.data;
};
export const dohvatiTakmicenjaTima = async (timId) => {
  const response = await api.get(`/timovi/${timId}/takmicenja`);
  return response.data;
};
