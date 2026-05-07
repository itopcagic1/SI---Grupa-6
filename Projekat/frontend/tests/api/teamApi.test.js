import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  removePlayerFromTeam,
  fetchCoaches,
  fetchPlayers,
} from '../../src/api/teamApi';

vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockApi),
    },
  };
});

describe('teamApi', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'token');
    mockApi = axios.create();
  });

  it('get teams poziva tacan endpoint', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] });

    await fetchTeams();

    expect(mockApi.get).toHaveBeenCalledWith('/teams');
  });

  it('create team salje tacan body', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { timId: 1 } });

    await createTeam({ name: 'FK Test', sportId: 1 });

    expect(mockApi.post).toHaveBeenCalledWith(
      '/teams',
      { name: 'FK Test', sportId: 1 },
      { headers: { Authorization: 'Bearer token' } }
    );
  });

  it('update i delete team koriste tacne endpoint-e', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { timId: 1 } });
    mockApi.delete.mockResolvedValueOnce({ data: { message: 'OK' } });

    await updateTeam(1, { name: 'FK Novi' });
    await deleteTeam(1);

    expect(mockApi.patch).toHaveBeenCalledWith(
      '/teams/1',
      { name: 'FK Novi' },
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(mockApi.delete).toHaveBeenCalledWith('/teams/1', {
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('add player/remove player i helper liste pozivaju tacne endpoint-e', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    mockApi.post.mockResolvedValueOnce({ data: { id: 1 } });
    mockApi.delete.mockResolvedValueOnce({ data: { message: 'OK' } });

    await fetchCoaches();
    await fetchPlayers();
    await addPlayerToTeam(1, 2);
    await removePlayerFromTeam(1, 2);

    expect(mockApi.get).toHaveBeenCalledWith('/teams/coaches');
    expect(mockApi.get).toHaveBeenCalledWith('/teams/players', {
      headers: { Authorization: 'Bearer token' },
    });
    expect(mockApi.post).toHaveBeenCalledWith(
      '/teams/1/players',
      { userId: 2 },
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(mockApi.delete).toHaveBeenCalledWith('/teams/1/players/2', {
      headers: { Authorization: 'Bearer token' },
    });
  });
});
