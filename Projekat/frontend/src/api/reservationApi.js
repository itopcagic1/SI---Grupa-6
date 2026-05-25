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

export const joinWaitlist = async (terminId) => {
  const response = await api.post(`/liste-cekanja/termini/${terminId}`, {}, getAuthHeaders());
  return response.data;
};

export const leaveWaitlist = async (terminId) => {
  const response = await api.delete(`/liste-cekanja/termini/${terminId}`, getAuthHeaders());
  return response.data;
};

export const getMyWaitlistTerms = async () => {
  const response = await api.get('/liste-cekanja/moje', getAuthHeaders());
  return response.data;
};

// --- Grupne rezervacije (Developer 5) ---

export const kreirajGrupniTrening = async (terminId, maksimalanBrojIgraca, timId = null) => {
  const response = await api.post(
    `/rezervacije/grupne/${terminId}`,
    { maksimalanBrojIgraca, timId },
    getAuthHeaders()
  );
  return response.data;
};

export const prijaviSeNaGrupniTrening = async (id) => {
  const response = await api.post(`/rezervacije/grupne/${id}/prijave`, {}, getAuthHeaders());
  return response.data;
};

export const getTrenerGrupniTreninzi = async () => {
  const response = await api.get('/rezervacije/grupne/moje', getAuthHeaders());
  return response.data;
};

export const getGrupniTreninzi = async () => {
  const response = await api.get('/rezervacije/grupne/sve', getAuthHeaders());
  return response.data;
};

export const otkaziGrupniTrening = async (treningId) => {
  const response = await api.delete(`/rezervacije/grupne/${treningId}`, getAuthHeaders());
  return response.data;
};

export const odjaviSeSaGrupnogTreninga = async (treningId, razlog) => {
  const response = await api.delete(`/rezervacije/grupne/${treningId}/prijave`, {
    data: { razlog },
    ...getAuthHeaders()
  });
  return response.data;
};

export const getTrenerNotifikacije = async () => {
  const response = await api.get('/rezervacije/grupne/notifikacije', getAuthHeaders());
  return response.data;
};

export const getAllFacilities = async () => {
  const response = await api.get('/objekti', getAuthHeaders());
  return response.data;
};

export const getFacilityTerms = async (facilityId) => {
  const response = await api.get(`/objekti/${facilityId}/termini`, getAuthHeaders());
  return response.data;
};

export const getAllTeams = async () => {
  const response = await api.get('/teams', getAuthHeaders());
  return response.data;
};

export const getMojeRezervacije = async () => {
  const response = await api.get('/rezervacije/moje', getAuthHeaders());
  return response.data;
};