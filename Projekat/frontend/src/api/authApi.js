import axios from 'axios';

// instanca axiosa koja gadja backend na portu 3000
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const registerUser = async (userData) => {
  // saljemo podatke (punoIme, email, lozinka, trazenaUloga) backendu
  const response = await api.post('/auth/register', userData);
  return response.data;
};