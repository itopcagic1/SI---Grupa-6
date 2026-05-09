const sportService = require('../../../src/services/sportService');
const {
  getAllSports,
  getSportById,
  createSport,
  updateSport,
  deleteSport,
} = require('../../../src/controllers/sportController');

jest.mock('../../../src/services/sportService');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('sportController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('controller vraca listu sportova', async () => {
    const sports = [
      { sportId: 1, naziv: 'Fudbal', opis: 'Fudbal', jeTimskiSport: true },
    ];
    sportService.getAllSports.mockResolvedValue(sports);
    const req = {};
    const res = mockRes();

    await getAllSports(req, res);

    expect(res.json).toHaveBeenCalledWith(sports);
  });

  test('controller uspjesno kreira sport', async () => {
    const sport = { sportId: 2, naziv: 'Rukomet', opis: 'Rukomet', jeTimskiSport: true };
    sportService.createSport.mockResolvedValue(sport);
    const req = { body: { naziv: 'Rukomet', opis: 'Rukomet', jeTimskiSport: true } };
    const res = mockRes();

    await createSport(req, res);

    expect(sportService.createSport).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(sport);
  });

  test('controller uspjesno uredjuje sport', async () => {
    const sport = { sportId: 2, naziv: 'Rukomet', opis: 'Novi opis', jeTimskiSport: true };
    sportService.updateSport.mockResolvedValue(sport);
    const req = { params: { id: '2' }, body: { opis: 'Novi opis' } };
    const res = mockRes();

    await updateSport(req, res);

    expect(sportService.updateSport).toHaveBeenCalledWith('2', { opis: 'Novi opis' });
    expect(res.json).toHaveBeenCalledWith(sport);
  });

  test('controller uspjesno brise sport', async () => {
    sportService.deleteSport.mockResolvedValue({ sportId: 2 });
    const req = { params: { id: '2' } };
    const res = mockRes();

    await deleteSport(req, res);

    expect(sportService.deleteSport).toHaveBeenCalledWith('2');
    expect(res.json).toHaveBeenCalledWith({ message: 'Sport successfully deleted.' });
  });

  test('controller vraca error response kada service baci gresku', async () => {
    sportService.createSport.mockRejectedValue(new Error('Sport sa ovim nazivom vec postoji!'));
    const req = { body: { naziv: 'Fudbal' } };
    const res = mockRes();

    await createSport(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Sport sa ovim nazivom vec postoji!' })
    );
  });

  test('controller ne vraca nepotrebne/osjetljive podatke u response-u', async () => {
    const sport = { sportId: 3, naziv: 'Tenis', opis: 'Tenis', jeTimskiSport: false };
    sportService.createSport.mockResolvedValue(sport);
    const req = { body: { naziv: 'Tenis', opis: 'Tenis', jeTimskiSport: false } };
    const res = mockRes();

    await createSport(req, res);

    const body = JSON.stringify(res.json.mock.calls[0][0]);
    expect(body).not.toContain('lozinka');
    expect(body).not.toContain('password');
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });

  test('controller ispravno obradjuje nepostojeci sport za getSportById', async () => {
    sportService.getSportById.mockResolvedValue(null);
    const req = { params: { id: '999' } };
    const res = mockRes();

    await getSportById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sport not found.' });
  });

  test('controller vraca 500 kada getAllSports service baci gresku', async () => {
    sportService.getAllSports.mockRejectedValue(new Error('DB greska'));
    const req = {};
    const res = mockRes();

    await getAllSports(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB greska' });
  });
});
