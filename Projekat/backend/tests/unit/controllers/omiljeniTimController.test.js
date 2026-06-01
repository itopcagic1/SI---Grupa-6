const omiljeniTimService = require('../../../src/services/omiljeniTimService');
const {
  setOmiljeniTim,
  removeOmiljeniTim,
  getOmiljeniTimovi,
} = require('../../../src/controllers/omiljeniTimController');

jest.mock('../../../src/services/omiljeniTimService');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('omiljeniTimController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setOmiljeniTim successfully adds favorite team', async () => {
    const favorite = { omiljeniTimId: 1, korisnikId: 10, timId: 5 };
    omiljeniTimService.setOmiljeniTimService.mockResolvedValue(favorite);

    const req = {
      user: { id: 10 },
      params: { timId: '5' },
    };
    const res = mockRes();

    await setOmiljeniTim(req, res);

    expect(omiljeniTimService.setOmiljeniTimService).toHaveBeenCalledWith(10, 5);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(favorite);
  });

  test('removeOmiljeniTim successfully removes favorite team', async () => {
    omiljeniTimService.removeOmiljeniTimService.mockResolvedValue({ id: 1 });

    const req = {
      user: { id: 10 },
      params: { timId: '5' },
    };
    const res = mockRes();

    await removeOmiljeniTim(req, res);

    expect(omiljeniTimService.removeOmiljeniTimService).toHaveBeenCalledWith(10, 5);
    expect(res.json).toHaveBeenCalledWith({ message: "Omiljeni tim uspješno uklonjen." });
  });

  test('getOmiljeniTimovi retrieves all favorite teams', async () => {
    const favorites = [
      { omiljeniTimId: 1, korisnikId: 10, timId: 5, tim: { naziv: 'A', sport: { naziv: 'Fudbal' } } },
    ];
    omiljeniTimService.getOmiljeniTimoviService.mockResolvedValue(favorites);

    const req = {
      user: { korisnikId: 10 },
    };
    const res = mockRes();

    await getOmiljeniTimovi(req, res);

    expect(omiljeniTimService.getOmiljeniTimoviService).toHaveBeenCalledWith(10);
    expect(res.json).toHaveBeenCalledWith(favorites);
  });
});
