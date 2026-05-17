import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  dohvatiStatistikuIgraca,
  dohvatiStatistikuTima,
  dohvatiTopStrijelce,
  dohvatiTakmicenjaIgraca,
  fetchTipoviStatistike,
} from '../../src/api/statistikaApi';

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

describe('statistikaApi', () => {
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    mockApi = axios.create();
  });

  describe('dohvatiStatistikuIgraca', () => {
    it('trebalo bi da dohvati statistiku igrača sa svim parametrima', async () => {
      const mockData = {
        igrac: { korisnikId: 1, punoIme: 'Marko Markovic' },
        tim: { timId: 1, naziv: 'FK Željezničar' },
        brojUtakmica: 10,
        statistike: [{ tipStatistikeId: 1, nazivStatistike: 'Golovi', ukupno: 8 }]
      };

      mockApi.get.mockResolvedValue({ data: mockData });

      const rezultat = await dohvatiStatistikuIgraca(1, 5, '2025/2026');

      expect(mockApi.get).toHaveBeenCalledWith('/igraci/1/statistika', {
        params: { takmicenjeId: 5, sezona: '2025/2026' }
      });
      expect(rezultat).toEqual(mockData);
    });

    it('trebalo bi da dohvati statistiku igrača bez filtera', async () => {
      mockApi.get.mockResolvedValue({ data: { statistike: [] } });

      await dohvatiStatistikuIgraca(1);

      expect(mockApi.get).toHaveBeenCalledWith('/igraci/1/statistika', {
        params: {}
      });
    });

    it('trebalo bi da kreira URL sa samo takmicenjeId filterom', async () => {
      mockApi.get.mockResolvedValue({ data: {} });

      await dohvatiStatistikuIgraca(1, 3, null);

      expect(mockApi.get).toHaveBeenCalledWith('/igraci/1/statistika', {
        params: { takmicenjeId: 3 }
      });
    });
  });

  describe('dohvatiStatistikuTima', () => {
    it('trebalo bi da dohvati statistiku tima sa filtrima', async () => {
      const mockData = {
        tim: { timId: 1, naziv: 'FK Željezničar', logoUrl: 'url' },
        brojUtakmica: 15,
        statistike: [{ tipStatistikeId: 1, nazivStatistike: 'Golovi', ukupno: 45 }]
      };

      mockApi.get.mockResolvedValue({ data: mockData });

      const rezultat = await dohvatiStatistikuTima(1, 2, '2025/2026');

      expect(mockApi.get).toHaveBeenCalledWith('/timovi/1/statistika', {
        params: { takmicenjeId: 2, sezona: '2025/2026' }
      });
      expect(rezultat).toEqual(mockData);
    });

    it('trebalo bi da ignoriše null vrijednosti', async () => {
      mockApi.get.mockResolvedValue({ data: {} });

      await dohvatiStatistikuTima(1, null, null);

      expect(mockApi.get).toHaveBeenCalledWith('/timovi/1/statistika', {
        params: {}
      });
    });
  });

  describe('dohvatiTopStrijelce', () => {
    it('trebalo bi da dohvati top strijelce sa limitom', async () => {
      const mockData = {
        takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga' },
        tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
        topStrijelci: [
          {
            rank: 1,
            igrac: { korisnikId: 1, punoIme: 'Marko Markovic' },
            vrijednost: 15
          }
        ]
      };

      mockApi.get.mockResolvedValue({ data: mockData });

      const rezultat = await dohvatiTopStrijelce(1, 1, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/takmicenja/1/top-strijelci', {
        params: { tipStatistikeId: 1, limit: 10 }
      });
      expect(rezultat.topStrijelci).toHaveLength(1);
      expect(rezultat.topStrijelci[0].rank).toBe(1);
    });

    it('trebalo bi da koristi default limit od 10', async () => {
      mockApi.get.mockResolvedValue({ data: { topStrijelci: [] } });

      await dohvatiTopStrijelce(1, 1, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/takmicenja/1/top-strijelci', {
        params: { tipStatistikeId: 1, limit: 10 }
      });
    });
  });

  describe('dohvatiTakmicenjaIgraca', () => {
    it('trebalo bi da dohvati takmičenja igrača', async () => {
      const mockData = [
        { takmicenjeId: 1, naziv: 'Premijer Liga' }
      ];

      mockApi.get.mockResolvedValue({ data: mockData });

      const rezultat = await dohvatiTakmicenjaIgraca(1);

      expect(mockApi.get).toHaveBeenCalledWith('/igraci/1/takmicenja');
      expect(rezultat).toEqual(mockData);
    });
  });

  describe('fetchTipoviStatistike', () => {
    it('trebalo bi da dohvati tipove statistike za sport', async () => {
      const mockTipovi = [
        { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
        { tipStatistikeId: 2, nazivStatistike: 'Asistencije' }
      ];

      mockApi.get.mockResolvedValue({ data: mockTipovi });

      const rezultat = await fetchTipoviStatistike(1);

      expect(mockApi.get).toHaveBeenCalledWith('/tipovi-statistike?sportId=1');
      expect(rezultat).toEqual(mockTipovi);
    });

    it('trebalo bi da vrati prazan niz ako sportId nedostaje', async () => {
      const rezultat = await fetchTipoviStatistike(null);

      expect(rezultat).toEqual([]);
      expect(mockApi.get).not.toHaveBeenCalled();
    });
  });
});
