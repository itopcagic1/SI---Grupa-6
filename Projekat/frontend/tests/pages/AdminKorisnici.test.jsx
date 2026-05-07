import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdminKorisnici from '../../src/pages/AdminKorisnici';
import * as adminApi from '../../src/api/adminApi';

vi.mock('../../src/api/adminApi', () => ({
  getKorisnici: vi.fn(),
  obradiZahtjevUloge: vi.fn(),
  obrisiKorisnika: vi.fn(),
  blokirajKorisnika: vi.fn(),
}));

vi.mock('../../src/api/authApi', () => ({
  logoutUser: vi.fn(),
}));

const korisnici = [
  {
    korisnikId: 1,
    punoIme: 'Pending Korisnik',
    email: 'pending@example.com',
    uloga: 'NAVIJAC',
    trazenaUloga: 'TRENER',
    statusUloge: 'PENDING',
    statusPouzdanosti: 'AKTIVAN',
  },
];

function renderPage() {
  localStorage.setItem('token', 'admin-token');
  localStorage.setItem(
    'korisnik',
    JSON.stringify({ punoIme: 'Admin Test', email: 'admin@example.com', trenutnaUloga: 'ADMINISTRATOR' })
  );

  return render(
    <BrowserRouter>
      <AdminKorisnici />
    </BrowserRouter>
  );
}

describe('AdminKorisnici', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    adminApi.getKorisnici.mockResolvedValue({ korisnici });
    adminApi.obradiZahtjevUloge.mockResolvedValue({ poruka: 'OK' });
    adminApi.obrisiKorisnika.mockResolvedValue({ poruka: 'OK' });
    adminApi.blokirajKorisnika.mockResolvedValue({ poruka: 'OK' });
  });

  it('stranica prikazuje listu korisnika iz mockanog API-ja', async () => {
    renderPage();

    expect(await screen.findByText('pending@example.com')).toBeInTheDocument();
    expect(screen.getByText('NAVIJAC')).toBeInTheDocument();
    expect(screen.getByText('TRENER')).toBeInTheDocument();
  });

  it('odobravanje posebne uloge poziva odgovarajuci API', async () => {
    renderPage();

    await screen.findByText('pending@example.com');
    fireEvent.click(screen.getByText('Odobri'));

    await waitFor(() => {
      expect(adminApi.obradiZahtjevUloge).toHaveBeenCalledWith('admin-token', 1, 'ODOBRI', '');
    });
  });

  it('odbijanje posebne uloge poziva odgovarajuci API kada je razlog unesen', async () => {
    renderPage();

    await screen.findByText('pending@example.com');
    fireEvent.change(screen.getByPlaceholderText('Razlog odbijanja...'), {
      target: { value: 'Nedostaje dokumentacija' },
    });
    fireEvent.click(screen.getByText('Odbij'));

    await waitFor(() => {
      expect(adminApi.obradiZahtjevUloge).toHaveBeenCalledWith(
        'admin-token',
        1,
        'ODBIJ',
        'Nedostaje dokumentacija'
      );
    });
  });

  it('klik na blokiranje korisnika poziva odgovarajuci API', async () => {
    renderPage();

    await screen.findByText('pending@example.com');
    fireEvent.click(screen.getByText('pending@example.com'));
    fireEvent.click(await screen.findByText('Blokiraj korisnika'));

    await waitFor(() => {
      expect(adminApi.blokirajKorisnika).toHaveBeenCalledWith('admin-token', 1, 'BLOKIRAJ');
    });
  });

  it('klik na brisanje korisnika poziva odgovarajuci API nakon potvrde', async () => {
    renderPage();

    await screen.findByText('pending@example.com');
    fireEvent.click(screen.getByText('pending@example.com'));
    fireEvent.click(await screen.findByText('Obriši korisnika'));
    fireEvent.click(screen.getByText('Da, obriši'));

    await waitFor(() => {
      expect(adminApi.obrisiKorisnika).toHaveBeenCalledWith('admin-token', 1);
    });
  });

  it('prikazuje gresku ako API vrati error i ne prikazuje password/hash podatke', async () => {
    vi.clearAllMocks();
    adminApi.getKorisnici.mockRejectedValue(new Error('API error'));
    adminApi.obradiZahtjevUloge.mockResolvedValue({ poruka: 'OK' });
    adminApi.obrisiKorisnika.mockResolvedValue({ poruka: 'OK' });
    adminApi.blokirajKorisnika.mockResolvedValue({ poruka: 'OK' });

    const { container } = renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Greška pri učitavanju korisnika/)).toBeInTheDocument();
    });
    expect(container.textContent).not.toContain('password');
    expect(container.textContent).not.toContain('lozinkaHash');
  });
});
