import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getObjectTerms = async (objekatId, od, doDatum) => {
  const params = {};
  if (od) params.od = od;
  if (doDatum) params.do = doDatum;

  const response = await api.get(`/objekti/${objekatId}/termini`, { params });
  return response.data;
};

export const getObjectDetails = async (objekatId) => {
  const response = await api.get(`/objekti/${objekatId}`);
  return response.data;
};

export const createObjectTerms = async (objekatId, body) => {
  const response = await api.post(`/objekti/${objekatId}/termini`, body, getAuthHeaders());
  return response.data;
};

export const updateTerm = async (terminId, body) => {
  const response = await api.put(`/termini/${terminId}`, body, getAuthHeaders());
  return response.data;
};

export const blockTerm = async (terminId) => {
  const response = await api.delete(`/termini/${terminId}`, getAuthHeaders());
  return response.data;
};
