const request = require('supertest');

const users = [];

const mockPrisma = {
  korisnik: {
    deleteMany: jest.fn().mockImplementation((args) => {
      const email = args.where.email;
      const index = users.findIndex(u => u.email === email);
      if (index !== -1) {
        users.splice(index, 1);
      }
      return Promise.resolve({ count: 1 });
    }),
    create: jest.fn().mockImplementation((args) => {
      const newUser = {
        korisnikId: 1,
        email: args.data.email,
        lozinkaHash: args.data.lozinkaHash,
        punoIme: args.data.punoIme,
        uloga: args.data.uloga || 'NAVIJAC',
        trazenaUloga: args.data.trazenaUloga,
        statusUloge: args.data.statusUloge || 'ODOBREN',
        refreshToken: null,
      };
      users.push(newUser);
      return Promise.resolve(newUser);
    }),
    findUnique: jest.fn().mockImplementation((args) => {
      if (args.where.email) {
        const email = args.where.email;
        const user = users.find(u => u.email === email);
        return Promise.resolve(user || null);
      }
      if (args.where.korisnikId) {
        const id = args.where.korisnikId;
        const user = users.find(u => u.korisnikId === id);
        return Promise.resolve(user || null);
      }
      return Promise.resolve(null);
    }),
    update: jest.fn().mockImplementation((args) => {
      const email = args.where.email;
      const user = users.find(u => u.email === email);
      if (user) {
        Object.assign(user, args.data);
      }
      return Promise.resolve(user || {});
    }),
  },
  $disconnect: jest.fn().mockResolvedValue(true),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const app = require('../../src/app');

describe('INTEGRACIJSKI TEST: Auth Rute (Maida)', () => {
  let token;
  const email = `test.${Date.now()}@sport.ba`;

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        punoIme: 'Test Korisnik',
        email,
        lozinka: 'Lozinka123!',
        potvrdalozinke: 'Lozinka123!',
        trazenaUloga: 'NAVIJAC'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, lozinka: 'Lozinka123!' });

    token = loginRes.body.access_token;
  });

  test('GET /api/auth/profile - Treba vratiti 200 i uspjeh', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.uspjeh).toBe(true);
    expect(res.body.korisnik).toHaveProperty('punoIme');
  });

  test('GET /api/auth/profile - Treba vratiti 401 ako nema tokena', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toBe(401);
  });
});
