import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  fetchLige,
  createLiga,
  updateLiga,
  deleteLiga,
  dodajTimULigu,
  ukloniTimIzLige,
  fetchLigaById,
} from '../../src/api/ligaApi';

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

describe('ligaApi', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'token');
    mockApi = axios.create();
  });

  it('get leagues i get league by id pozivaju tacne endpoint-e', async () => {
    mockApi.get.mockResolvedValue({ data: { lige: [] } });

    await fetchLige();
    await fetchLigaById(1);

    expect(mockApi.get).toHaveBeenCalledWith('/lige');
    expect(mockApi.get).toHaveBeenCalledWith('/lige/1');
  });

  it('create league salje tacan body', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { liga: { takmicenjeId: 1 } } });

    await createLiga({ naziv: 'Liga', sportId: 1 });

    expect(mockApi.post).toHaveBeenCalledWith(
      '/lige',
      { naziv: 'Liga', sportId: 1 },
      { headers: { Authorization: 'Bearer token' } }
    );
  });

  it('update i delete league koriste tacne endpoint-e', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { liga: { takmicenjeId: 1 } } });
    mockApi.delete.mockResolvedValueOnce({ data: { message: 'OK' } });

    await updateLiga(1, { naziv: 'Liga 2' });
    await deleteLiga(1);

    expect(mockApi.patch).toHaveBeenCalledWith(
      '/lige/1',
      { naziv: 'Liga 2' },
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(mockApi.delete).toHaveBeenCalledWith('/lige/1', {
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('add/remove team to league pozivaju tacne endpoint-e', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { message: 'OK' } });
    mockApi.delete.mockResolvedValueOnce({ data: { message: 'OK' } });

    await dodajTimULigu(1, 2);
    await ukloniTimIzLige(1, 2);

    expect(mockApi.post).toHaveBeenCalledWith(
      '/lige/1/timovi',
      { timId: 2 },
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(mockApi.delete).toHaveBeenCalledWith('/lige/1/timovi/2', {
      headers: { Authorization: 'Bearer token' },
    });
  });
});
