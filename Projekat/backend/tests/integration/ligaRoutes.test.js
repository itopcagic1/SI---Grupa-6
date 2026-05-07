const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/ligaService', () => ({
  kreirajLigu: jest.fn(),
  dohvatiSveLige: jest.fn(),
  dohvatiLiguPoId: jest.fn(),
  izmijeniLigu: jest.fn(),
  obrisiLigu: jest.fn(),
  dodajTimULigu: jest.fn(),
  ukloniTimIzLige: jest.fn(),
}));

const ligaService = require('../../src/services/ligaService');
const ligaRoutes = require('../../src/routes/ligaRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/lige', ligaRoutes);
  return app;
}

function tokenFor(uloga, korisnikId = 100) {
  return jwt.sign(
    { korisnikId, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

describe('Sprint 6 liga routes', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'liga-routes-secret' };
    app = buildTestApp();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('dohvat liste liga', async () => {
    ligaService.dohvatiSveLige.mockResolvedValue([
      { takmicenjeId: 1, naziv: 'Premijer liga', sportId: 1 },
    ]);

    const res = await request(app).get('/api/lige');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ ukupno: 1 }));
    expect(res.body.lige).toEqual([expect.objectContaining({ naziv: 'Premijer liga' })]);
  });

  test('dohvat pojedinacne lige ako endpoint postoji', async () => {
    ligaService.dohvatiLiguPoId.mockResolvedValue({
      takmicenjeId: 1,
      naziv: 'Premijer liga',
      sportId: 1,
    });

    const res = await request(app).get('/api/lige/1');

    expect(res.status).toBe(200);
    expect(res.body.liga).toEqual(expect.objectContaining({ takmicenjeId: 1 }));
  });

  test('kreiranje lige sa validnim podacima', async () => {
    ligaService.kreirajLigu.mockResolvedValue({
      takmicenjeId: 2,
      naziv: 'Nova liga',
      sportId: 1,
      status: 'AKTIVNA',
    });

    const res = await request(app)
      .post('/api/lige')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ naziv: 'Nova liga', sportId: 1, sezona: '2026/2027' });

    expect(res.status).toBe(201);
    expect(res.body.liga).toEqual(expect.objectContaining({ naziv: 'Nova liga' }));
  });

  test('kreiranje lige bez obaveznog naziva treba biti blokirano ako je validacija implementirana', async () => {
    const res = await request(app)
      .post('/api/lige')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ sportId: 1 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'GRESKA_VALIDACIJE' }));
    expect(ligaService.kreirajLigu).not.toHaveBeenCalled();
  });

  test('kreiranje lige bez sporta treba biti blokirano ako je validacija implementirana', async () => {
    const res = await request(app)
      .post('/api/lige')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ naziv: 'Liga bez sporta' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'GRESKA_VALIDACIJE' }));
  });

  test('kreiranje lige sa nepostojecim sportom treba biti blokirano ako je validacija implementirana', async () => {
    ligaService.kreirajLigu.mockRejectedValue(
      Object.assign(new Error('Sport sa zadanim ID-em ne postoji'), {
        status: 404,
        code: 'SPORT_NIJE_PRONADJEN',
      })
    );

    const res = await request(app)
      .post('/api/lige')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ naziv: 'Liga', sportId: 999 });

    expect(res.status).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'SPORT_NIJE_PRONADJEN' }));
  });

  test('kreiranje duple lige treba biti blokirano ako je implementirano', async () => {
    ligaService.kreirajLigu.mockRejectedValue(
      Object.assign(new Error('Liga sa ovim nazivom vec postoji'), {
        status: 409,
        code: 'LIGA_VEC_POSTOJI',
      })
    );

    const res = await request(app)
      .post('/api/lige')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ naziv: 'Premijer liga', sportId: 1 });

    expect(res.status).toBe(409);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'LIGA_VEC_POSTOJI' }));
  });

  test('uredjivanje lige sa validnim podacima', async () => {
    ligaService.izmijeniLigu.mockResolvedValue({
      takmicenjeId: 1,
      naziv: 'Izmijenjena liga',
      sportId: 1,
    });

    const res = await request(app)
      .patch('/api/lige/1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ naziv: 'Izmijenjena liga' });

    expect(res.status).toBe(200);
    expect(res.body.liga).toEqual(expect.objectContaining({ naziv: 'Izmijenjena liga' }));
  });

  test('brisanje lige', async () => {
    ligaService.obrisiLigu.mockResolvedValue({ takmicenjeId: 1 });

    const res = await request(app)
      .delete('/api/lige/1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ takmicenjeId: 1 }));
  });

  test('brisanje nepostojece lige vraca odgovarajuci error response', async () => {
    ligaService.obrisiLigu.mockRejectedValue(
      Object.assign(new Error('Liga sa zadanim ID-em ne postoji'), {
        status: 404,
        code: 'LIGA_NIJE_PRONADJENA',
      })
    );

    const res = await request(app)
      .delete('/api/lige/999')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'LIGA_NIJE_PRONADJENA' }));
  });

  test('dodavanje postojeceg tima u postojecu ligu', async () => {
    ligaService.dodajTimULigu.mockResolvedValue({
      ucesceUTakmicenjuId: 1,
      takmicenjeId: 1,
      timId: 2,
      tim: { timId: 2, naziv: 'FK Test' },
    });

    const res = await request(app)
      .post('/api/lige/1/timovi')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ timId: 2 });

    expect(res.status).toBe(201);
    expect(res.body.rezultat).toEqual(expect.objectContaining({ timId: 2 }));
  });

  test('pokusaj dodavanja istog tima dva puta u istu ligu treba biti blokiran', async () => {
    ligaService.dodajTimULigu.mockRejectedValue(
      Object.assign(new Error('Tim je vec dodan u ovu ligu.'), { status: 409 })
    );

    const res = await request(app)
      .post('/api/lige/1/timovi')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ timId: 2 });

    expect(res.status).toBe(409);
    expect(res.body).toEqual(expect.objectContaining({ poruka: expect.any(String) }));
  });

  test('pokusaj dodavanja nepostojeceg tima u ligu vraca error response', async () => {
    ligaService.dodajTimULigu.mockRejectedValue(
      Object.assign(new Error('Tim sa zadanim ID-em ne postoji'), { status: 404 })
    );

    const res = await request(app)
      .post('/api/lige/1/timovi')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ timId: 999 });

    expect(res.status).toBe(404);
  });

  test('pokusaj dodavanja tima u nepostojecu ligu vraca error response', async () => {
    ligaService.dodajTimULigu.mockRejectedValue(
      Object.assign(new Error('Liga sa zadanim ID-em ne postoji'), { status: 404 })
    );

    const res = await request(app)
      .post('/api/lige/999/timovi')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ timId: 2 });

    expect(res.status).toBe(404);
  });

  test('uklanjanje tima iz lige', async () => {
    ligaService.ukloniTimIzLige.mockResolvedValue({ ucesceUTakmicenjuId: 1 });

    const res = await request(app)
      .delete('/api/lige/1/timovi/2')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ uspjeh: true }));
  });

  test('uklanjanje tima koji nije u ligi vraca odgovarajuci error response ako je implementirano', async () => {
    ligaService.ukloniTimIzLige.mockRejectedValue(
      Object.assign(new Error('Tim nije pronadjen u ovoj ligi.'), { status: 404 })
    );

    const res = await request(app)
      .delete('/api/lige/1/timovi/999')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(404);
  });

  test('ne-admin ili neovlasten korisnik ne moze kreirati ligu ako ruta po zahtjevu treba biti zasticena', async () => {
    const res = await request(app)
      .post('/api/lige')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`)
      .send({ naziv: 'Liga', sportId: 1 });

    expect(res.status).toBe(403);
  });

  test('ne-admin ili neovlasten korisnik ne moze uredjivati ligu ako ruta po zahtjevu treba biti zasticena', async () => {
    const res = await request(app)
      .patch('/api/lige/1')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`)
      .send({ naziv: 'Liga' });

    expect(res.status).toBe(403);
  });

  test('ne-admin ili neovlasten korisnik ne moze brisati ligu ako ruta po zahtjevu treba biti zasticena', async () => {
    const res = await request(app)
      .delete('/api/lige/1')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`);

    expect(res.status).toBe(403);
  });

  test('zahtjev bez tokena ne moze kreirati/urediti/brisati ligu ako su rute zasticene', async () => {
    const createRes = await request(app).post('/api/lige').send({ naziv: 'Liga', sportId: 1 });
    const updateRes = await request(app).patch('/api/lige/1').send({ naziv: 'Liga' });
    const deleteRes = await request(app).delete('/api/lige/1');

    expect(createRes.status).toBe(401);
    expect(updateRes.status).toBe(401);
    expect(deleteRes.status).toBe(401);
  });

  test('response ne smije sadrzavati password/passwordHash/hash polja kroz ukljucene relacije', async () => {
    ligaService.dohvatiLiguPoId.mockResolvedValue({
      takmicenjeId: 1,
      naziv: 'Premijer liga',
      organizator: { korisnikId: 1, punoIme: 'Admin', email: 'admin@example.com' },
      ucesniciTakmicenja: [{ tim: { timId: 2, naziv: 'FK Test' } }],
    });

    const res = await request(app).get('/api/lige/1');
    const body = JSON.stringify(res.body);

    expect(body).not.toContain('lozinka');
    expect(body).not.toContain('password');
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });
});
