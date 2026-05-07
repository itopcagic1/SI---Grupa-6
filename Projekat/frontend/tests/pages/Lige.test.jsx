import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Lige from '../../src/pages/Lige';
import * as ligaApi from '../../src/api/ligaApi';
import * as teamApi from '../../src/api/teamApi';

vi.mock('../../src/api/ligaApi', () => ({
  fetchLige: vi.fn(),
  createLiga: vi.fn(),
  updateLiga: vi.fn(),
  deleteLiga: vi.fn(),
  fetchSportovi: vi.fn(),
  dodajTimULigu: vi.fn(),
  ukloniTimIzLige: vi.fn(),
  fetchLigaById: vi.fn(),
}));

vi.mock('../../src/api/teamApi', () => ({
  fetchTeams: vi.fn(),
}));

vi.mock('../../src/api/authApi', () => ({
  logoutUser: vi.fn(),
}));

const liga = {
  takmicenjeId: 1,
  naziv: 'Premijer liga',
  sportId: 1,
  sezona: '2026/2027',
  tipTakmicenja: 'Liga',
  status: 'Aktivan',
  organizator: { punoIme: 'Admin' },
};

function renderPage(korisnik = { korisnikId: 1, trenutnaUloga: 'ADMINISTRATOR', punoIme: 'Admin' }) {
  localStorage.setItem('token', 'token');
  localStorage.setItem('korisnik', JSON.stringify(korisnik));
  return render(
    <BrowserRouter>
      <Lige />
    </BrowserRouter>
  );
}

describe('Lige', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    ligaApi.fetchLige.mockResolvedValue({ lige: [liga] });
    ligaApi.fetchSportovi.mockResolvedValue([{ sportId: 1, naziv: 'Fudbal' }]);
    ligaApi.fetchLigaById.mockResolvedValue({ liga: { ...liga, ucesniciTakmicenja: [] } });
    ligaApi.createLiga.mockResolvedValue({ liga: { takmicenjeId: 2, naziv: 'Nova Liga' } });
    ligaApi.updateLiga.mockResolvedValue({ liga });
    ligaApi.deleteLiga.mockResolvedValue({ message: 'OK' });
    ligaApi.dodajTimULigu.mockResolvedValue({ message: 'OK' });
    ligaApi.ukloniTimIzLige.mockResolvedValue({ message: 'OK' });
    teamApi.fetchTeams.mockResolvedValue([{ timId: 2, naziv: 'FK Test', sportId: 1 }]);
  });

  it('stranica prikazuje listu liga iz mockanog API-ja i ne prikazuje hash podatke', async () => {
    const { container } = renderPage();

    expect(await screen.findByText('Premijer liga')).toBeInTheDocument();
    expect(container.textContent).not.toContain('lozinkaHash');
    expect(container.textContent).not.toContain('password');
  });

  it('forma za kreiranje lige salje ispravne podatke prema API-ju', async () => {
    const { container } = renderPage();

    await screen.findByText('Premijer liga');
    fireEvent.click(screen.getByText('Dodaj Novu Ligu'));
    fireEvent.change(container.querySelector('input[name="naziv"]'), { target: { value: 'Nova Liga' } });
    fireEvent.change(container.querySelector('select[name="sportId"]'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Spasi Promjene'));

    await waitFor(() => {
      expect(ligaApi.createLiga).toHaveBeenCalledWith(expect.objectContaining({ naziv: 'Nova Liga', sportId: 1 }));
    });
  });

  it('kreiranje bez naziva ili sporta ne salje request ako UI validacija radi', async () => {
    renderPage();

    await screen.findByText('Premijer liga');
    fireEvent.click(screen.getByText('Dodaj Novu Ligu'));
    fireEvent.click(screen.getByText('Spasi Promjene'));

    await waitFor(() => {
      expect(ligaApi.createLiga).not.toHaveBeenCalled();
    });
  });

  it('edit i delete lige pozivaju odgovarajuci API', async () => {
    const { container } = renderPage();

    await screen.findByText('Premijer liga');
    fireEvent.click(screen.getByText('Izmijeni'));
    fireEvent.change(container.querySelector('input[name="naziv"]'), { target: { value: 'Izmijenjena Liga' } });
    fireEvent.click(screen.getByText('Spasi Promjene'));

    await waitFor(() => {
      expect(ligaApi.updateLiga).toHaveBeenCalledWith(1, expect.objectContaining({ naziv: 'Izmijenjena Liga' }));
    });

    fireEvent.click(screen.getByText('Obriši'));
    fireEvent.click(screen.getByText('Potvrdi?'));

    await waitFor(() => {
      expect(ligaApi.deleteLiga).toHaveBeenCalledWith(1);
    });
  });

  it('dodavanje tima u ligu poziva odgovarajuci API ako UI podrzava', async () => {
    const { container } = renderPage();

    await screen.findByText('Premijer liga');
    fireEvent.click(screen.getByText('Upravljaj timovima'));
    await screen.findByText(/Timovi/);
    fireEvent.change(container.querySelector('select'), { target: { value: '2' } });
    fireEvent.click(screen.getByText('Dodaj'));

    await waitFor(() => {
      expect(ligaApi.dodajTimULigu).toHaveBeenCalledWith(1, 2);
    });
  });

  it('prikazuje gresku ako API vrati error', async () => {
    ligaApi.fetchLige.mockRejectedValueOnce({ response: { data: { poruka: 'Greška liga' } } });

    renderPage();

    expect(await screen.findByText('Greška liga')).toBeInTheDocument();
  });
});
