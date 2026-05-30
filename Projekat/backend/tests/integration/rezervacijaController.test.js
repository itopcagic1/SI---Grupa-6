const request = require('supertest');
const express = require('express');

// Mock servisi
jest.mock('../../src/services/rezervacijaService', () => ({
  getAllTermsService: jest.fn(),
  createIndividualReservationService: jest.fn(),
  cancelIndividualReservationService: jest.fn(),
  getMojeRezervacijeService: jest.fn(),
}));

jest.mock('../../src/services/grupneRezervacijeService', () => ({
  kreirajGrupniTreningService: jest.fn(),
  prijaviSeNaGrupniTreningService: jest.fn(),
  getTrenerGrupniTreninziService: jest.fn(),
  getGrupniTreninziService: jest.fn(),
  otkaziGrupniTreningService: jest.fn(),
  odjaviSeSaGrupnogTreningaService: jest.fn(),
  getTrenerNotifikacijeService: jest.fn(),
}));

const {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
  getMojeRezervacijeService,
} = require('../../src/services/rezervacijaService');

const {
  prijaviSeNaGrupniTreningService,
  getGrupniTreninziService,
  odjaviSeSaGrupnogTreningaService,
} = require('../../src/services/grupneRezervacijeService');

const rezervacijaController = require('../../src/controllers/rezervacijaController');

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = {
    korisnikId: 1,
    email: 'igrac@test.com',
    uloga: 'IGRAC',
    statusPouzdanosti: 'AKTIVAN',
  };
  next();
};

// Postavljanje Express app
const app = express();
app.use(express.json());
app.use(mockAuth);

app.get('/api/rezervacije/slobodni/individualni', rezervacijaController.getFreeIndividualTerms);
app.post('/api/rezervacije/individualne/:id', rezervacijaController.kreirajIndividualnuRezervaciju);
app.delete('/api/rezervacije/individualne/:id', rezervacijaController.otkaziIndividualnuRezervaciju);
app.get('/api/rezervacije/moje', rezervacijaController.getMojeRezervacije);
app.post('/api/rezervacije/grupne/:id/prijave', rezervacijaController.prijaviSeNaGrupniTrening);
app.get('/api/rezervacije/grupne/sve', rezervacijaController.getGrupniTreninzi);
app.delete('/api/rezervacije/grupne/:id/prijave', rezervacijaController.odjaviSeSaGrupnogTreninga);

const now = new Date();
const future = new Date(now.getTime() + 2 * 60 * 60 * 1000);

const mockTermin = {
  terminId: 10,
  vrijemePocetka: future,
  vrijemeZavrsetka: new Date(future.getTime() + 3600000),
  status: 'SLOBODAN',
  jeMojaRezervacija: false,
  naListiCekanja: false,
  sportskiObjekat: { objekatId: 5, naziv: 'Arena', adresa: 'Ulica 1' },
};

// ─────────────────────────────────────────────
// GET /api/rezervacije/slobodni/individualni
// ─────────────────────────────────────────────
describe('GET /api/rezervacije/slobodni/individualni', () => {
  beforeEach(() => jest.clearAllMocks());

  it('vraća listu termina sa statusom 200', async () => {
    getAllTermsService.mockResolvedValue([mockTermin]);

    const res = await request(app).get('/api/rezervacije/slobodni/individualni');

    expect(res.status).toBe(200);
    expect(res.body.termini).toHaveLength(1);
    expect(res.body.termini[0].terminId).toBe(10);
  });

  it('vraća praznu listu kada nema termina', async () => {
    getAllTermsService.mockResolvedValue([]);

    const res = await request(app).get('/api/rezervacije/slobodni/individualni');

    expect(res.status).toBe(200);
    expect(res.body.termini).toEqual([]);
  });

  it('vraća 500 kada servis baci grešku', async () => {
    getAllTermsService.mockRejectedValue(new Error('DB greška'));

    const res = await request(app).get('/api/rezervacije/slobodni/individualni');

    expect(res.status).toBe(500);
    expect(res.body.greska).toBe('SERVER_ERROR');
  });
});

