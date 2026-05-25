import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VlasnikDashboard from '../VlasnikDashboard';
import {
  getVlasnikObjekti,
  getVlasnikRezervacije,
  verifikujZahtjevRezervacije,
} from '../../api/vlasnikApi';

vi.mock('../../components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('../../api/vlasnikApi', () => ({
  getVlasnikObjekti: vi.fn(),
  getVlasnikRezervacije: vi.fn(),
  verifikujZahtjevRezervacije: vi.fn(),
}));

const pendingZahtjev = {
  id: 7,
  izvor: 'ZAHTJEV_ZA_REZERVACIJU',
  korisnik: {
    id: 3,
    punoIme: 'Samer Sameric',
    email: 'samer@test.ba',
    statusPouzdanosti: 'NEPOUZDAN',
    brojPrekrsenihRezervacija: 3,
  },
  teren: { id: 2, naziv: 'Teren 1' },
  datumVrijeme: '2026-05-25T18:00:00.000Z',
  tipTermina: 'Individualni',
  status: 'NA_CEKANJU',
};

const potvrdjenaRezervacija = {
  id: 8,
  izvor: 'REZERVACIJA',
  korisnik: {
    id: 4,
    punoIme: 'Pouzdan Igrac',
    email: 'igrac@test.ba',
    statusPouzdanosti: 'POUZDAN',
    brojPrekrsenihRezervacija: 0,
  },
  teren: { id: 2, naziv: 'Teren 1' },
  datumVrijeme: '2026-05-25T20:00:00.000Z',
  tipTermina: 'Individualni',
  status: 'POTVRDJENO',
};

function mockDashboardResponse(data = [pendingZahtjev, potvrdjenaRezervacija]) {
  getVlasnikRezervacije.mockResolvedValue({
    data,
    pagination: {
      page: 1,
      limit: 15,
      total: data.length,
      totalPages: 1,
    },
    analytics: {
      ukupnoRezervacijaDanas: 1,
      zahtjeviNaCekanju: data.filter((item) => item.status === 'NA_CEKANJU').length,
    },
  });
}

function renderDashboard() {
  return render(
    <BrowserRouter>
      <VlasnikDashboard />
    </BrowserRouter>
  );
}

describe('VlasnikDashboard Dev2 verifikacija', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    getVlasnikObjekti.mockResolvedValue([{ objekatId: 2, naziv: 'Teren 1' }]);
    mockDashboardResponse();
    verifikujZahtjevRezervacije.mockResolvedValue({ message: 'Zahtjev je odobren.' });
  });

  it('prikazuje posebnu sekciju za pending zahtjeve nepouzdanih korisnika', async () => {
    renderDashboard();

    expect(await screen.findByText('Zahtjevi nepouzdanih korisnika na čekanju')).toBeInTheDocument();
    expect(screen.getAllByText(/Samer Sameric/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 prekršaja/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Odobri' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Odbij' })).toBeInTheDocument();
  });

  it('šalje ODOBRI akciju i osvježava dashboard', async () => {
    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Odobri' }));

    await waitFor(() => {
      expect(verifikujZahtjevRezervacije).toHaveBeenCalledWith(7, { akcija: 'ODOBRI' });
    });
    expect(getVlasnikRezervacije).toHaveBeenCalledTimes(2);
  });

  it('otvara ODBIJ modal i ne dozvoljava potvrdu prije 10 karaktera', async () => {
    verifikujZahtjevRezervacije.mockResolvedValue({ message: 'Zahtjev je odbijen.' });
    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Odbij' }));

    expect(screen.getByText('Unesite razlog odbijanja termina')).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: 'Potvrdi odbijanje' });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Unesite najmanje 10 karaktera...'), {
      target: { value: 'Validan razlog' },
    });
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(verifikujZahtjevRezervacije).toHaveBeenCalledWith(7, {
        akcija: 'ODBIJ',
        razlogOdbijanja: 'Validan razlog',
      });
    });
  });
});
