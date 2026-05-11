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