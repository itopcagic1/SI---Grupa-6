// facilityRoutes.integration.test.js
// Integracijski testovi za /api/objekti rute — koristi Supertest + mockan facilityService

const request = require('supertest');
const express = require('express');

// ─── Mock facilityService ──────────────────────────────────────────────────
jest.mock('../../src/services/facilityService');
const facilityService = require('../../src/services/facilityService');

// ─── Mock authMiddleware ───────────────────────────────────────────────────
jest.mock('../../src/middleware/authMiddleware', () => ({
  authenticateToken: (req, res, next) => {
    // Simulira ulogovanog vlasnika za sve zaštićene rute
    req.user = { korisnikId: 1, uloga: 'VLASNIK' };
    next();
  },
}));

const facilityRoutes = require('../../src/routes/facilityRoutes');

// ─── Postavi Express app za testove ───────────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api', facilityRoutes);

// ─── Pomoćni podaci ────────────────────────────────────────────────────────
const mockObjekat = {
  objekatId: 1,
  naziv: 'Zetra Dvorana',
  adresa: 'Koševo 4, Sarajevo',
  kapacitet: 10,
  status: 'AKTIVAN',
  vlasnikId: 1,
};

beforeEach(() => jest.clearAllMocks());

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/objekti — Kreiranje objekta
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/objekti', () => {
  test('201 — uspješno kreira objekat s validnim podacima', async () => {
    facilityService.createFacilityService.mockResolvedValue(mockObjekat);

    const res = await request(app)
      .post('/api/objekti')
      .send({ naziv: 'Zetra Dvorana', adresa: 'Koševo 4', kapacitet: 10 });

    expect(res.status).toBe(201);
    expect(res.body.naziv).toBe('Zetra Dvorana');
    expect(facilityService.createFacilityService).toHaveBeenCalledTimes(1);
  });

  test('500 — vraća grešku ako service baci izuzetak', async () => {
    facilityService.createFacilityService.mockRejectedValue(new Error('DB greška'));

    const res = await request(app)
      .post('/api/objekti')
      .send({ naziv: 'Teren', kapacitet: 10 });

    expect(res.status).toBe(500);
    expect(res.body.error).toContain('DB greška');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/objekti — Lista objekata
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/objekti', () => {
  test('200 — vraća listu objekata', async () => {
    facilityService.getAllFacilitiesService.mockResolvedValue([mockObjekat]);

    const res = await request(app).get('/api/objekti');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].naziv).toBe('Zetra Dvorana');
  });

  test('200 — vraća praznu listu ako nema objekata', async () => {
    facilityService.getAllFacilitiesService.mockResolvedValue([]);

    const res = await request(app).get('/api/objekti');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  test('500 — vraća grešku ako service baci izuzetak', async () => {
    facilityService.getAllFacilitiesService.mockRejectedValue(new Error('DB greška'));

    const res = await request(app).get('/api/objekti');

    expect(res.status).toBe(500);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/objekti/:id — Detalji objekta
// ══════════════════════════════════════════════════════════════════════════════

describe('GET /api/objekti/:id', () => {
  test('200 — vraća detalje postojećeg objekta', async () => {
    facilityService.getFacilityByIdService.mockResolvedValue(mockObjekat);

    const res = await request(app).get('/api/objekti/1');

    expect(res.status).toBe(200);
    expect(res.body.naziv).toBe('Zetra Dvorana');
  });

  test('404 — vraća grešku ako objekat ne postoji', async () => {
    facilityService.getFacilityByIdService.mockResolvedValue(null);

    const res = await request(app).get('/api/objekti/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Sportski objekat nije pronađen.');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/objekti/:id — Izmjena objekta
// ══════════════════════════════════════════════════════════════════════════════

describe('PUT /api/objekti/:id', () => {
  test('200 — uspješno ažurira objekat', async () => {
    const azuriran = { ...mockObjekat, naziv: 'Novi naziv' };
    facilityService.updateFacilityService.mockResolvedValue(azuriran);

    const res = await request(app)
      .put('/api/objekti/1')
      .send({ naziv: 'Novi naziv' });

    expect(res.status).toBe(200);
    expect(res.body.naziv).toBe('Novi naziv');
  });

  test('500 — vraća grešku ako korisnik nije vlasnik', async () => {
    const err = new Error('Nemate pravo kreirati termine za ovaj sportski objekat.');
    err.status = 403;
    facilityService.updateFacilityService.mockRejectedValue(err);

    const res = await request(app)
      .put('/api/objekti/1')
      .send({ naziv: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/objekti/:id — Soft-delete
// ══════════════════════════════════════════════════════════════════════════════

describe('DELETE /api/objekti/:id', () => {
  test('200 — uspješno deaktivira objekat', async () => {
    facilityService.deleteFacilityService.mockResolvedValue({ ...mockObjekat, status: 'NEAKTIVAN' });

    const res = await request(app).delete('/api/objekti/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deaktiviran');
  });

  test('500 — vraća grešku ako objekat ne postoji', async () => {
    facilityService.deleteFacilityService.mockRejectedValue(new Error('Sportski objekat ne postoji.'));

    const res = await request(app).delete('/api/objekti/999');

    expect(res.status).toBe(500);
    expect(res.body.error).toContain('ne postoji');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/objekti/:id/termini — Kreiranje termina
// ══════════════════════════════════════════════════════════════════════════════

describe('POST /api/objekti/:id/termini', () => {
  const mockTermin = {
    terminId: 1,
    objekatId: 1,
    vrijemePocetka: '2026-06-01T10:00:00.000Z',
    vrijemeZavrsetka: '2026-06-01T11:00:00.000Z',
    status: 'SLOBODAN',
  };

  test('201 — uspješno kreira termine', async () => {
    facilityService.createFacilityTermsService.mockResolvedValue([mockTermin]);

    const res = await request(app)
      .post('/api/objekti/1/termini')
      .send({ vrijemePocetka: '2026-06-01T10:00:00.000Z', trajanje: 60, ponavljanje: 'JEDNOM' });

    expect(res.status).toBe(201);
    expect(res.body.termini).toHaveLength(1);
    expect(res.body.brojKreiranihTermina).toBe(1);
  });

  test('400 — vraća grešku za preklapanje termina', async () => {
    const err = new Error('Termin se preklapa sa postojecim terminom objekta.');
    err.status = 400;
    err.code = 'TERMIN_SE_PREKLAPA';
    facilityService.createFacilityTermsService.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/objekti/1/termini')
      .send({ vrijemePocetka: '2026-06-01T10:00:00.000Z', trajanje: 60 });

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('TERMIN_SE_PREKLAPA');
  });
});