const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/teamService', () => ({
  getAllTeams: jest.fn(),
  getTeamById: jest.fn(),
  createTeam: jest.fn(),
  updateTeam: jest.fn(),
  deleteTeam: jest.fn(),
  addMemberToTeam: jest.fn(),
  removeMemberFromTeam: jest.fn(),
  isUserCoachOfTeam: jest.fn(),
  getAllCoaches: jest.fn(),
  getAllPlayers: jest.fn(),
}));

const teamService = require('../../src/services/teamService');
const teamRoutes = require('../../src/routes/teamRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/teams', teamRoutes);
  return app;
}

function tokenFor(uloga, korisnikId = 100) {
  return jwt.sign(
    { korisnikId, email: `${uloga.toLowerCase()}@example.com`, uloga },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

describe('Sprint 6 team routes', () => {
  let app;
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'team-routes-secret' };
    app = buildTestApp();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('dohvat liste timova', async () => {
    teamService.getAllTeams.mockResolvedValue([
      { timId: 1, naziv: 'FK Test', sportId: 1, sport: { naziv: 'Fudbal' } },
    ]);

    const res = await request(app).get('/api/teams');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([expect.objectContaining({ timId: 1, naziv: 'FK Test' })]);
  });

  test('dohvat pojedinacnog tima ako endpoint postoji', async () => {
    teamService.getTeamById.mockResolvedValue({
      timId: 1,
      naziv: 'FK Test',
      sportId: 1,
      sport: { naziv: 'Fudbal' },
    });

    const res = await request(app).get('/api/teams/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ timId: 1, naziv: 'FK Test' }));
  });

  test('kreiranje tima sa validnim podacima', async () => {
    teamService.createTeam.mockResolvedValue({
      timId: 2,
      naziv: 'KK Test',
      sportId: 2,
      status: 'ACTIVE',
    });

    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ name: 'KK Test', sportId: 2, description: 'Kosarkaski tim' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ timId: 2, naziv: 'KK Test' }));
  });

  test('kreiranje tima bez obaveznog naziva treba biti blokirano ako je validacija implementirana', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ sportId: 1 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
    expect(teamService.createTeam).not.toHaveBeenCalled();
  });

  test('kreiranje tima bez sporta treba biti blokirano ako je validacija implementirana', async () => {
    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ name: 'Tim bez sporta' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
    expect(teamService.createTeam).not.toHaveBeenCalled();
  });

  test('kreiranje tima sa nepostojecim sportom treba biti blokirano ako je validacija implementirana', async () => {
    teamService.createTeam.mockRejectedValue(new Error('Sport nije pronadjen.'));

    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ name: 'Tim', sportId: 999 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
  });

  test('kreiranje tima sa duplim nazivom treba biti blokirano ako je implementirano', async () => {
    teamService.createTeam.mockRejectedValue(new Error('Tim sa ovim nazivom vec postoji.'));

    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ name: 'FK Test', sportId: 1 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
  });

  test('uredjivanje tima sa validnim podacima', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.updateTeam.mockResolvedValue({
      timId: 1,
      naziv: 'FK Novi Test',
      sportId: 1,
      status: 'ACTIVE',
    });

    const res = await request(app)
      .patch('/api/teams/1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ name: 'FK Novi Test', description: 'Novi opis', status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ naziv: 'FK Novi Test' }));
  });

  test('brisanje tima', async () => {
    teamService.deleteTeam.mockResolvedValue({ timId: 1 });

    const res = await request(app)
      .delete('/api/teams/1')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
  });

  test('brisanje nepostojeceg tima vraca odgovarajuci error response', async () => {
    teamService.deleteTeam.mockRejectedValue(new Error('Tim nije pronadjen.'));

    const res = await request(app)
      .delete('/api/teams/999')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
  });

  test('ne-admin ili neovlasten korisnik ne moze kreirati tim ako ruta po zahtjevu treba biti zasticena', async () => {
    teamService.createTeam.mockResolvedValue({ timId: 3, naziv: 'Neadmin Tim', sportId: 1 });

    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`)
      .send({ name: 'Neadmin Tim', sportId: 1 });

    expect(res.status).toBe(403);
  });

  test('ne-admin ili neovlasten korisnik ne moze uredjivati tim ako ruta po zahtjevu treba biti zasticena', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);

    const res = await request(app)
      .patch('/api/teams/1')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`)
      .send({ name: 'Nedozvoljeno' });

    expect(res.status).toBe(403);
    expect(teamService.updateTeam).not.toHaveBeenCalled();
  });

  test('ne-admin ili neovlasten korisnik ne moze brisati tim ako ruta po zahtjevu treba biti zasticena', async () => {
    teamService.deleteTeam.mockResolvedValue({ timId: 1 });

    const res = await request(app)
      .delete('/api/teams/1')
      .set('Authorization', `Bearer ${tokenFor('NAVIJAC')}`);

    expect(res.status).toBe(403);
  });

  test('zahtjev bez tokena ne moze kreirati tim ako su rute zasticene', async () => {
    const res = await request(app).post('/api/teams').send({ name: 'Tim', sportId: 1 });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEOVLASTEN' }));
  });

  test('zahtjev bez tokena ne moze urediti tim ako su rute zasticene', async () => {
    const res = await request(app).patch('/api/teams/1').send({ name: 'Tim' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEOVLASTEN' }));
  });

  test('zahtjev bez tokena ne moze obrisati tim ako su rute zasticene', async () => {
    const res = await request(app).delete('/api/teams/1');

    expect(res.status).toBe(401);
    expect(res.body).toEqual(expect.objectContaining({ greska: 'NEOVLASTEN' }));
  });

  test('dodjela trenera timu ako endpoint postoji', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.addMemberToTeam.mockResolvedValue({
      clanstvoTimaId: 1,
      timId: 1,
      korisnikId: 10,
      ulogaUTimu: 'TRENER',
      status: 'ACTIVE',
    });

    const res = await request(app)
      .post('/api/teams/1/coaches')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ userId: 10 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ ulogaUTimu: 'TRENER' }));
  });

  test('pokusaj dodjele korisnika koji nema ulogu TRENER treba biti odbijen ako je implementirano', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.addMemberToTeam.mockRejectedValue(
      new Error('Korisnik je NAVIJAC i ne moze biti dodan kao TRENER bez odobrenja administratora.')
    );

    const res = await request(app)
      .post('/api/teams/1/coaches')
      .set('Authorization', `Bearer ${tokenFor('TRENER', 99)}`)
      .send({ userId: 11 });

    expect(res.status).toBe(403);
  });

  test('dodavanje igraca u tim ako endpoint postoji', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.addMemberToTeam.mockResolvedValue({
      clanstvoTimaId: 2,
      timId: 1,
      korisnikId: 20,
      ulogaUTimu: 'IGRAC',
      status: 'ACTIVE',
    });

    const res = await request(app)
      .post('/api/teams/1/players')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ userId: 20 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ ulogaUTimu: 'IGRAC' }));
  });

  test('pokusaj dodavanja istog igraca dva puta treba biti blokiran ako je implementirano', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.addMemberToTeam.mockRejectedValue(new Error('Korisnik je vec clan ovog tima.'));

    const res = await request(app)
      .post('/api/teams/1/players')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`)
      .send({ userId: 20 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
  });

  test('uklanjanje igraca iz tima ako endpoint postoji', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.removeMemberFromTeam.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .delete('/api/teams/1/players/20')
      .set('Authorization', `Bearer ${tokenFor('ADMINISTRATOR')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ message: expect.any(String) }));
  });

  test('trener ne moze upravljati tudjim timom ako je ta logika implementirana', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/teams/1/players')
      .set('Authorization', `Bearer ${tokenFor('TRENER', 99)}`)
      .send({ userId: 20 });

    expect(res.status).toBe(403);
    expect(teamService.addMemberToTeam).not.toHaveBeenCalled();
  });

  test('response ne smije sadrzavati password/passwordHash/hash polja korisnika', async () => {
    teamService.getTeamById.mockResolvedValue({
      timId: 1,
      naziv: 'FK Test',
      clanstvaUcesnika: [
        {
          korisnikId: 20,
          korisnik: {
            punoIme: 'Igrac Test',
          },
        },
      ],
    });

    const res = await request(app).get('/api/teams/1');

    const body = JSON.stringify(res.body);
    expect(body).not.toContain('lozinka');
    expect(body).not.toContain('password');
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });
});
