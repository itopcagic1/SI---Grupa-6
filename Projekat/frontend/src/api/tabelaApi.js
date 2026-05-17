import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchTabela = async (takmicenjeId, sortBy = 'ukupniBodovi', sezona = null) => {
  const params = {};
  if (sortBy) params.sortBy = sortBy;
  if (sezona) params.sezona = sezona;

  const response = await axios.get(
    `${API_URL}/takmicenja/${takmicenjeId}/tabela`,
    { params }
  );
  return response.data;
};