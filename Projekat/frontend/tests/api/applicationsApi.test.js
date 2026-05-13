import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchMojePrijave } from '../../src/api/applicationsApi';

vi.mock('axios', () => {
  const mockApi = {
    get: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockApi),
    },
  };
});

describe('applicationsApi', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'token');
    mockApi = axios.create();
  });

  it('fetchMojePrijave poziva tacan endpoint sa tokenom', async () => {
    mockApi.get.mockResolvedValue({ data: { prijave: [] } });

    await fetchMojePrijave();

    expect(mockApi.get).toHaveBeenCalledWith('/applications/my', {
      headers: { Authorization: 'Bearer token' },
    });
  });
});
