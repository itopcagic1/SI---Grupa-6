import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StatistikaTima from '../../src/pages/StatistikaTima';
import * as statistikaApi from '../../src/api/statistikaApi';

vi.mock('../../src/api/statistikaApi');
vi.mock('../../src/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

describe('StatistikaTima stranica', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    statistikaApi.dohvatiTakmicenjaTima.mockResolvedValue([]);
  });

  it('trebalo bi da prikaže naziv tima u naslovu', async () => {
    const mockData = {
      tim: { timId: 1, naziv: 'FK Željezničar', logoUrl: 'url', sport: { naziv: 'Fudbal' } },
      takmicenje: { naziv: 'Premijer Liga', sezona: '2025/2026' },
      brojUtakmica: 15,
      statistike: []
    };

    statistikaApi.dohvatiStatistikuTima.mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <StatistikaTima />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('FK Željezničar').length).toBeGreaterThan(0);
    });
  });

  it('trebalo bi da prikaže grešku ako dohvat padne', async () => {
    statistikaApi.dohvatiStatistikuTima.mockRejectedValue({
      response: { data: { poruka: 'Greška' } }
    });

    render(
      <BrowserRouter>
        <StatistikaTima />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Greška/i)).toBeDefined();
    });
  });

  it('trebalo bi da prikaže broj odigranih utakmica', async () => {
    const mockData = {
      tim: { timId: 1, naziv: 'FK Željezničar', logoUrl: null, sport: { naziv: 'Fudbal' } },
      takmicenje: { naziv: 'Liga', sezona: '2025/2026' },
      brojUtakmica: 20,
      statistike: [
        { tipStatistikeId: 1, nazivStatistike: 'Golovi', ukupno: 50 }
      ]
    };

    statistikaApi.dohvatiStatistikuTima.mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <StatistikaTima />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('20')).toBeDefined();
      expect(screen.getByText(/Broj odigranih/i)).toBeDefined();
    });
  });

  it('trebalo bi da prikaže tabelu sa statistikom tima', async () => {
    const mockData = {
      tim: { timId: 1, naziv: 'FK Željezničar', logoUrl: 'url', sport: { naziv: 'Fudbal' } },
      takmicenje: { naziv: 'Liga', sezona: '2025/2026' },
      brojUtakmica: 10,
      statistike: [
        { tipStatistikeId: 1, nazivStatistike: 'Golovi', ukupno: 40 },
        { tipStatistikeId: 3, nazivStatistike: 'Kartoni', ukupno: 8 }
      ]
    };

    statistikaApi.dohvatiStatistikuTima.mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <StatistikaTima />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Golovi')).toBeDefined();
      expect(screen.getByText('Kartoni')).toBeDefined();
      expect(screen.getByText('40.0')).toBeDefined();
      expect(screen.getByText('8.0')).toBeDefined();
    });
  });

  it('trebalo bi da ažurira API poziv kada se filter promijeni', async () => {
    statistikaApi.dohvatiStatistikuTima.mockResolvedValue({
      tim: null,
      statistike: [],
      brojUtakmica: 0
    });
    statistikaApi.dohvatiTakmicenjaTima.mockResolvedValue([
      { takmicenjeId: 3, naziv: 'Druga Liga', sezona: null }
    ]);

    render(
      <BrowserRouter>
        <StatistikaTima />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Sva takmičenja')).toBeDefined();
    });

    const select = screen.getByDisplayValue('Sva takmičenja');
    fireEvent.change(select, { target: { value: '3' } });

    await waitFor(() => {
      expect(statistikaApi.dohvatiStatistikuTima).toHaveBeenCalledWith('1', '3', null);
    });
  });
});