import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSport, updateSport, deleteSport } from '../../src/api/sportApi';

describe('sportApi', () => {
  const mockApi = {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('api', mockApi);
    vi.stubGlobal('authConfig', vi.fn(() => ({ headers: { Authorization: 'Bearer token' } })));
  });

  it('create sport salje tacan body', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { sportId: 1, naziv: 'Fudbal' } });

    const result = await createSport({ naziv: 'Fudbal' });

    expect(mockApi.post).toHaveBeenCalledWith(
      '/sports',
      { naziv: 'Fudbal' },
      { headers: { Authorization: 'Bearer token' } }
    );
    expect(result).toEqual({ sportId: 1, naziv: 'Fudbal' });
  });

  it('update sport salje tacan endpoint i body', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { sportId: 1, naziv: 'Fudbal' } });

    await updateSport(1, { naziv: 'Fudbal' });

    expect(mockApi.patch).toHaveBeenCalledWith(
      '/sports/1',
      { naziv: 'Fudbal' },
      { headers: { Authorization: 'Bearer token' } }
    );
  });

  it('delete sport poziva tacan endpoint', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { message: 'OK' } });

    await deleteSport(1);

    expect(mockApi.delete).toHaveBeenCalledWith('/sports/1', {
      headers: { Authorization: 'Bearer token' },
    });
  });
});
