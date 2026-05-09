const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/controllers/adminController', () => ({
  getKorisnici: jest.fn((req, res) => res.status(200).json({
    korisnici: [
      {
        korisnikId: 1,
        punoIme: 'Admin Test',
        email: 'admin@example.com',
        uloga: 'ADMINISTRATOR',
        statusUloge: 'ODOBREN',
        statusPouzdanosti: 'AKTIVAN',
      },
    ],
  })),
  obradiZahtjevUloge: jest.fn((req, res) => {
    const korisnikId = Number(req.params.id);
    const { akcija } = req.body;

    if (!['ODOBRI', 'ODBIJ'].includes(akcija)) {
      return res.status(400).json({ greska: 'NEISPRAVNA_AKCIJA' });
    }

    if (korisnikId === 999) {
      return res.status(404).json({ greska: 'KORISNIK_NIJE_PRONADJEN' });
    }

    return res.status(200).json({
      poruka: akcija === 'ODOBRI' ? 'Uloga uspjesno odobrena.' : 'Zahtjev odbijen.',
      korisnik: {
        korisnikId,
        email: 'user@example.com',
        uloga: akcija === 'ODOBRI' ? 'TRENER' : 'NAVIJAC',
        trazenaUloga: 'TRENER',
        statusUloge: akcija === 'ODOBRI' ? 'ODOBREN' : 'ODBIJEN',
      },
    });
  }),
  obrisiKorisnika: jest.fn((req, res) => {
    const korisnikId = Number(req.params.id);

    if (korisnikId === 999) {
      return res.status(404).json({ greska: 'KORISNIK_NIJE_PRONADJEN' });
    }

    return res.status(200).json({ poruka: 'Korisnik uspjesno obrisan.' });
  }),
  blokirajKorisnika: jest.fn((req, res) => {
    const korisnikId = Number(req.params.id);
    const { akcija } = req.body;

    if (!['BLOKIRAJ', 'ODBLOKIRAJ'].includes(akcija)) {
      return res.status(400).json({ greska: 'NEISPRAVNA_AKCIJA' });
    }

    if (korisnikId === 999) {
      return res.status(404).json({ greska: 'KORISNIK_NIJE_PRONADJEN' });
    }

    return res.status(200).json({
      poruka: akcija === 'BLOKIRAJ' ? 'Korisnik blokiran.' : 'Korisnik odblokiran.',
      korisnik: {
        korisnikId,
        email: 'user@example.com',
        uloga: 'NAVIJAC',
        statusPouzdanosti: akcija === 'BLOKIRAJ' ? 'BLOKIRAN' : 'AKTIVAN',
      },
    });
  }),
}));

const adminRoutes = require('../../src/routes/adminRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  return app;
}

function tokenFor(uloga) {
  return jwt.sign(
    { korisnikId: 100, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

describe('Sprint 6 admin user routes', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'admin-routes-secret' };
    app = buildTestApp();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('admin moze dohvatiti listu korisnika', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.korisnici)).toBe(true);
  });

  test('ne-admin korisnik ne moze dohvatiti listu korisnika', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'ZABRANJEN_PRISTUP' }));
  });

  test('zahtjev bez tokena ne moze dohvatiti listu korisnika', async () => {
    const res = await request(app).get('/api/admin/korisnici');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEOVLASTEN' }));
  });

  test('admin moze blokirati korisnika ako endpoint postoji', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/2/blokiranje')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ akcija: 'BLOKIRAJ' });

    expect(res.status).toBe(200);
    expect(res.body.korisnik).toEqual(expect.objectContaining({ statusPouzdanosti: 'BLOKIRAN' }));
  });

  test('admin moze obrisati korisnika ako endpoint postoji', async () => {
    const res = await request(app)
      .delete('/api/admin/korisnici/2')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ poruka: expect.any(String) }));
  });

  test('admin moze odobriti posebnu ulogu ako endpoint postoji', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/2/uloga')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ akcija: 'ODOBRI' });

    expect(res.status).toBe(200);
    expect(res.body.korisnik).toEqual(expect.objectContaining({ statusUloge: 'ODOBREN' }));
  });

  test('admin moze odbiti posebnu ulogu ako endpoint postoji', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/2/uloga')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ akcija: 'ODBIJ', razlog: 'Dokumentacija nije potpuna.' });

    expect(res.status).toBe(200);
    expect(res.body.korisnik).toEqual(expect.objectContaining({ statusUloge: 'ODBIJEN' }));
  });

  test('admin ruta ne vraca plain password ili password hash u response-u', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(JSON.stringify(res.body)).not.toContain('lozinka');
    expect(JSON.stringify(res.body)).not.toContain('password');
    expect(JSON.stringify(res.body)).not.toContain('lozinkaHash');
  });

  test('pokusaj rada nad nepostojecim korisnikom vraca odgovarajuci error response', async () => {
    const res = await request(app)
      .delete('/api/admin/korisnici/999')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'KORISNIK_NIJE_PRONADJEN' }));
  });

  test('pokusaj slanja nevalidnih podataka vraca validacijsku gresku ako je implementirano', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/2/blokiranje')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ akcija: 'NEVALIDNO' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEISPRAVNA_AKCIJA' }));
  });
});
