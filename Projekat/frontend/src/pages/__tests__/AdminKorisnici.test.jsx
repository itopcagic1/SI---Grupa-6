import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mockovi ─────────────────────────────────────────────────────────
vi.mock('../../api/adminApi', () => ({
  getKorisnici: vi.fn(),
  getBlokiraniKorisnici: vi.fn(),
  obradiZahtjevUloge: vi.fn(),
  blokirajKorisnika: vi.fn(),
  obrisiKorisnika: vi.fn(),
  getKorisnikDetalji: vi.fn(),
  promijeniUlogu: vi.fn(),
}));

vi.mock('../../api/authApi', () => ({
  logoutUser: vi.fn(),
}));

vi.mock('../../components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

import {
  getKorisnici,
  getBlokiraniKorisnici,
  obradiZahtjevUloge,
  blokirajKorisnika,
  obrisiKorisnika,
  getKorisnikDetalji,
  promijeniUlogu,
} from '../../api/adminApi';

import AdminKorisnici from '../AdminKorisnici';
import AdminKorisnikDetalji from '../AdminKorisnikDetalji';

// ── Pomocni podaci ───────────────────────────────────────────────────
const mockKorisnici = [
  {
    korisnikId: 1,
    punoIme: 'Test Korisnik',
    email: 'test@example.com',
    uloga: 'NAVIJAC',
    trazenaUloga: 'TRENER',
    statusUloge: 'PENDING',
    statusPouzdanosti: 'AKTIVAN',
    brojPreksrenihRezervacija: 0,
  },
  {
    korisnikId: 2,
    punoIme: 'Drugi Korisnik',
    email: 'drugi@example.com',
    uloga: 'IGRAC',
    trazenaUloga: null,
    statusUloge: 'ODOBREN',
    statusPouzdanosti: 'AKTIVAN',
    brojPreksrenihRezervacija: 1,
  },
];

const mockBlokiraniKorisnici = [
  {
    korisnikId: 3,
    punoIme: 'Blokirani Korisnik',
    email: 'blokiran@example.com',
    uloga: 'NAVIJAC',
    statusPouzdanosti: 'BLOKIRAN',
    razlogBlokiranja: 'Kršenje pravila.',
    brojPreksrenihRezervacija: 3,
  },
];

const mockKorisnikDetalji = {
  korisnikId: 1,
  punoIme: 'Test Korisnik',
  email: 'test@example.com',
  uloga: 'NAVIJAC',
  trazenaUloga: 'TRENER',
  statusUloge: 'PENDING',
  statusPouzdanosti: 'AKTIVAN',
  razlogBlokiranja: null,
  razlogOdbijanja: null,
  brojPreksrenihRezervacija: 0,
  datumKreiranja: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('korisnik', JSON.stringify({
    korisnikId: 100,
    punoIme: 'Admin',
    email: 'admin@example.com',
    uloga: 'ADMINISTRATOR',
  }));

  getKorisnici.mockResolvedValue({ korisnici: mockKorisnici });
  getBlokiraniKorisnici.mockResolvedValue({ korisnici: mockBlokiraniKorisnici });
});

// ════════════════════════════════════════════════════════════════════
// AdminKorisnici — UI testovi
// ════════════════════════════════════════════════════════════════════