// ─────────────────────────────────────────────
// POST /api/rezervacije/individualne/:id
// ─────────────────────────────────────────────
describe('POST /api/rezervacije/individualne/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('kreira rezervaciju i vraća status POTVRDJENA', async () => {
    createIndividualReservationService.mockResolvedValue({ tip: 'REZERVISANO' });

    const res = await request(app).post('/api/rezervacije/individualne/10');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('POTVRDJENA');
    expect(res.body.poruka).toBe('Termin je uspješno rezervisan.');
  });

  it('vraća NA_CEKANJU za nepouzdanog korisnika', async () => {
    createIndividualReservationService.mockResolvedValue({ tip: 'NA_CEKANJU' });

    const res = await request(app).post('/api/rezervacije/individualne/10');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('NA_CEKANJU');
  });

  it('vraća 404 kada termin nije dostupan', async () => {
    const error = new Error('Termin nije dostupan.');
    error.status = 404;
    error.code = 'TERMIN_NIJE_DOSTUPAN';
    createIndividualReservationService.mockRejectedValue(error);

    const res = await request(app).post('/api/rezervacije/individualne/10');

    expect(res.status).toBe(404);
    expect(res.body.greska).toBe('TERMIN_NIJE_DOSTUPAN');
  });

  it('vraća 409 za duplu rezervaciju', async () => {
    const error = new Error('Već imate rezervaciju.');
    error.status = 409;
    error.code = 'DUPLI_TERMIN';
    createIndividualReservationService.mockRejectedValue(error);

    const res = await request(app).post('/api/rezervacije/individualne/10');

    expect(res.status).toBe(409);
    expect(res.body.greska).toBe('DUPLI_TERMIN');
  });
});

// ─────────────────────────────────────────────
// DELETE /api/rezervacije/individualne/:id
// ─────────────────────────────────────────────
describe('DELETE /api/rezervacije/individualne/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('otkazuje rezervaciju i vraća poruku', async () => {
    cancelIndividualReservationService.mockResolvedValue({
      poruka: 'Rezervacija je uspješno otkazana.',
    });

    const res = await request(app).delete('/api/rezervacije/individualne/10');

    expect(res.status).toBe(200);
    expect(res.body.poruka).toBe('Rezervacija je uspješno otkazana.');
  });

  it('vraća 404 kada rezervacija ne postoji', async () => {
    const error = new Error('Rezervacija nije pronađena.');
    error.status = 404;
    error.code = 'REZERVACIJA_NIJE_PRONADJENA';
    cancelIndividualReservationService.mockRejectedValue(error);

    const res = await request(app).delete('/api/rezervacije/individualne/10');

    expect(res.status).toBe(404);
    expect(res.body.greska).toBe('REZERVACIJA_NIJE_PRONADJENA');
  });

  it('vraća 400 kada je termin već prošao', async () => {
    const error = new Error('Termin je već prošao.');
    error.status = 400;
    error.code = 'TERMIN_VEC_PROSAO';
    cancelIndividualReservationService.mockRejectedValue(error);

    const res = await request(app).delete('/api/rezervacije/individualne/10');

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('TERMIN_VEC_PROSAO');
  });
});

