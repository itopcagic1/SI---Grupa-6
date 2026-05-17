import axios from 'axios';

const API_URL = 'http://localhost:3000/api/matches';

export const unesiRezultat = async (utakmicaId, rezultatDomacin, rezultatGost) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/${utakmicaId}/rezultat`,
    { rezultatDomacin, rezultatGost },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const azurirajRezultat = async (utakmicaId, rezultatDomacin, rezultatGost) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${API_URL}/${utakmicaId}/rezultat`,
    { rezultatDomacin, rezultatGost },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const dohvatiRezultat = async (utakmicaId) => {
  const response = await axios.get(`${API_URL}/${utakmicaId}/rezultat`);
  return response.data;
};