describe('AdminKorisnici UI', () => {

  it('prikazuje naslov Admin Panel', async () => {
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('prikazuje tri taba: Novi zahtjevi, Svi korisnici, Blokirani korisnici', async () => {
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    expect(screen.getByText(/Novi zahtjevi/i)).toBeInTheDocument();
    expect(screen.getByText(/Svi korisnici/i)).toBeInTheDocument();
    expect(screen.getByText(/Blokirani korisnici/i)).toBeInTheDocument();
  });

  it('prikazuje search input', async () => {
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    expect(screen.getByPlaceholderText(/Pronađi korisnika/i)).toBeInTheDocument();
  });

  it('prikazuje korisnike iz pending taba', async () => {
    getKorisnici.mockResolvedValue({ korisnici: [mockKorisnici[0]] });
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Test Korisnik')).toBeInTheDocument();
    });
  });

  it('prikazuje dugmad Odobri i Odbij za PENDING korisnike', async () => {
    getKorisnici.mockResolvedValue({ korisnici: [mockKorisnici[0]] });
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Odobri')).toBeInTheDocument();
      expect(screen.getByText('Odbij')).toBeInTheDocument();
    });
  });

  it('prikazuje poruku greske ako se ne unese razlog pri odbijanju', async () => {
    getKorisnici.mockResolvedValue({ korisnici: [mockKorisnici[0]] });
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);

    await waitFor(() => screen.getByText('Odbij'));
    fireEvent.click(screen.getByText('Odbij'));

    await waitFor(() => {
      expect(screen.getByText(/Unesite razlog odbijanja/i)).toBeInTheDocument();
    });
  });

  it('poziva obradiZahtjevUloge s ODOBRI akcijom na klik Odobri', async () => {
    obradiZahtjevUloge.mockResolvedValue({ poruka: 'OK' });
    getKorisnici.mockResolvedValue({ korisnici: [mockKorisnici[0]] });
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);

    await waitFor(() => screen.getByText('Odobri'));
    fireEvent.click(screen.getByText('Odobri'));

    await waitFor(() => {
      expect(obradiZahtjevUloge).toHaveBeenCalledWith(
        'test-token', 1, 'ODOBRI', ''
      );
    });
  });

  it('prikazuje success poruku nakon odobravanja', async () => {
    obradiZahtjevUloge.mockResolvedValue({ poruka: 'OK' });
    getKorisnici.mockResolvedValue({ korisnici: [mockKorisnici[0]] });
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);

    await waitFor(() => screen.getByText('Odobri'));
    fireEvent.click(screen.getByText('Odobri'));

    await waitFor(() => {
      expect(screen.getByText(/Uloga odobrena/i)).toBeInTheDocument();
    });
  });

  it('prebacuje na tab Svi korisnici na klik', async () => {
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Svi korisnici/i));

    await waitFor(() => {
      expect(getKorisnici).toHaveBeenCalledWith('test-token', '', '');
    });
  });

  it('prikazuje filter za status samo na Svi korisnici tabu', async () => {
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);

    expect(screen.queryByText('Svi statusi')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Svi korisnici/i));

    await waitFor(() => {
      expect(screen.getByText('Svi statusi')).toBeInTheDocument();
    });
  });

  it('prikazuje blokirane korisnike na Blokirani tabu', async () => {
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Blokirani korisnici/i));

    await waitFor(() => {
      expect(screen.getByText('Blokirani Korisnik')).toBeInTheDocument();
      expect(screen.getByText('Kršenje pravila.')).toBeInTheDocument();
    });
  });

  it('prikazuje dugme Odblokiraj za blokirane korisnike', async () => {
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Blokirani korisnici/i));

    await waitFor(() => {
      expect(screen.getByText('Odblokiraj')).toBeInTheDocument();
    });
  });

  it('prikazuje potvrdu pri kliku na Odblokiraj', async () => {
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Blokirani korisnici/i));

    await waitFor(() => screen.getByText('Odblokiraj'));
    fireEvent.click(screen.getByText('Odblokiraj'));

    await waitFor(() => {
      expect(screen.getByText('Sigurno?')).toBeInTheDocument();
      expect(screen.getByText('Da')).toBeInTheDocument();
      expect(screen.getByText('Ne')).toBeInTheDocument();
    });
  });

  it('poziva blokirajKorisnika s ODBLOKIRAJ na potvrdu', async () => {
    blokirajKorisnika.mockResolvedValue({ poruka: 'OK' });
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Blokirani korisnici/i));

    await waitFor(() => screen.getByText('Odblokiraj'));
    fireEvent.click(screen.getByText('Odblokiraj'));
    await waitFor(() => screen.getByText('Da'));
    fireEvent.click(screen.getByText('Da'));

    await waitFor(() => {
      expect(blokirajKorisnika).toHaveBeenCalledWith('test-token', 3, 'ODBLOKIRAJ');
    });
  });

  it('prikazuje empty state poruku kada nema korisnika', async () => {
    getKorisnici.mockResolvedValue({ korisnici: [] });
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText('Nema korisnika za prikaz.')).toBeInTheDocument();
    });
  });

  it('prikazuje empty state poruku kada nema blokiranih korisnika', async () => {
    getBlokiraniKorisnici.mockResolvedValue({ korisnici: [] });
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Blokirani korisnici/i));

    await waitFor(() => {
      expect(screen.getByText('Nema blokiranih korisnika.')).toBeInTheDocument();
    });
  });

  it('prikazuje gresku ako ucitavanje ne uspije', async () => {
    getKorisnici.mockRejectedValue(new Error('API greška'));
    render(<BrowserRouter><AdminKorisnici /></BrowserRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Greška pri učitavanju korisnika/i)).toBeInTheDocument();
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// AdminKorisnikDetalji — UI testovi
// ════════════════════════════════════════════════════════════════════

describe('AdminKorisnikDetalji UI', () => {

  const renderDetalji = (id = '1') =>
    render(
      <MemoryRouter initialEntries={[`/admin/korisnici/${id}`]}>
        <Routes>
          <Route path="/admin/korisnici/:id" element={<AdminKorisnikDetalji />} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    getKorisnikDetalji.mockResolvedValue({ korisnik: mockKorisnikDetalji });
  });

  it('prikazuje ime i email korisnika', async () => {
    renderDetalji();
    await waitFor(() => {
      expect(screen.getByText('Test Korisnik')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('prikazuje ulogu, status zahtjeva i status naloga', async () => {
    renderDetalji();
    await waitFor(() => {
      // NAVIJAC se pojavljuje i u kartici i u select opciji — koristimo getAllByText
      expect(screen.getAllByText('NAVIJAC')[0]).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.getByText('AKTIVAN')).toBeInTheDocument();
    });
  });

  it('prikazuje sekciju Zahtjev za ulogu samo kada je PENDING', async () => {
    renderDetalji();
    await waitFor(() => {
      expect(screen.getByText(/Zahtjev za ulogu/i)).toBeInTheDocument();
      expect(screen.getByText('Odobri ulogu')).toBeInTheDocument();
      expect(screen.getByText('Odbij zahtjev')).toBeInTheDocument();
    });
  });

  it('ne prikazuje sekciju Zahtjev za ulogu kada nije PENDING', async () => {
    getKorisnikDetalji.mockResolvedValue({
      korisnik: { ...mockKorisnikDetalji, statusUloge: 'ODOBREN' },
    });
    renderDetalji();
    await waitFor(() => {
      expect(screen.queryByText('Odobri ulogu')).not.toBeInTheDocument();
    });
  });

  it('prikazuje dropdown za promjenu uloge u admin akcijama', async () => {
    renderDetalji();
    await waitFor(() => {
      expect(screen.getByText(/Promijeni ulogu/i)).toBeInTheDocument();
      expect(screen.getByText('Sačuvaj ulogu')).toBeInTheDocument();
    });
  });

  it('dugme Sacuvaj ulogu je disabled kada je ista uloga odabrana', async () => {
    getKorisnikDetalji.mockResolvedValue({
      korisnik: { ...mockKorisnikDetalji, uloga: 'NAVIJAC', statusUloge: 'ODOBREN' },
    });
    renderDetalji();
    await waitFor(() => {
      const btn = screen.getByText(/Sačuvaj ulogu/i);
      expect(btn).toBeDisabled();
    });
  });

  it('prikazuje dugme Blokiraj korisnika za aktivnog korisnika', async () => {
    renderDetalji();
    await waitFor(() => {
      expect(screen.getByText(/Blokiraj korisnika/i)).toBeInTheDocument();
    });
  });

  it('prikazuje textarea za razlog blokiranja nakon klika na Blokiraj', async () => {
    renderDetalji();
    await waitFor(() => screen.getByText(/Blokiraj korisnika/i));
    fireEvent.click(screen.getByText(/Blokiraj korisnika/i));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Unesite razlog blokiranja/i)).toBeInTheDocument();
      expect(screen.getByText(/Potvrdi/i)).toBeInTheDocument();
      expect(screen.getByText(/Odustani/i)).toBeInTheDocument();
    });
  });

  it('skriva textarea za razlog blokiranja na klik Odustani', async () => {
    renderDetalji();
    await waitFor(() => screen.getByText(/Blokiraj korisnika/i));
    fireEvent.click(screen.getByText(/Blokiraj korisnika/i));
    await waitFor(() => screen.getByText(/Odustani/i));
    fireEvent.click(screen.getByText(/Odustani/i));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Unesite razlog blokiranja/i)).not.toBeInTheDocument();
    });
  });

  it('prikazuje gresku ako se klikne Potvrdi bez razloga blokiranja', async () => {
    renderDetalji();
    await waitFor(() => screen.getByText(/Blokiraj korisnika/i));
    fireEvent.click(screen.getByText(/Blokiraj korisnika/i));
    await waitFor(() => screen.getByText('Potvrdi'));
    fireEvent.click(screen.getByText('Potvrdi'));

    await waitFor(() => {
      expect(screen.getByText(/Unesite razlog blokiranja/i)).toBeInTheDocument();
    });
  });

  it('prikazuje crvenu karticu s razlogom blokiranja za blokiranog korisnika', async () => {
    getKorisnikDetalji.mockResolvedValue({
      korisnik: {
        ...mockKorisnikDetalji,
        statusPouzdanosti: 'BLOKIRAN',
        razlogBlokiranja: 'Neprimjereno ponašanje.',
      },
    });
    renderDetalji();

    await waitFor(() => {
      expect(screen.getByText(/Nalog je blokiran/i)).toBeInTheDocument();
      expect(screen.getByText(/Neprimjereno ponašanje./i)).toBeInTheDocument();
    });
  });

  it('prikazuje dugme Odblokiraj za blokiranog korisnika', async () => {
    getKorisnikDetalji.mockResolvedValue({
      korisnik: { ...mockKorisnikDetalji, statusPouzdanosti: 'BLOKIRAN', razlogBlokiranja: 'Test' },
    });
    renderDetalji();

    await waitFor(() => {
      expect(screen.getByText(/Odblokiraj korisnika/i)).toBeInTheDocument();
    });
  });

  it('prikazuje broj prekinutih rezervacija', async () => {
    getKorisnikDetalji.mockResolvedValue({
      korisnik: { ...mockKorisnikDetalji, brojPreksrenihRezervacija: 5 },
    });
    renderDetalji();

    await waitFor(() => {
      expect(screen.getByText(/5/i)).toBeInTheDocument();
      expect(screen.getByText(/Prekinute rezervacije/i)).toBeInTheDocument();
    });
  });

  it('prikazuje dugme Obrisi korisnika', async () => {
    renderDetalji();
    await waitFor(() => {
      expect(screen.getByText(/Obriši korisnika/i)).toBeInTheDocument();
    });
  });

  it('prikazuje potvrdni dijalog pri kliku na Obrisi korisnika', async () => {
    renderDetalji();
    await waitFor(() => screen.getByText(/Obriši korisnika/i));
    fireEvent.click(screen.getByText(/Obriši korisnika/i));

    await waitFor(() => {
      expect(screen.getByText(/Sigurno želiš trajno obrisati/i)).toBeInTheDocument();
    });
  });

  it('poziva obrisiKorisnika na potvrdu brisanja', async () => {
    obrisiKorisnika.mockResolvedValue({ poruka: 'Obrisan.' });
    renderDetalji();
    await waitFor(() => screen.getByText(/Obriši korisnika/i));
    fireEvent.click(screen.getByText(/Obriši korisnika/i));
    await waitFor(() => screen.getByText(/Da, obriši/i));
    fireEvent.click(screen.getByText(/Da, obriši/i));

    await waitFor(() => {
      expect(obrisiKorisnika).toHaveBeenCalledWith('test-token', 1);
    });
  });

  it('prikazuje link nazad na listu korisnika', async () => {
    renderDetalji();
    await waitFor(() => {
      expect(screen.getByText(/Nazad na listu korisnika/i)).toBeInTheDocument();
    });
  });

  it('prikazuje gresku ako ucitavanje detalja ne uspije', async () => {
    getKorisnikDetalji.mockRejectedValue(new Error('API greška'));
    renderDetalji();

    await waitFor(() => {
      expect(screen.getByText(/Greška pri učitavanju/i)).toBeInTheDocument();
    });
  });

  it('ne prikazuje admin akcije za administratora', async () => {
    getKorisnikDetalji.mockResolvedValue({
      korisnik: { ...mockKorisnikDetalji, uloga: 'ADMINISTRATOR' },
    });
    renderDetalji();

    await waitFor(() => {
      expect(screen.queryByText(/Blokiraj korisnika/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Obriši korisnika/i)).not.toBeInTheDocument();
    });
  });

  it('poziva promijeniUlogu s novom ulogom', async () => {
    promijeniUlogu.mockResolvedValue({ poruka: 'OK' });
    getKorisnikDetalji.mockResolvedValue({
      korisnik: { ...mockKorisnikDetalji, uloga: 'NAVIJAC', statusUloge: 'ODOBREN' },
    });
    renderDetalji();

    await waitFor(() => screen.getByText(/Sačuvaj ulogu/i));

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'TRENER' } });
    fireEvent.click(screen.getByText(/Sačuvaj ulogu/i));

    await waitFor(() => {
      expect(promijeniUlogu).toHaveBeenCalledWith('test-token', 1, 'TRENER');
    });
  });
});
