import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Pomoćna konfiguracija za slanje tokena kroz credentials/headers
const getAuthConfig = () => ({
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

export const getNotifikacije = async () => {
  const response = await axios.get(`${API_URL}/notifikacije`, getAuthConfig());
  return response.data;
};

export const getNeprocitaneCount = async () => {
  const response = await axios.get(`${API_URL}/notifikacije/neprocitane-count`, getAuthConfig());
  return response.data;
};

export const oznaciKaoProcitano = async (id) => {
  const response = await axios.patch(`${API_URL}/notifikacije/${id}/procitano`, {}, getAuthConfig());
  return response.data;
};

export const oznaciSveKaoProcitane = async () => {
  const response = await axios.patch(`${API_URL}/notifikacije/procitano-sve`, {}, getAuthConfig());
  return response.data;
};