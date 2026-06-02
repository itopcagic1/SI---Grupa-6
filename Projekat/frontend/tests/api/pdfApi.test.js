import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  canExportPDF,
  downloadTabelaPDF,
  downloadRezultatiPDF,
  downloadRasporedPDF,
} from '../../src/api/pdfApi';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Pomocna funkcija – kreira lazni JWT token sa zadanom ulogom
function makeToken(uloga) {
  const payload = btoa(JSON.stringify({ uloga, korisnikId: 1 }));
  return `header.${payload}.signature`;
}

// Lazni blob response
const fakeBlob = new Blob(['%PDF'], { type: 'application/pdf' });
const fakeResponse = { data: fakeBlob };

describe('pdfApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock URL i DOM metoda potrebnih za download
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    const fakeLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    axios.get.mockResolvedValue(fakeResponse);
  });

  // ── canExportPDF ─────────────────────────────────────────────────────────────

  describe('canExportPDF', () => {
    it('vraca true za ADMINISTRATOR', () => {
      localStorage.setItem('token', makeToken('ADMINISTRATOR'));
      expect(canExportPDF()).toBe(true);
    });

    it('vraca true za ORGANIZATOR', () => {
      localStorage.setItem('token', makeToken('ORGANIZATOR'));
      expect(canExportPDF()).toBe(true);
    });

    it('vraca true za TRENER', () => {
      localStorage.setItem('token', makeToken('TRENER'));
      expect(canExportPDF()).toBe(true);
    });

    it('vraca false za IGRAC', () => {
      localStorage.setItem('token', makeToken('IGRAC'));
      expect(canExportPDF()).toBe(false);
    });

    it('vraca false kada nema tokena', () => {
      expect(canExportPDF()).toBe(false);
    });

    it('vraca false kada je token neispravan', () => {
      localStorage.setItem('token', 'neispravan-token');
      expect(canExportPDF()).toBe(false);
    });
  });

  // ── downloadTabelaPDF ────────────────────────────────────────────────────────

  describe('downloadTabelaPDF', () => {
    it('poziva ispravan endpoint sa takmicenjeId', async () => {
      localStorage.setItem('token', makeToken('ADMINISTRATOR'));

      await downloadTabelaPDF(5);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/pdf/tabela'),
        expect.objectContaining({
          params: { takmicenjeId: 5 },
          responseType: 'blob',
        })
      );
    });

    it('salje Authorization header', async () => {
      const token = makeToken('ADMINISTRATOR');
      localStorage.setItem('token', token);

      await downloadTabelaPDF(5);

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${token}` },
        })
      );
    });
  });

  // ── downloadRezultatiPDF ─────────────────────────────────────────────────────

  describe('downloadRezultatiPDF', () => {
    it('poziva ispravan endpoint sa takmicenjeId', async () => {
      localStorage.setItem('token', makeToken('ADMINISTRATOR'));

      await downloadRezultatiPDF(3);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/pdf/rezultati'),
        expect.objectContaining({ params: expect.objectContaining({ takmicenjeId: 3 }) })
      );
    });

    it('dodaje datumOd i datumDo u params kada su proslijedjeni', async () => {
      localStorage.setItem('token', makeToken('ORGANIZATOR'));

      await downloadRezultatiPDF(3, '2026-05-01', '2026-05-31');

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { takmicenjeId: 3, datumOd: '2026-05-01', datumDo: '2026-05-31' },
        })
      );
    });

    it('ne dodaje datumOd/datumDo kada nisu proslijedjeni', async () => {
      localStorage.setItem('token', makeToken('ADMINISTRATOR'));

      await downloadRezultatiPDF(3);

      const callParams = axios.get.mock.calls[0][1].params;
      expect(callParams).not.toHaveProperty('datumOd');
      expect(callParams).not.toHaveProperty('datumDo');
    });
  });

  // ── downloadRasporedPDF ──────────────────────────────────────────────────────

  describe('downloadRasporedPDF', () => {
    it('poziva ispravan endpoint sa takmicenjeId', async () => {
      localStorage.setItem('token', makeToken('TRENER'));

      await downloadRasporedPDF(7);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/pdf/raspored'),
        expect.objectContaining({ params: expect.objectContaining({ takmicenjeId: 7 }) })
      );
    });

    it('dodaje datumOd i datumDo u params kada su proslijedjeni', async () => {
      localStorage.setItem('token', makeToken('TRENER'));

      await downloadRasporedPDF(7, '2026-06-01', '2026-06-30');

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { takmicenjeId: 7, datumOd: '2026-06-01', datumDo: '2026-06-30' },
        })
      );
    });

    it('triggeruje download fajla', async () => {
      localStorage.setItem('token', makeToken('ADMINISTRATOR'));

      await downloadRasporedPDF(7);

      const link = document.createElement.mock.results[0].value;
      expect(link.download).toBe('raspored.pdf');
      expect(link.click).toHaveBeenCalled();
    });
  });
});
