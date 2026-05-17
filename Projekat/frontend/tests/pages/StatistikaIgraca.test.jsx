import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StatistikaIgraca from '../../src/pages/StatistikaIgraca';
import * as statistikaApi from '../../src/api/statistikaApi';
import * as ligaApi from '../../src/api/ligaApi';

vi.mock('../../src/api/statistikaApi');
vi.mock('../../src/api/ligaApi');
vi.mock('../../src/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

describe('StatistikaIgraca stranica', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statistikaApi.dohvatiTakmicenjaIgraca.mockResolvedValue([]);
  });

  it('trebalo bi da prikaže učitavanje nakon montiranja', () => {
    statistikaApi.dohvatiStatistikuIgraca.mockImplementation(() =>
      new Promise(() => {}) // nikada se ne resolve-a
    );
    statistikaApi.dohvatiTakmicenjaIgraca.mockResolvedValue([]);
    ligaApi.fetchLige.mockResolvedValue({ lige: [] });

    render(
      <BrowserRouter>
        <StatistikaIgraca />
      </BrowserRouter>
    );

    expect(screen.getByText(/Učitavanje statistike/i)).toBeDefined();
  });

  it('trebalo bi da prikaže podatke nakon učitavanja', async () => {
    const mockData = {
      igrac: { korisnikId: 1, punoIme: 'Marko Markovic' },
      tim: { timId: 1, naziv: 'FK Željezničar' },
      takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga', sezona: '2025/2026' },
      brojUtakmica: 10,
      statistike: [
        { tipStatistikeId: 1, nazivStatistike: 'Golovi', ukupno: 8 }
      ]
    };

    statistikaApi.dohvatiStatistikuIgraca.mockResolvedValue(mockData);
    statistikaApi.dohvatiTakmicenjaIgraca.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <StatistikaIgraca />
      </BrowserRouter>
    );

    const matches = await screen.findAllByText('Marko Markovic');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('trebalo bi da prikaže grešku ako dohvat ne uspije', async () => {
    statistikaApi.dohvatiStatistikuIgraca.mockRejectedValue({
      response: { data: { poruka: 'Nije moguće učitati statistiku.' } }
    });
    statistikaApi.dohvatiTakmicenjaIgraca.mockResolvedValue([]);
    ligaApi.fetchLige.mockResolvedValue({ lige: [] });

    render(
      <BrowserRouter>
        <StatistikaIgraca />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Nije moguće učitati statistiku/i)).toBeDefined();
    });
  });

  it('trebalo bi da pozove API sa takmicenjeId filterom', async () => {
    statistikaApi.dohvatiStatistikuIgraca.mockResolvedValue({
      igrac: null,
      statistike: []
    });
    statistikaApi.dohvatiTakmicenjaIgraca.mockResolvedValue([
      { takmicenjeId: 5, naziv: 'Premijer Liga' }
    ]);

    render(
      <BrowserRouter>
        <StatistikaIgraca />
      </BrowserRouter>
    );

    await screen.findByRole('option', { name: 'Premijer Liga' });
    const select = screen.getByDisplayValue('Sva takmičenja');
    fireEvent.change(select, { target: { value: '5' } });

    await waitFor(() => {
      expect(statistikaApi.dohvatiStatistikuIgraca).toHaveBeenCalledWith('1', '5', null);
    });
  });

  it('trebalo bi da prikaže tabelu sa statistikom', async () => {
    const mockData = {
      igrac: { korisnikId: 1, punoIme: 'Marko' },
      tim: { timId: 1, naziv: 'Tim' },
      takmicenje: { naziv: 'Liga', sezona: '2025/2026' },
      brojUtakmica: 5,
      statistike: [
        { tipStatistikeId: 1, nazivStatistike: 'Golovi', ukupno: 10 },
        { tipStatistikeId: 2, nazivStatistike: 'Asistencije', ukupno: 5 }
      ]
    };

    statistikaApi.dohvatiStatistikuIgraca.mockResolvedValue(mockData);
    ligaApi.fetchLige.mockResolvedValue({ lige: [] });

    render(
      <BrowserRouter>
        <StatistikaIgraca />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Golovi')).toBeDefined();
      expect(screen.getByText('Asistencije')).toBeDefined();
    });
  });
});
