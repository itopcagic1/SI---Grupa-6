const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/pdfService', () => ({
  generateTabelaPDF:    jest.fn(),
  generateRezultatiPDF: jest.fn(),
  generateRasporedPDF:  jest.fn(),
}));

const pdfService = require('../../src/services/pdfService');
const pdfRoutes  = require('../../src/routes/pdfRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/pdf', pdfRoutes);
  return app;
}

function tokenFor(uloga, korisnikId = 100) {
  return jwt.sign(
    { korisnikId, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

const fakePdfBuffer = Buffer.from('%PDF-1.4 fake pdf content');

describe('pdfRoutes', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'pdf-routes-secret' };
    app = buildTestApp();
    pdfService.generateRezultatiPDF.mockResolvedValue(fakePdfBuffer);
    pdfService.generateRasporedPDF.mockResolvedValue(fakePdfBuffer);
    pdfService.generateTabelaPDF.mockResolvedValue(fakePdfBuffer);
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  // ── Autorizacija ────────────────────────────────────────────────────────────

  test('zahtjev bez tokena vraca 401 na svim rutama', async () => {
    const res1 = await request(app).get('/api/pdf/rezultati?takmicenjeId=1');
    const res2 = await request(app).get('/api/pdf/raspored?takmicenjeId=1');
    const res3 = await request(app).get('/api/pdf/tabela?takmicenjeId=1');

    expect(res1.status).toBe(401);
    expect(res2.status).toBe(401);
    expect(res3.status).toBe(401);
  });

  test('IGRAC ne moze preuzeti PDF (403)', async () => {
    const res = await request(app)
      .get('/api/pdf/rezultati?takmicenjeId=1')
      .set('Authorization', `Bearer ${tokenFor('IGRAC')}`);

    expect(res.status).toBe(403);
    expect(pdfService.generateRezultatiPDF).not.toHaveBeenCalled();
  });

  test('ADMINISTRATOR moze preuzeti PDF rezultata', async () => {
    const res = await request(app)
      .get('/api/pdf/rezultati?takmicenjeId=1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  test('ORGANIZATOR moze preuzeti PDF rasporeda', async () => {
    const res = await request(app)
      .get('/api/pdf/raspored?takmicenjeId=1')
      .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR')}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  test('TRENER moze preuzeti PDF rezultata', async () => {
    const res = await request(app)
      .get('/api/pdf/rezultati?takmicenjeId=1')
      .set('Authorization', `Bearer ${tokenFor('TRENER')}`);

    expect(res.status).toBe(200);
  });

  // ── Validacija parametara ───────────────────────────────────────────────────

  test('GET /rezultati bez takmicenjeId vraca 400', async () => {
    const res = await request(app)
      .get('/api/pdf/rezultati')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('NEDOSTAJE_PARAMETAR');
    expect(pdfService.generateRezultatiPDF).not.toHaveBeenCalled();
  });

  test('GET /raspored bez takmicenjeId vraca 400', async () => {
    const res = await request(app)
      .get('/api/pdf/raspored')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('NEDOSTAJE_PARAMETAR');
  });

  test('GET /tabela bez takmicenjeId vraca 400', async () => {
    const res = await request(app)
      .get('/api/pdf/tabela')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(400);
    expect(res.body.greska).toBe('NEDOSTAJE_PARAMETAR');
  });

  // ── Uspjesni scenariji ──────────────────────────────────────────────────────

  test('GET /rezultati vraca PDF sa ispravnim headerima', async () => {
    const res = await request(app)
      .get('/api/pdf/rezultati?takmicenjeId=1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('rezultati.pdf');
  });

  test('GET /raspored vraca PDF sa ispravnim headerima', async () => {
    const res = await request(app)
      .get('/api/pdf/raspored?takmicenjeId=1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('raspored.pdf');
  });

  test('GET /tabela vraca PDF sa ispravnim headerima', async () => {
    const res = await request(app)
      .get('/api/pdf/tabela?takmicenjeId=1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('tabela.pdf');
  });

  test('GET /rezultati prosljedjuje datumOd i datumDo servisu', async () => {
    await request(app)
      .get('/api/pdf/rezultati?takmicenjeId=1&datumOd=2026-05-01&datumDo=2026-05-31')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(pdfService.generateRezultatiPDF).toHaveBeenCalledWith('1', '2026-05-01', '2026-05-31');
  });

  test('GET /raspored prosljedjuje datumOd i datumDo servisu', async () => {
    await request(app)
      .get('/api/pdf/raspored?takmicenjeId=2&datumOd=2026-06-01&datumDo=2026-06-30')
      .set('Authorization', `Bearer ${tokenFor('ORGANIZATOR')}`);

    expect(pdfService.generateRasporedPDF).toHaveBeenCalledWith('2', '2026-06-01', '2026-06-30');
  });

  // ── Greske servisa ──────────────────────────────────────────────────────────

  test('vraca 404 kada takmicenje nije pronadjeno', async () => {
    pdfService.generateRezultatiPDF.mockRejectedValue(new Error('Takmicenje nije pronađeno'));

    const res = await request(app)
      .get('/api/pdf/rezultati?takmicenjeId=999')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(404);
    expect(res.body.greska).toBe('NIJE_PRONADJENO');
  });

  test('vraca 500 na neocekivanu gresku servisa', async () => {
    pdfService.generateRasporedPDF.mockRejectedValue(new Error('Baza nedostupna'));

    const res = await request(app)
      .get('/api/pdf/raspored?takmicenjeId=1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(500);
    expect(res.body.greska).toBe('GRESKA_SERVERA');
  });
});
