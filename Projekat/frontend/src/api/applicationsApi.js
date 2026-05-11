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

export const fetchMojePrijave = async () => {
  const response = await api.get('/applications/my', getAuthHeaders());
  return response.data;
};

export const createApplication = async ({ timId, takmicenjeId }) => {
  const response = await api.post(
    '/applications',
    { timId, takmicenjeId },
    getAuthHeaders()
  );

  return response.data;
};