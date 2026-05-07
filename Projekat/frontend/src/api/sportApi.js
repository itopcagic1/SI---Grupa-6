
export const createSport = async (sportData) => {
  const response = await api.post('/sports', sportData, authConfig());
  return response.data;
};

export const updateSport = async (id, sportData) => {
  const response = await api.patch(`/sports/${id}`, sportData, authConfig());
  return response.data;
};



export const deleteSport = async (id) => {
  const response = await api.delete(`/sports/${id}`, authConfig());
  return response.data;
};

