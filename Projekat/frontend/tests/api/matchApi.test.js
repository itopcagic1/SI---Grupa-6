import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { generateSchedule } from '../../src/api/matchApi';

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

describe('matchApi', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'token');
    mockApi = axios.create();
  });

  it('generateSchedule poziva tačan endpoint sa tačnim podacima', async () => {
    const mockData = {
      takmicenjeId: 1,
      pocetniDatum: '2024-01-01',
      defaultnoVrijeme: '15:00',
      defaultnaLokacija: 'Stadion'
    };
    const mockResponse = {
      data: {
        uspjeh: true,
        brojKreiranihUtakmica: 2,
        utakmice: []
      }
    };

    mockApi.post.mockResolvedValue(mockResponse);

    const result = await generateSchedule(mockData);

    expect(mockApi.post).toHaveBeenCalledWith('/matches/generate-schedule', mockData, {
      headers: {
        Authorization: 'Bearer token'
      }
    });
    expect(result).toEqual(mockResponse.data);
  });
});