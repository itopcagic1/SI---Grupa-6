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

export const getVlasnikRezervacije = async ({
  terenId,
  datumOd,
  datumDo,
  page = 1,
  limit = 15,
}) => {
  const params = {
    page,
    limit,
  };

  if (terenId) params.terenId = terenId;
  if (datumOd) params.datumOd = datumOd;
  if (datumDo) params.datumDo = datumDo;

  const response = await api.get('/vlasnik/rezervacije', {
    ...getAuthHeaders(),
    params,
  });

  return response.data;
};

export const getVlasnikObjekti = async () => {
  const response = await api.get('/objekti', getAuthHeaders());
  return response.data;
};

export const verifikujZahtjevRezervacije = async (id, payload) => {
  const response = await api.patch(
    `/vlasnik/zahtjevi/${id}/verifikacija`,
    payload,
    getAuthHeaders()
  );

  return response.data;
};
