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

export const getFreeIndividualTerms = async () => {
  const response = await api.get('/rezervacije/slobodni/individualni', getAuthHeaders());
  return response.data;
};

export const reserveIndividualTerm = async (terminId) => {
  const response = await api.post(`/rezervacije/individualne/${terminId}`, {}, getAuthHeaders());
  return response.data;
};

export const cancelIndividualTerm = async (terminId) => {
  const response = await api.delete(`/rezervacije/individualne/${terminId}`, getAuthHeaders());
  return response.data;
};