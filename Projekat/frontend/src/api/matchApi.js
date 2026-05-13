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

export const generateSchedule = async (scheduleData) => {
  const response = await api.post('/matches/generate-schedule', scheduleData, getAuthHeaders());
  return response.data;
};

export const fetchPublicMatches = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const response = await api.get(`/matches/public${queryString ? `?${queryString}` : ''}`);
  return response.data;
};
