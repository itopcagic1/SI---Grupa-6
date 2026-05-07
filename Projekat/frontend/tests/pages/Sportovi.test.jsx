import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sportovi from '../../src/pages/Sportovi';
import * as teamApi from '../../src/api/teamApi';

vi.mock('../../src/api/teamApi', () => ({
  fetchSports: vi.fn(),
  createSport: vi.fn(),
  updateSport: vi.fn(),
  deleteSport: vi.fn(),
}));

const sportovi = [
  { sportId: 1, naziv: 'Fudbal', opis: 'Najpopularniji sport', jeTimskiSport: true },
];

function renderPage() {
  localStorage.setItem('korisnik', JSON.stringify({ trenutnaUloga: 'ADMINISTRATOR' }));
  return render(
    <BrowserRouter>
      <Sportovi />
    </BrowserRouter>
  );
}

describe('Sportovi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    teamApi.fetchSports.mockResolvedValue(sportovi);
    teamApi.createSport.mockResolvedValue({ sportId: 2, naziv: 'Rukomet' });
    teamApi.updateSport.mockResolvedValue({ sportId: 1, naziv: 'Fudbal' });
    teamApi.deleteSport.mockResolvedValue({ message: 'OK' });
  });

  it('stranica prikazuje listu sportova iz mockanog API-ja', async () => {
    renderPage();

    expect(await screen.findByText('Fudbal')).toBeInTheDocument();
    expect(screen.getByText('Najpopularniji sport')).toBeInTheDocument();
  });

  it('forma za dodavanje sporta salje ispravan naziv prema API-ju', async () => {
    const { container } = renderPage();

    await screen.findByText('Fudbal');
    fireEvent.click(screen.getByText('+ Novi sport'));
    fireEvent.change(container.querySelector('input[name="naziv"]'), {
      target: { value: 'Rukomet' },
    });
    fireEvent.click(screen.getByText('Sačuvaj'));

    await waitFor(() => {
      expect(teamApi.createSport).toHaveBeenCalledWith(
        expect.objectContaining({ naziv: 'Rukomet' })
      );
    });
  });

  it('prazan naziv sporta ne salje request ako UI validacija radi', async () => {
    renderPage();

    await screen.findByText('Fudbal');
    fireEvent.click(screen.getByText('+ Novi sport'));
    fireEvent.click(screen.getByText('Sačuvaj'));

    await waitFor(() => {
      expect(teamApi.createSport).not.toHaveBeenCalled();
    });
  });

  it('edit i delete sporta pozivaju odgovarajuce API funkcije', async () => {
    const { container } = renderPage();

    await screen.findByText('Fudbal');
    fireEvent.click(screen.getByText('UREDI'));
    fireEvent.change(container.querySelector('textarea[name="opis"]'), {
      target: { value: 'Novi opis' },
    });
    fireEvent.click(screen.getByText('Sačuvaj'));

    await waitFor(() => {
      expect(teamApi.updateSport).toHaveBeenCalledWith(1, expect.objectContaining({ opis: 'Novi opis' }));
    });

    fireEvent.click(screen.getByText('OBRIŠI'));
    fireEvent.click(screen.getByText('DA'));

    await waitFor(() => {
      expect(teamApi.deleteSport).toHaveBeenCalledWith(1);
    });
  });

  it('prikazuje gresku ako API vrati error', async () => {
    teamApi.fetchSports.mockRejectedValueOnce(new Error('API error'));

    renderPage();

    expect(await screen.findByText('Nije moguće učitati sportove.')).toBeInTheDocument();
  });
});