// ─────────────────────────────────────────────
// GET /api/rezervacije/moje
// ─────────────────────────────────────────────
describe('GET /api/rezervacije/moje', () => {
  beforeEach(() => jest.clearAllMocks());

  it('vraća listu rezervacija sa statusom 200', async () => {
    getMojeRezervacijeService.mockResolvedValue([
      {
        tip: 'INDIVIDUALNI',
        status: 'POTVRDJENA',
        vrijemePocetka: future,
        objekat: 'Arena',
      },
      {
        tip: 'GRUPNI',
        status: 'POTVRDJENA',
        vrijemePocetka: future,
        objekat: 'Sala',
        trener: 'Edin Trener',
      },
    ]);

    const res = await request(app).get('/api/rezervacije/moje');

    expect(res.status).toBe(200);
    expect(res.body.rezervacije).toHaveLength(2);
    expect(res.body.rezervacije[0].tip).toBe('INDIVIDUALNI');
    expect(res.body.rezervacije[1].tip).toBe('GRUPNI');
  });

  it('vraća praznu listu kada nema rezervacija', async () => {
    getMojeRezervacijeService.mockResolvedValue([]);

    const res = await request(app).get('/api/rezervacije/moje');

    expect(res.status).toBe(200);
    expect(res.body.rezervacije).toEqual([]);
  });

  it('vraća 500 za serversku grešku', async () => {
    getMojeRezervacijeService.mockRejectedValue(new Error('DB greška'));

    const res = await request(app).get('/api/rezervacije/moje');

    expect(res.status).toBe(500);
    expect(res.body.greska).toBe('SERVER_ERROR');
  });
});

// ─────────────────────────────────────────────
// POST /api/rezervacije/grupne/:id/prijave
// ─────────────────────────────────────────────
describe('POST /api/rezervacije/grupne/:id/prijave', () => {
  beforeEach(() => jest.clearAllMocks());

  it('prijavljuje korisnika na grupni trening', async () => {
    prijaviSeNaGrupniTreningService.mockResolvedValue({ prijavaId: 1 });

    const res = await request(app).post('/api/rezervacije/grupne/5/prijave');

    expect(res.status).toBe(200);
    expect(res.body.poruka).toBe('Uspješno ste se prijavili na grupni trening.');
  });

  it('vraća grešku kada je trening popunjen', async () => {
    const error = new Error('Trening je popunjen.');
    error.status = 400;
    error.code = 'TRENING_POPUNJEN';
    prijaviSeNaGrupniTreningService.mockRejectedValue(error);

    const res = await request(app).post('/api/rezervacije/grupne/5/prijave');

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('TRENING_POPUNJEN');
  });
});

// ─────────────────────────────────────────────
// GET /api/rezervacije/grupne/sve
// ─────────────────────────────────────────────
describe('GET /api/rezervacije/grupne/sve', () => {
  beforeEach(() => jest.clearAllMocks());

  it('vraća listu grupnih treninga', async () => {
    getGrupniTreninziService.mockResolvedValue([
      { treningId: 1, maksimalanBrojIgraca: 10 },
    ]);

    const res = await request(app).get('/api/rezervacije/grupne/sve');

    expect(res.status).toBe(200);
    expect(res.body.treninzi).toHaveLength(1);
  });

  it('vraća praznu listu kada nema treninga', async () => {
    getGrupniTreninziService.mockResolvedValue([]);

    const res = await request(app).get('/api/rezervacije/grupne/sve');

    expect(res.status).toBe(200);
    expect(res.body.treninzi).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// DELETE /api/rezervacije/grupne/:id/prijave
// ─────────────────────────────────────────────
describe('DELETE /api/rezervacije/grupne/:id/prijave', () => {
  beforeEach(() => jest.clearAllMocks());

  it('odjavljuje korisnika s grupnog treninga', async () => {
    odjaviSeSaGrupnogTreningaService.mockResolvedValue({
      poruka: 'Uspješno ste se odjavili.',
    });

    const res = await request(app)
      .delete('/api/rezervacije/grupne/5/prijave')
      .send({ razlog: 'Bolestan sam.' });

    expect(res.status).toBe(200);
    expect(res.body.poruka).toBe('Uspješno ste se odjavili.');
  });

  it('vraća grešku kada korisnik nije prijavljen', async () => {
    const error = new Error('Niste prijavljeni na ovaj trening.');
    error.status = 404;
    error.code = 'PRIJAVA_NIJE_PRONADJENA';
    odjaviSeSaGrupnogTreningaService.mockRejectedValue(error);

    const res = await request(app)
      .delete('/api/rezervacije/grupne/5/prijave')
      .send({ razlog: '' });

    expect(res.status).toBe(404);
    expect(res.body.greska).toBe('PRIJAVA_NIJE_PRONADJENA');
  });
});