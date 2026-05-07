const ligaService = require('../../../src/services/ligaService');
const ligaController = require('../../../src/controllers/ligaController');

jest.mock('../../../src/services/ligaService');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('ligaController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('controller vraca listu liga', async () => {
    const lige = [{ takmicenjeId: 1, naziv: 'Premijer liga', sportId: 1 }];
    ligaService.dohvatiSveLige.mockResolvedValue(lige);
    const req = { query: {} };
    const res = mockRes();

    await ligaController.dohvatiSveLige(req, res);

    expect(ligaService.dohvatiSveLige).toHaveBeenCalledWith({
      sportId: undefined,
      status: undefined,
      sezona: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ukupno: 1, lige }));
  });

  test('controller vraca pojedinacnu ligu ako metoda postoji', async () => {
    const liga = { takmicenjeId: 1, naziv: 'Premijer liga', sportId: 1 };
    ligaService.dohvatiLiguPoId.mockResolvedValue(liga);
    const req = { params: { id: '1' } };
    const res = mockRes();

    await ligaController.dohvatiLiguPoId(req, res);

    expect(ligaService.dohvatiLiguPoId).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ liga }));
  });

  test('controller uspjesno kreira ligu', async () => {
    const liga = { takmicenjeId: 2, naziv: 'Nova liga', sportId: 1 };
    ligaService.kreirajLigu.mockResolvedValue(liga);
    const req = {
      body: { naziv: 'Nova liga', sportId: 1 },
      user: { korisnikId: 10 },
    };
    const res = mockRes();

    await ligaController.kreirajLigu(req, res);

    expect(ligaService.kreirajLigu).toHaveBeenCalledWith(req.body, 10);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ liga }));
  });

  test('controller uspjesno uredjuje ligu', async () => {
    const liga = { takmicenjeId: 1, naziv: 'Izmijenjena liga', sportId: 1 };
    ligaService.izmijeniLigu.mockResolvedValue(liga);
    const req = {
      params: { id: '1' },
      body: { naziv: 'Izmijenjena liga' },
      user: { korisnikId: 10, uloga: 'ADMINISTRATOR' },
    };
    const res = mockRes();

    await ligaController.izmijeniLigu(req, res);

    expect(ligaService.izmijeniLigu).toHaveBeenCalledWith(
      '1',
      { naziv: 'Izmijenjena liga' },
      10,
      'ADMINISTRATOR'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ liga }));
  });

  test('controller uspjesno brise ligu', async () => {
    ligaService.obrisiLigu.mockResolvedValue({ takmicenjeId: 1 });
    const req = { params: { id: '1' }, user: { korisnikId: 10, uloga: 'ADMINISTRATOR' } };
    const res = mockRes();

    await ligaController.obrisiLigu(req, res);

    expect(ligaService.obrisiLigu).toHaveBeenCalledWith('1', 10, 'ADMINISTRATOR');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ takmicenjeId: 1 }));
  });

  test('controller uspjesno dodaje tim u ligu ako metoda postoji', async () => {
    const rezultat = { ucesceUTakmicenjuId: 1, takmicenjeId: 1, timId: 2 };
    ligaService.dodajTimULigu.mockResolvedValue(rezultat);
    const req = { params: { id: '1' }, body: { timId: 2 }, user: { korisnikId: 10 } };
    const res = mockRes();

    await ligaController.dodajTimULigu(req, res);

    expect(ligaService.dodajTimULigu).toHaveBeenCalledWith('1', 2, 10);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ rezultat }));
  });

  test('controller uspjesno uklanja tim iz lige ako metoda postoji', async () => {
    ligaService.ukloniTimIzLige.mockResolvedValue({ ucesceUTakmicenjuId: 1 });
    const req = { params: { id: '1', timId: '2' } };
    const res = mockRes();

    await ligaController.ukloniTimIzLige(req, res);

    expect(ligaService.ukloniTimIzLige).toHaveBeenCalledWith('1', '2');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ uspjeh: true }));
  });

  test('controller vraca error response kada service baci gresku', async () => {
    ligaService.kreirajLigu.mockRejectedValue(
      Object.assign(new Error('Sport sa zadanim ID-em ne postoji'), {
        status: 404,
        code: 'SPORT_NIJE_PRONADJEN',
      })
    );
    const req = { body: { naziv: 'Liga', sportId: 999 }, user: { korisnikId: 10 } };
    const res = mockRes();

    await ligaController.kreirajLigu(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ greska: 'SPORT_NIJE_PRONADJEN' }));
  });

  test('controller ne vraca password/passwordHash/hash podatke u response-u', async () => {
    const liga = {
      takmicenjeId: 1,
      naziv: 'Premijer liga',
      organizator: { korisnikId: 1, punoIme: 'Admin', email: 'admin@example.com' },
    };
    ligaService.dohvatiLiguPoId.mockResolvedValue(liga);
    const req = { params: { id: '1' } };
    const res = mockRes();

    await ligaController.dohvatiLiguPoId(req, res);

    const body = JSON.stringify(res.json.mock.calls[0][0]);
    expect(body).not.toContain('lozinka');
    expect(body).not.toContain('password');
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });

  test('controller ispravno obradjuje nepostojecu ligu ako je takva logika implementirana', async () => {
    ligaService.dohvatiLiguPoId.mockRejectedValue(
      Object.assign(new Error('Liga sa zadanim ID-em ne postoji'), {
        status: 404,
        code: 'LIGA_NIJE_PRONADJENA',
      })
    );
    const req = { params: { id: '999' } };
    const res = mockRes();

    await ligaController.dohvatiLiguPoId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ greska: 'LIGA_NIJE_PRONADJENA' }));
  });

  test('controller ispravno obradjuje duplo dodavanje tima u ligu ako je takva logika implementirana', async () => {
    ligaService.dodajTimULigu.mockRejectedValue(
      Object.assign(new Error('Tim je vec dodan u ovu ligu.'), { status: 409 })
    );
    const req = { params: { id: '1' }, body: { timId: 2 }, user: { korisnikId: 10 } };
    const res = mockRes();

    await ligaController.dodajTimULigu(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ poruka: expect.any(String) }));
  });
});
