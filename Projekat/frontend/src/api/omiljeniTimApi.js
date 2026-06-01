import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const addOmiljeniTim = async (timId) => {
  const response = await api.post(`/omiljeni-tim/${timId}`, {}, getAuthHeader());
  return response.data;
};

export const removeOmiljeniTim = async (timId) => {
  const response = await api.delete(`/omiljeni-tim/${timId}`, getAuthHeader());
  return response.data;
};

export const getOmiljeniTimovi = async () => {
  const response = await api.get('/omiljeni-tim', getAuthHeader());
  return response.data;
};
