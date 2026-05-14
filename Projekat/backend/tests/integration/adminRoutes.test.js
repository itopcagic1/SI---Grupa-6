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

  getBlokiraniKorisnici: jest.fn((req, res) => res.status(200).json({
    korisnici: [
      {
        korisnikId: 10,
        punoIme: 'Blokirani Korisnik',
        email: 'blokiran@example.com',
        uloga: 'NAVIJAC',
        statusPouzdanosti: 'BLOKIRAN',
        razlogBlokiranja: 'Kršenje pravila.',
        brojPreksrenihRezervacija: 3,
      },
    ],
  })),

  getKorisnikDetalji: jest.fn((req, res) => {
    const korisnikId = Number(req.params.id);
    if (korisnikId === 999) {
      return res.status(404).json({ greska: 'KORISNIK_NIJE_PRONADJEN' });
    }
    return res.status(200).json({
      korisnik: {
        korisnikId,
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        uloga: 'NAVIJAC',
        statusPouzdanosti: 'AKTIVAN',
        razlogBlokiranja: null,
        brojPreksrenihRezervacija: 0,
        datumKreiranja: new Date('2026-01-01'),
      },
    });
  }),

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
    const { akcija, razlog } = req.body;

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
        razlogBlokiranja: akcija === 'BLOKIRAJ' ? (razlog || null) : null,
      },
    });
  }),

  promijeniUlogu: jest.fn((req, res) => {
    const { novaUloga } = req.body;
    const dozvoljenUloge = ['ADMINISTRATOR', 'ORGANIZATOR', 'TRENER', 'IGRAC', 'VLASNIK', 'NAVIJAC'];
    if (!dozvoljenUloge.includes(novaUloga)) {
      return res.status(400).json({ greska: 'NEISPRAVNA_ULOGA' });
    }
    return res.status(200).json({
      poruka: `Uloga promijenjena u ${novaUloga}.`,
      korisnik: {
        korisnikId: Number(req.params.id),
        uloga: novaUloga,
        statusUloge: 'ODOBREN',
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

describe('Sprint 6 admin routes - novi endpointi', () => {
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

  // ─── GET /korisnici/blokirani ────────────────────────────────────

  test('admin moze dohvatiti listu blokiranih korisnika', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/blokirani')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.korisnici)).toBe(true);
    expect(res.body.korisnici[0]).toEqual(
      expect.objectContaining({ statusPouzdanosti: 'BLOKIRAN' })
    );
  });

  test('blokirani korisnici odgovor sadrzi razlogBlokiranja i brojPreksrenihRezervacija', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/blokirani')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body.korisnici[0]).toEqual(
      expect.objectContaining({
        razlogBlokiranja: expect.any(String),
        brojPreksrenihRezervacija: expect.any(Number),
      })
    );
  });

  test('ne-admin ne moze dohvatiti listu blokiranih korisnika', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/blokirani')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`);

    expect(res.status).toBe(403);
  });

  test('zahtjev bez tokena ne moze dohvatiti blokirane korisnike', async () => {
    const res = await request(app).get('/api/admin/korisnici/blokirani');
    expect(res.status).toBe(401);
  });

  test('blokirani endpoint ne vraca osjetljive podatke', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/blokirani')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(JSON.stringify(res.body)).not.toContain('lozinkaHash');
    expect(JSON.stringify(res.body)).not.toContain('refreshToken');
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  // ─── GET /korisnici/:id ──────────────────────────────────────────

  test('admin moze dohvatiti detalje korisnika po ID-u', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/5')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body.korisnik).toEqual(
      expect.objectContaining({ korisnikId: 5 })
    );
  });

  test('detalji korisnika sadrze razlogBlokiranja i brojPreksrenihRezervacija', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/5')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body.korisnik).toHaveProperty('razlogBlokiranja');
    expect(res.body.korisnik).toHaveProperty('brojPreksrenihRezervacija');
  });

  test('dohvat nepostojeceg korisnika vraca 404', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/999')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      expect.objectContaining({ greska: 'KORISNIK_NIJE_PRONADJEN' })
    );
  });

  test('ne-admin ne moze dohvatiti detalje korisnika', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/5')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`);

    expect(res.status).toBe(403);
  });

  test('detalji endpoint ne vraca osjetljive podatke', async () => {
    const res = await request(app)
      .get('/api/admin/korisnici/5')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(JSON.stringify(res.body)).not.toContain('lozinkaHash');
    expect(JSON.stringify(res.body)).not.toContain('refreshToken');
  });

  // ─── PATCH /korisnici/:id/blokiranje - razlog ────────────────────

  test('blokiranje korisnika sa razlogom vraca razlogBlokiranja u odgovoru', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/5/blokiranje')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ akcija: 'BLOKIRAJ', razlog: 'Kršenje pravila platforme.' });

    expect(res.status).toBe(200);
    expect(res.body.korisnik).toEqual(
      expect.objectContaining({
        statusPouzdanosti: 'BLOKIRAN',
        razlogBlokiranja: 'Kršenje pravila platforme.',
      })
    );
  });

  test('odblokiravanje korisnika postavlja razlogBlokiranja na null', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/5/blokiranje')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ akcija: 'ODBLOKIRAJ' });

    expect(res.status).toBe(200);
    expect(res.body.korisnik).toEqual(
      expect.objectContaining({
        statusPouzdanosti: 'AKTIVAN',
        razlogBlokiranja: null,
      })
    );
  });

  // ─── PATCH /korisnici/:id/promijeni-ulogu ───────────────────────

  test('admin moze promijeniti ulogu korisnika', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/5/promijeni-ulogu')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ novaUloga: 'TRENER' });

    expect(res.status).toBe(200);
    expect(res.body.korisnik).toEqual(
      expect.objectContaining({ uloga: 'TRENER', statusUloge: 'ODOBREN' })
    );
  });

  test('promjena uloge vraca 400 za neispravnu ulogu', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/5/promijeni-ulogu')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ novaUloga: 'NEPOSTOJI' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ greska: 'NEISPRAVNA_ULOGA' })
    );
  });

  test('ne-admin ne moze promijeniti ulogu korisnika', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/5/promijeni-ulogu')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`)
      .send({ novaUloga: 'TRENER' });

    expect(res.status).toBe(403);
  });

  test('zahtjev bez tokena ne moze promijeniti ulogu', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/5/promijeni-ulogu')
      .send({ novaUloga: 'TRENER' });

    expect(res.status).toBe(401);
  });

  test('promjena uloge ne vraca osjetljive podatke', async () => {
    const res = await request(app)
      .patch('/api/admin/korisnici/5/promijeni-ulogu')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ novaUloga: 'TRENER' });

    expect(JSON.stringify(res.body)).not.toContain('lozinkaHash');
    expect(JSON.stringify(res.body)).not.toContain('refreshToken');
  });
});