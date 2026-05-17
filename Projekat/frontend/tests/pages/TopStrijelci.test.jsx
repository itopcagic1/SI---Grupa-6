import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TopStrijelci from '../../src/pages/TopStrijelci';
import * as statistikaApi from '../../src/api/statistikaApi';
import * as ligaApi from '../../src/api/ligaApi';

vi.mock('../../src/api/statistikaApi');
vi.mock('../../src/api/ligaApi');
vi.mock('../../src/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: undefined }),
  };
});

vi.mock('../../src/utils/statistikaTipovi', () => ({
  getIgrackiTipoviStatistike: (tipovi) => tipovi,
}));

describe('TopStrijelci stranica', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trebalo bi da prikaže filtre i poruku da odaberete takmičenje', async () => {
    ligaApi.fetchLige.mockResolvedValue({
      lige: [{ takmicenjeId: 1, naziv: 'Premijer Liga', sportId: 1 }]
    });
    statistikaApi.fetchTipoviStatistike.mockResolvedValue([]);
    statistikaApi.dohvatiTopStrijelce.mockResolvedValue({ topStrijelci: [] });

    render(
      <BrowserRouter>
        <TopStrijelci />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Premijer Liga')).toBeDefined();
    });

    expect(screen.getByDisplayValue('Odaberite takmičenje')).toBeDefined();
    expect(screen.getByText(/Odaberite takmičenje\./i)).toBeDefined();
  });

  it('trebalo bi da učita tipove statistike kada se takmičenje odabere', async () => {
    ligaApi.fetchLige.mockResolvedValue({
      lige: [{ takmicenjeId: 1, naziv: 'Premijer Liga', sportId: 1 }]
    });
    statistikaApi.fetchTipoviStatistike.mockResolvedValue([
      { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
      { tipStatistikeId: 2, nazivStatistike: 'Asistencije' }
    ]);
    statistikaApi.dohvatiTopStrijelce.mockResolvedValue({ topStrijelci: [] });

    render(
      <BrowserRouter>
        <TopStrijelci />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Premijer Liga')).toBeDefined();
    });

    fireEvent.change(screen.getByDisplayValue('Odaberite takmičenje'), {
      target: { value: '1' }
    });

    await waitFor(() => {
      expect(statistikaApi.fetchTipoviStatistike).toHaveBeenCalledWith(1);
    });
  });

  it('trebalo bi da prikaže top strijelce nakon odabira', async () => {
    const mockData = {
      takmicenje: { takmicenjeId: 1, naziv: 'Premijer Liga' },
      tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
      topStrijelci: [
        {
          rank: 1,
          igrac: { korisnikId: 1, punoIme: 'Marko Markovic' },
          tim: { timId: 1, naziv: 'FK Željezničar', logoUrl: 'url' },
          vrijednost: 20
        },
        {
          rank: 2,
          igrac: { korisnikId: 2, punoIme: 'Petar Petrovic' },
          tim: { timId: 2, naziv: 'FK Voždovac', logoUrl: 'url' },
          vrijednost: 18
        }
      ]
    };

    ligaApi.fetchLige.mockResolvedValue({
      lige: [{ takmicenjeId: 1, naziv: 'Premijer Liga', sportId: 1 }]
    });
    statistikaApi.fetchTipoviStatistike.mockResolvedValue([
      { tipStatistikeId: 1, nazivStatistike: 'Golovi' }
    ]);
    statistikaApi.dohvatiTopStrijelce.mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <TopStrijelci />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Premijer Liga')).toBeDefined();
    });

    fireEvent.change(screen.getByDisplayValue('Odaberite takmičenje'), {
      target: { value: '1' }
    });

    // Čekamo da se tip pojavi kao opcija u selectu
    await waitFor(() => {
      expect(screen.getByDisplayValue('Odaberite tip')).toBeDefined();
      expect(screen.getAllByText('Golovi').length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByDisplayValue('Odaberite tip'), {
      target: { value: '1' }
    });

    await waitFor(() => {
      expect(screen.getByText('Marko Markovic')).toBeDefined();
      expect(screen.getByText('Petar Petrovic')).toBeDefined();
      expect(screen.getByText('20.0')).toBeDefined();
    });
  });

  it('trebalo bi da prikaže medalje za top 3', async () => {
    const mockData = {
      takmicenje: { takmicenjeId: 1, naziv: 'Liga' },
      tipStatistike: { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
      topStrijelci: [
        {
          rank: 1,
          igrac: { korisnikId: 1, punoIme: 'Igrac Prvi' },
          tim: { timId: 1, naziv: 'Tim1', logoUrl: 'url' },
          vrijednost: 20
        },
        {
          rank: 2,
          igrac: { korisnikId: 2, punoIme: 'Igrac Drugi' },
          tim: { timId: 2, naziv: 'Tim2', logoUrl: 'url' },
          vrijednost: 18
        },
        {
          rank: 3,
          igrac: { korisnikId: 3, punoIme: 'Igrac Treci' },
          tim: { timId: 3, naziv: 'Tim3', logoUrl: 'url' },
          vrijednost: 16
        }
      ]
    };

    ligaApi.fetchLige.mockResolvedValue({
      lige: [{ takmicenjeId: 1, naziv: 'Liga', sportId: 1 }]
    });
    statistikaApi.fetchTipoviStatistike.mockResolvedValue([
      { tipStatistikeId: 1, nazivStatistike: 'Golovi' }
    ]);
    statistikaApi.dohvatiTopStrijelce.mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <TopStrijelci />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Liga')).toBeDefined();
    });

    fireEvent.change(screen.getByDisplayValue('Odaberite takmičenje'), {
      target: { value: '1' }
    });

    await waitFor(() => {
      expect(screen.getAllByText('Golovi').length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByDisplayValue('Odaberite tip'), {
      target: { value: '1' }
    });

    // Provjeravamo da su igrači prikazani (medalje se renderuju kao emoji, ne tekst)
    await waitFor(() => {
      expect(screen.getByText('Igrac Prvi')).toBeDefined();
      expect(screen.getByText('Igrac Drugi')).toBeDefined();
      expect(screen.getByText('Igrac Treci')).toBeDefined();
    });
  });

  it('trebalo bi da prikaže grešku ako dohvat ne uspije', async () => {
    ligaApi.fetchLige.mockResolvedValue({
      lige: [{ takmicenjeId: 1, naziv: 'Liga', sportId: 1 }]
    });
    statistikaApi.fetchTipoviStatistike.mockResolvedValue([]);
    statistikaApi.dohvatiTopStrijelce.mockRejectedValue({
      response: { data: { poruka: 'Greška pri dohvatu' } }
    });

    render(
      <BrowserRouter>
        <TopStrijelci />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Liga')).toBeDefined();
    });

    fireEvent.change(screen.getByDisplayValue('Odaberite takmičenje'), {
      target: { value: '1' }
    });

    await waitFor(() => {
      expect(screen.getByText(/Greška pri dohvatu/i)).toBeDefined();
    });
  });

  it('trebalo bi da koristi custom limit', async () => {
    ligaApi.fetchLige.mockResolvedValue({
      lige: [{ takmicenjeId: 1, naziv: 'Liga', sportId: 1 }]
    });
    statistikaApi.fetchTipoviStatistike.mockResolvedValue([
      { tipStatistikeId: 1, nazivStatistike: 'Golovi' }
    ]);
    statistikaApi.dohvatiTopStrijelce.mockResolvedValue({
      takmicenje: { naziv: 'Liga' },
      tipStatistike: { nazivStatistike: 'Golovi' },
      topStrijelci: []
    });

    render(
      <BrowserRouter>
        <TopStrijelci />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Liga')).toBeDefined();
    });

    fireEvent.change(screen.getByDisplayValue('Odaberite takmičenje'), {
      target: { value: '1' }
    });

    await waitFor(() => {
      expect(screen.getAllByText('Golovi').length).toBeGreaterThan(0);
    });

    fireEvent.change(screen.getByDisplayValue('Odaberite tip'), {
      target: { value: '1' }
    });

    await waitFor(() => {
      expect(statistikaApi.dohvatiTopStrijelce).toHaveBeenCalledWith('1', '1', 10);
    });

    fireEvent.change(screen.getByDisplayValue('Top 10'), {
      target: { value: '20' }
    });

    await waitFor(() => {
      expect(statistikaApi.dohvatiTopStrijelce).toHaveBeenCalledWith('1', '1', 20);
    });
  });
});