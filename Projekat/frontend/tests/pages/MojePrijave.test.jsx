import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MojePrijave from '../../src/pages/MojePrijave';
import * as applicationsApi from '../../src/api/applicationsApi';

vi.mock('../../src/api/applicationsApi', () => ({
  fetchMojePrijave: vi.fn(),
}));

vi.mock('../../src/api/authApi', () => ({
  logoutUser: vi.fn(),
}));

const prijava = {
  prijavaId: 1,
  tim: 'FK Test',
  takmicenje: 'Premijer liga',
  sport: 'Fudbal',
  status: 'ODOBRENO',
  datumPrijave: '2026-05-01T10:00:00.000Z',
  defaultnaLokacija: 'Arena Centar',
};

function renderPage() {
  localStorage.setItem('token', 'token');
  localStorage.setItem(
    'korisnik',
    JSON.stringify({ korisnikId: 10, trenutnaUloga: 'TRENER', punoIme: 'Trener Test' })
  );

  return render(
    <BrowserRouter>
      <MojePrijave />
    </BrowserRouter>
  );
}

describe('MojePrijave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    applicationsApi.fetchMojePrijave.mockResolvedValue({ prijave: [prijava] });
  });

  it('prikazuje listu prijava i status badge', async () => {
    renderPage();

    expect(await screen.findByText('FK Test')).toBeInTheDocument();
    expect(screen.getByText('Premijer liga')).toBeInTheDocument();
    expect(screen.getByText('Fudbal')).toBeInTheDocument();
    expect(screen.getByText('ODOBRENO')).toBeInTheDocument();
    expect(screen.getByText('Arena Centar')).toBeInTheDocument();
  });

  it('prikazuje empty state kada nema prijava', async () => {
    applicationsApi.fetchMojePrijave.mockResolvedValueOnce({ prijave: [] });

    renderPage();

    expect(await screen.findByText('Jos nemate prijavljenih takmicenja.')).toBeInTheDocument();
  });

  it('prikazuje error state ako API vrati gresku', async () => {
    applicationsApi.fetchMojePrijave.mockRejectedValueOnce({
      response: { data: { poruka: 'Nemate pristup' } },
    });

    renderPage();

    expect(await screen.findByText('Nemate pristup')).toBeInTheDocument();
  });

  it('osvjezava podatke na klik', async () => {
    renderPage();

    await screen.findByText('FK Test');
    fireEvent.click(screen.getByText('Osvjezi'));

    await waitFor(() => {
      expect(applicationsApi.fetchMojePrijave).toHaveBeenCalledTimes(2);
    });
  });
});
