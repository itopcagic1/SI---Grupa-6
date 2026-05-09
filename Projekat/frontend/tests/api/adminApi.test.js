import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getKorisnici,
  obradiZahtjevUloge,
  obrisiKorisnika,
  blokirajKorisnika,
} from '../../src/api/adminApi';

vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockApi),
    },
  };
});

describe('adminApi', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = axios.create();
  });

  it('get users poziva tacan endpoint i Authorization header', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { korisnici: [] } });

    const result = await getKorisnici('token', 'PENDING', 'test');

    expect(mockApi.get).toHaveBeenCalledWith('/admin/korisnici', {
      headers: { Authorization: 'Bearer token' },
      params: { status: 'PENDING', pretraga: 'test' },
    });
    expect(result).toEqual({ korisnici: [] });
  });

  it('approve/reject role poziva tacan endpoint i body', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { poruka: 'OK' } });

    await obradiZahtjevUloge('token', 1, 'ODBIJ', 'Razlog');

    expect(mockApi.patch).toHaveBeenCalledWith(
      '/admin/korisnici/1/uloga',
      { akcija: 'ODBIJ', razlog: 'Razlog' },
      { headers: { Authorization: 'Bearer token' } }
    );
  });

  it('block user poziva tacan endpoint', async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { poruka: 'OK' } });

    await blokirajKorisnika('token', 1, 'BLOKIRAJ');

    expect(mockApi.patch).toHaveBeenCalledWith(
      '/admin/korisnici/1/blokiranje',
      { akcija: 'BLOKIRAJ' },
      { headers: { Authorization: 'Bearer token' } }
    );
  });

  it('delete user poziva tacan endpoint', async () => {
    mockApi.delete.mockResolvedValueOnce({ data: { poruka: 'OK' } });

    await obrisiKorisnika('token', 1);

    expect(mockApi.delete).toHaveBeenCalledWith('/admin/korisnici/1', {
      headers: { Authorization: 'Bearer token' },
    });
  });
});
