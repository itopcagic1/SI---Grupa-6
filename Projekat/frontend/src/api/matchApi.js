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

let matchesCache = {};
export const fetchPublicMatches = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const cacheKey = queryString || 'default';
  const now = Date.now();
  const cached = matchesCache[cacheKey];
  
  if (cached && now - cached.timestamp < 15000) {
    return cached.data;
  }

  const response = await api.get(`/matches/public${queryString ? `?${queryString}` : ''}`);
  matchesCache[cacheKey] = {
    timestamp: now,
    data: response.data
  };
  return response.data;
};

export const fetchMatchDetails = async (id) => {
  const response = await api.get(`/matches/${id}/details`);
  return response.data;
};

export const generateMatchPrediction = async (matchId) => {
  const response = await api.post(
    `/matches/${matchId}/predict`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

export const fetchMatchPrediction = async (matchId) => {
  const response = await api.get(
    `/matches/${matchId}/prediction`,
    getAuthHeaders()
  );
  return response.data;
};