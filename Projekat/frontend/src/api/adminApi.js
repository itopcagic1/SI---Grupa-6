import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

export const getKorisnici = async (token, status = '') => {
  const response = await api.get('/admin/korisnici', {
    headers: { Authorization: `Bearer ${token}` },
    params: status ? { status } : {},
  });
  return response.data;
};

export const obradiZahtjevUloge = async (token, korisnikId, akcija, razlog = '') => {
  const response = await api.patch(
    `/admin/korisnici/${korisnikId}/uloga`,
    { akcija, ...(razlog && { razlog }) },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};