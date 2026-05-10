import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

export const getKorisnici = async (token, status = '', pretraga = '') => {
  const params = {};
  if (status) params.status = status;
  if (pretraga) params.pretraga = pretraga;

  const response = await api.get('/admin/korisnici', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};

export const getBlokiraniKorisnici = async (token, pretraga = '') => {
  const params = {};
  if (pretraga) params.pretraga = pretraga;
  const response = await api.get('/admin/korisnici/blokirani', {
    headers: { Authorization: `Bearer ${token}` },
    params,
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

export const obrisiKorisnika = async (token, korisnikId) => {
  const response = await api.delete(`/admin/korisnici/${korisnikId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const blokirajKorisnika = async (token, korisnikId, akcija, razlog = '') => {
  const response = await api.patch(
    `/admin/korisnici/${korisnikId}/blokiranje`,
    { akcija, ...(razlog && { razlog }) },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getKorisnikDetalji = async (token, korisnikId) => {
  const response = await api.get(`/admin/korisnici/${korisnikId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const promijeniUlogu = async (token, korisnikId, novaUloga) => {
  const response = await api.patch(
    `/admin/korisnici/${korisnikId}/promijeni-ulogu`,
    { novaUloga },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};