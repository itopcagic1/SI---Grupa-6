const request = require('supertest');
const app = require('../../src/app');

describe('INTEGRACIJSKI TEST: Auth Rute (Maida)', () => {
  let token;

  beforeAll(async () => {
  // Pokušaj registraciju (ignoriši grešku ako već postoji)
  await request(app)
    .post('/api/auth/register')
    .send({
      punoIme: 'Test Korisnik',
      email: 'test@sport.ba',
      lozinka: 'Lozinka123!',
      potvrdalozinke: 'Lozinka123!',
      trazenaUloga: 'NAVIJAC'
    });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@sport.ba', lozinka: 'Lozinka123!' });

  token = loginRes.body.access_token;
});

  // Testiramo GET /profile 
  test('GET /api/auth/profile - Treba vratiti 200 i uspjeh', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`); 

    expect(res.statusCode).toBe(200);
    expect(res.body.uspjeh).toBe(true);
    expect(res.body.korisnik).toHaveProperty('punoIme');
  });

  // Testiramo zaštitu (Security)
  test('GET /api/auth/profile - Treba vratiti 401 ako nema tokena', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401); // Middleware mora odbiti pristup
  });
});