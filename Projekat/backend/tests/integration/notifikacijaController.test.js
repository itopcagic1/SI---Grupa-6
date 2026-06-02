const request = require('supertest');
const express = require('express');

// TAČNA PUTANJA: Izlazi 3 nivoa unazad i ulazi u src/controllers i src/services
const notifikacijaController = require('../../src/controllers/notifikacijaController');
const notifikacijaService = require('../../src/services/notifikacijaService');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = { id: 10, korisnikId: 10 }; 
  next();
});

// Definiramo rute koje kontroler sluša
app.get('/api/notifikacije', notifikacijaController.getNotifikacije);
app.get('/api/notifikacije/count', notifikacijaController.getNeprocitaneCount);
app.put('/api/notifikacije/:id/procitano', notifikacijaController.oznaciKaoProcitano);

app.put('/api/notifikacije/procitano-sve', notifikacijaController.oznaciSveKaoProcitano);

// Mockujemo servis (putanja mora biti identična kao u require iznad)
jest.mock('../../../src/services/notifikacijaService');

describe('Notifikacija Controller - API Integration Testovi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('GET /api/notifikacije - treba vratiti 200 i JSON objekt sa notifikacijama', async () => {
    const mockData = [{ notifikacijaId: 1, sadrzajPoruke: 'Test poruka' }];
    notifikacijaService.getNotifikacijeService.mockResolvedValue(mockData);

    const res = await request(app).get('/api/notifikacije');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('notifikacije');
    expect(res.body.notifikacije).toEqual(mockData);
  });

  it('GET /api/notifikacije/count - treba vratiti broj nepročitanih', async () => {
    notifikacijaService.getNeprocitaneCountService.mockResolvedValue(5);

    const res = await request(app).get('/api/notifikacije/count');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ count: 5 });
  });

  it('PUT /api/notifikacije/:id/procitano - treba uspješno označiti notifikaciju', async () => {
    notifikacijaService.oznaciKaoProcitanoService.mockResolvedValue({ count: 1 });

    const res = await request(app).put('/api/notifikacije/12/procitano');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Notifikacija označena kao pročitana.' });
  });

  it('Treba vratiti status 500 ako servis baci neočekivanu grešku', async () => {
    notifikacijaService.getNotifikacijeService.mockRejectedValue(new Error('Konekcija pukla'));

    const res = await request(app).get('/api/notifikacije');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Konekcija pukla');
  });
});