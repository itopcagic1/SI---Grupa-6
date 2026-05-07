const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../../../src/middleware/authMiddleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authenticateToken middleware', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('zahtjev bez tokena se odbija', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'NEOVLASTEN' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('zahtjev sa nevalidnim tokenom se odbija', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'TOKEN_ISTEKAO' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('zahtjev sa laznim ili pokvarenim tokenom se odbija', () => {
    const req = { headers: { authorization: 'Bearer abc.def.ghi' } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'TOKEN_ISTEKAO' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('zahtjev sa validnim tokenom prolazi dalje bez stvarne baze', () => {
    const payload = {
      korisnikId: 1,
      email: 'admin@example.com',
      uloga: 'ADMINISTRATOR',
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(req.user).toEqual(expect.objectContaining(payload));
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('middleware ne dodaje plain password ili hash u req.user', () => {
    const payload = {
      korisnikId: 2,
      email: 'user@example.com',
      uloga: 'NAVIJAC',
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(req.user).not.toHaveProperty('lozinka');
    expect(req.user).not.toHaveProperty('password');
    expect(req.user).not.toHaveProperty('lozinkaHash');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
