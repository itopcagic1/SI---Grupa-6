const { requireRole } = require('../../../src/middleware/roleMiddleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireRole middleware', () => {
  test('ADMINISTRATOR ima pristup admin-only ruti', () => {
    const req = { user: { korisnikId: 1, uloga: 'ADMINISTRATOR' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMINISTRATOR')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('korisnik sa pogresnom ulogom dobija forbidden response', () => {
    const req = { user: { korisnikId: 2, uloga: 'NAVIJAC' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMINISTRATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'ZABRANJEN_PRISTUP' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('TRENER nema pristup admin-only ruti', () => {
    const req = { user: { korisnikId: 3, uloga: 'TRENER' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMINISTRATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('ORGANIZATOR nema pristup admin-only ruti kada je dozvoljen samo ADMINISTRATOR', () => {
    const req = { user: { korisnikId: 4, uloga: 'ORGANIZATOR' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMINISTRATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('zahtjev bez user objekta se odbija', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    requireRole('ADMINISTRATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'NEOVLASTEN' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('middleware poziva next() samo kada je uloga dozvoljena', () => {
    const allowedReq = { user: { korisnikId: 5, uloga: 'ORGANIZATOR' } };
    const deniedReq = { user: { korisnikId: 6, uloga: 'IGRAC' } };
    const allowedRes = mockRes();
    const deniedRes = mockRes();
    const allowedNext = jest.fn();
    const deniedNext = jest.fn();
    const middleware = requireRole('ORGANIZATOR', 'ADMINISTRATOR');

    middleware(allowedReq, allowedRes, allowedNext);
    middleware(deniedReq, deniedRes, deniedNext);

    expect(allowedNext).toHaveBeenCalledTimes(1);
    expect(deniedNext).not.toHaveBeenCalled();
    expect(deniedRes.status).toHaveBeenCalledWith(403);
  });
});
