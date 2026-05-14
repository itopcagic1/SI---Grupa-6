const teamService = require('../../../src/services/teamService');
const teamController = require('../../../src/controllers/teamController');

jest.mock('../../../src/services/teamService');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('teamController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('controller vraca listu timova', async () => {
    const teams = [{ timId: 1, naziv: 'FK Test', sportId: 1 }];
    teamService.getAllTeams.mockResolvedValue(teams);
    const req = {};
    const res = mockRes();

    await teamController.getTeams(req, res);

    expect(res.json).toHaveBeenCalledWith(teams);
  });

  test('controller vraca pojedinacni tim ako metoda postoji', async () => {
    const team = { timId: 1, naziv: 'FK Test', sportId: 1 };
    teamService.getTeamById.mockResolvedValue(team);
    const req = { params: { id: '1' } };
    const res = mockRes();

    await teamController.getTeamDetails(req, res);

    expect(teamService.getTeamById).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith(team);
  });

  test('controller uspjesno kreira tim', async () => {
    const team = { timId: 2, naziv: 'KK Test', sportId: 2, status: 'ACTIVE' };
    teamService.createTeam.mockResolvedValue(team);
    const req = {
      body: { name: 'KK Test', sportId: 2, description: 'Opis' },
      user: { korisnikId: 1, uloga: 'ADMINISTRATOR' },
    };
    const res = mockRes();

    await teamController.createNewTeam(req, res);

    expect(teamService.createTeam).toHaveBeenCalledWith(req.body, 1, 'ADMINISTRATOR');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(team);
  });

  test('controller uspjesno uredjuje tim', async () => {
    const updated = { timId: 1, naziv: 'FK Novi Test', sportId: 1 };
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.updateTeam.mockResolvedValue(updated);
    const req = {
      params: { id: '1' },
      body: { name: 'FK Novi Test' },
      user: { korisnikId: 1, uloga: 'ADMINISTRATOR' },
    };
    const res = mockRes();

    await teamController.updateTeam(req, res);

    expect(teamService.updateTeam).toHaveBeenCalledWith('1', { name: 'FK Novi Test' });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  test('controller uspjesno brise tim', async () => {
    teamService.deleteTeam.mockResolvedValue({ timId: 1 });
    const req = { params: { id: '1' }, user: { korisnikId: 1, uloga: 'ADMINISTRATOR' } };
    const res = mockRes();

    await teamController.deleteTeam(req, res);

    expect(teamService.deleteTeam).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith({ message: 'Tim je uspješno obrisan.' });
  });

  test('controller uspjesno dodjeljuje trenera timu ako metoda postoji', async () => {
    const member = { clanstvoTimaId: 1, timId: 1, korisnikId: 10, ulogaUTimu: 'TRENER' };
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.addMemberToTeam.mockResolvedValue(member);
    const req = {
      params: { id: '1' },
      body: { userId: 10 },
      user: { korisnikId: 1, uloga: 'ADMINISTRATOR' },
    };
    const res = mockRes();

    await teamController.addCoach(req, res);

    expect(teamService.addMemberToTeam).toHaveBeenCalledWith('1', 10, 'TRENER', 'ADMINISTRATOR');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(member);
  });

  test('controller uspjesno dodaje igraca u tim ako metoda postoji', async () => {
    const member = { clanstvoTimaId: 2, timId: 1, korisnikId: 20, ulogaUTimu: 'IGRAC' };
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.addMemberToTeam.mockResolvedValue(member);
    const req = {
      params: { id: '1' },
      body: { userId: 20 },
      user: { korisnikId: 1, uloga: 'ADMINISTRATOR' },
    };
    const res = mockRes();

    await teamController.addPlayer(req, res);

    expect(teamService.addMemberToTeam).toHaveBeenCalledWith('1', 20, 'IGRAC', 'ADMINISTRATOR');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(member);
  });

  test('controller uspjesno uklanja igraca iz tima ako metoda postoji', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    teamService.removeMemberFromTeam.mockResolvedValue({ count: 1 });
    const req = {
      params: { id: '1', playerId: '20' },
      user: { korisnikId: 1, uloga: 'ADMINISTRATOR' },
    };
    const res = mockRes();

    await teamController.removePlayer(req, res);

    expect(teamService.removeMemberFromTeam).toHaveBeenCalledWith('1', '20');
    expect(res.json).toHaveBeenCalledWith({ message: 'Igrač uspješno uklonjen iz tima.' });
  });

  test('controller vraca error response kada service baci gresku', async () => {
    teamService.createTeam.mockRejectedValue(new Error('Tim sa ovim nazivom vec postoji.'));
    const req = {
      body: { name: 'FK Test', sportId: 1 },
      user: { korisnikId: 1, uloga: 'ADMINISTRATOR' },
    };
    const res = mockRes();

    await teamController.createNewTeam(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Tim sa ovim nazivom vec postoji.' })
    );
  });

  test('controller ne vraca password/passwordHash/hash podatke u response-u', async () => {
    const team = {
      timId: 1,
      naziv: 'FK Test',
      clanstvaUcesnika: [{ korisnik: { punoIme: 'Igrac Test' } }],
    };
    teamService.getTeamById.mockResolvedValue(team);
    const req = { params: { id: '1' } };
    const res = mockRes();

    await teamController.getTeamDetails(req, res);

    const body = JSON.stringify(res.json.mock.calls[0][0]);
    expect(body).not.toContain('lozinka');
    expect(body).not.toContain('password');
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });

  test('controller ispravno obradjuje nepostojeci tim ako je takva logika implementirana', async () => {
    teamService.getTeamById.mockResolvedValue(null);
    const req = { params: { id: '999' } };
    const res = mockRes();

    await teamController.getTeamDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  test('controller odbija trenera koji pokusava upravljati tudjim timom', async () => {
    teamService.isUserCoachOfTeam.mockResolvedValue(false);
    const req = {
      params: { id: '1' },
      body: { name: 'Tudji tim' },
      user: { korisnikId: 99, uloga: 'TRENER' },
    };
    const res = mockRes();

    await teamController.updateTeam(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(teamService.updateTeam).not.toHaveBeenCalled();
  });
});