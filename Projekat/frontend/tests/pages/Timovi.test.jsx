import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Timovi from '../../src/pages/Timovi';
import * as teamApi from '../../src/api/teamApi';

vi.mock('../../src/api/teamApi', () => ({
  fetchTeams: vi.fn(),
  fetchSports: vi.fn(),
  fetchCoaches: vi.fn(),
  fetchPlayers: vi.fn(),
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
  deleteTeam: vi.fn(),
  addPlayerToTeam: vi.fn(),
  removePlayerFromTeam: vi.fn(),
}));

const teams = [
  {
    timId: 1,
    naziv: 'FK Test',
    sportId: 1,
    opis: 'Opis tima',
    status: 'ACTIVE',
    sport: { naziv: 'Fudbal' },
    clanstvaUcesnika: [{ korisnikId: 20, ulogaUTimu: 'IGRAC', status: 'ACTIVE', korisnik: { punoIme: 'Igrac Test' } }],
  },
];

function renderPage(korisnik = { korisnikId: 1, trenutnaUloga: 'ADMINISTRATOR', punoIme: 'Admin' }) {
  localStorage.setItem('token', 'token');
  localStorage.setItem('korisnik', JSON.stringify(korisnik));
  return render(
    <BrowserRouter>
      <Timovi />
    </BrowserRouter>
  );
}

describe('Timovi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    teamApi.fetchTeams.mockResolvedValue(teams);
    teamApi.fetchSports.mockResolvedValue([{ sportId: 1, naziv: 'Fudbal' }]);
    teamApi.fetchCoaches.mockResolvedValue([{ id: 10, ime: 'Trener Test' }]);
    teamApi.fetchPlayers.mockResolvedValue([{ id: 21, ime: 'Novi Igrac' }]);
    teamApi.createTeam.mockResolvedValue({ timId: 2, naziv: 'KK Test' });
    teamApi.updateTeam.mockResolvedValue({ timId: 1, naziv: 'FK Novi' });
    teamApi.deleteTeam.mockResolvedValue({ message: 'OK' });
    teamApi.addPlayerToTeam.mockResolvedValue({ id: 1 });
    teamApi.removePlayerFromTeam.mockResolvedValue({ message: 'OK' });
  });

  it('stranica prikazuje listu timova iz mockanog API-ja i ne prikazuje hash podatke', async () => {
    const { container } = renderPage();

    expect(await screen.findByText('FK Test')).toBeInTheDocument();
    expect(screen.getAllByText('Fudbal').length).toBeGreaterThan(0);
    expect(container.textContent).not.toContain('lozinkaHash');
    expect(container.textContent).not.toContain('password');
  });

  it('forma za kreiranje tima salje ispravne podatke prema API-ju', async () => {
    const { container } = renderPage();

    await screen.findByText('FK Test');
    fireEvent.click(screen.getByText('Kreiraj tim'));
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: 'KK Test' } });
    fireEvent.change(container.querySelector('select[name="sportId"]'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /^Kreiraj$/i }));

    await waitFor(() => {
      expect(teamApi.createTeam).toHaveBeenCalledWith(expect.objectContaining({ name: 'KK Test', sportId: 1 }));
    });
  });

  it('kreiranje bez naziva ili sporta ne salje request ako UI validacija radi', async () => {
    renderPage();

    await screen.findByText('FK Test');
    fireEvent.click(screen.getByText('Kreiraj tim'));
    fireEvent.click(screen.getByRole('button', { name: /^Kreiraj$/i }));

    await waitFor(() => {
      expect(teamApi.createTeam).not.toHaveBeenCalled();
    });
  });

  it('delete tima poziva odgovarajuci API', async () => {
    renderPage();

    await screen.findByText('FK Test');
    fireEvent.click(screen.getByRole('button', { name: '' }));
    fireEvent.click(screen.getByText('Obriši'));
    fireEvent.click(screen.getByText('DA'));

    await waitFor(() => {
      expect(teamApi.deleteTeam).toHaveBeenCalledWith(1);
    });
  });

  it('prikazuje gresku ako API vrati error', async () => {
    teamApi.fetchTeams.mockRejectedValueOnce({ response: { data: { message: 'Greška timova' } } });

    renderPage();

    expect(await screen.findByText('Greška timova')).toBeInTheDocument();
  });
});
