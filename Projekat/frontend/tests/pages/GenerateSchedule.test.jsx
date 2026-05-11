import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import GenerateSchedule from '../../src/pages/GenerateSchedule';
import * as ligaApi from '../../src/api/ligaApi';
import * as matchApi from '../../src/api/matchApi';

vi.mock('../../src/api/ligaApi', () => ({
  fetchLige: vi.fn(),
}));

vi.mock('../../src/api/matchApi', () => ({
  generateSchedule: vi.fn(),
}));

vi.mock('../../src/api/authApi', () => ({
  logoutUser: vi.fn(),
}));

// FIX: mock useNavigate kako bismo mogli provjeriti redirect
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...await importOriginal(),
  useNavigate: () => mockNavigate,
}));

const mockLige = [
  {
    takmicenjeId: 1,
    naziv: 'Premijer liga',
    sport: { naziv: 'Fudbal' },
  },
];

// FIX: koristimo MemoryRouter umjesto BrowserRouter — bolji za testiranje navigacije
function renderPage(
  korisnik = { korisnikId: 1, trenutnaUloga: 'ORGANIZATOR', punoIme: 'Organizator' }
) {
  localStorage.setItem('token', 'token');
  localStorage.setItem('korisnik', JSON.stringify(korisnik));
  return render(
    <MemoryRouter>
      <GenerateSchedule />
    </MemoryRouter>
  );
}

describe('GenerateSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
    ligaApi.fetchLige.mockResolvedValue({ lige: mockLige });
  });

  it('prikazuje formu za generisanje rasporeda', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Generiši raspored' })).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Takmičenje')).toBeInTheDocument();
    expect(screen.getByLabelText('Početni datum')).toBeInTheDocument();
    expect(screen.getByLabelText('Vrijeme utakmica')).toBeInTheDocument();
    expect(screen.getByLabelText('Lokacija utakmica')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generiši raspored' })).toBeInTheDocument();
  });

  it('učitava i prikazuje ligu u dropdown-u', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Premijer liga (Fudbal)')).toBeInTheDocument();
    });

    expect(ligaApi.fetchLige).toHaveBeenCalledTimes(1);
  });

  it('uspješno generiše raspored i prikazuje rezultat', async () => {
    const mockResult = {
      uspjeh: true,
      poruka: 'Raspored uspješno generisan',
      brojKreiranihUtakmica: 1,
      utakmice: [
        {
          utakmicaId: 1,
          domaciTim: { naziv: 'Tim A' },
          gostujuciTim: { naziv: 'Tim B' },
          vrijemePocetka: '2024-01-01T15:00:00.000Z',
          lokacijaOpis: 'Stadion',
        },
      ],
    };

    matchApi.generateSchedule.mockResolvedValue(mockResult);

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('Takmičenje')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Takmičenje'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Početni datum'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Vrijeme utakmica'), { target: { value: '15:00' } });
    fireEvent.change(screen.getByLabelText('Lokacija utakmica'), { target: { value: 'Stadion' } });

    fireEvent.click(screen.getByRole('button', { name: 'Generiši raspored' }));

    await waitFor(() => {
      expect(screen.getByText('Raspored uspješno generisan')).toBeInTheDocument();
    });

    expect(screen.getByText('Broj kreiranih utakmica: 1')).toBeInTheDocument();
    expect(screen.getByText('Tim A vs Tim B')).toBeInTheDocument();
    expect(screen.getByText('Lokacija: Stadion')).toBeInTheDocument();
  });

  it('prikazuje grešku pri neuspješnom generisanju', async () => {
    matchApi.generateSchedule.mockRejectedValue({
      response: { data: { poruka: 'Greška pri generisanju rasporeda' } },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('Takmičenje')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Takmičenje'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Početni datum'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Vrijeme utakmica'), { target: { value: '15:00' } });

    fireEvent.click(screen.getByRole('button', { name: 'Generiši raspored' }));

    await waitFor(() => {
      expect(screen.getByText('Greška pri generisanju rasporeda')).toBeInTheDocument();
    });

    // Provjera da rezultat nije prikazan
    expect(screen.queryByText('Raspored uspješno generisan')).not.toBeInTheDocument();
  });

  it('dugme je onemogućeno dok traje generisanje', async () => {
    // Servis koji se nikad ne razriješi (simulira dugo čekanje)
    matchApi.generateSchedule.mockImplementation(() => new Promise(() => {}));

    renderPage();

    await waitFor(() => {
      expect(screen.getByLabelText('Takmičenje')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Takmičenje'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Početni datum'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Vrijeme utakmica'), { target: { value: '15:00' } });

    fireEvent.click(screen.getByRole('button', { name: 'Generiši raspored' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Generisanje...' })).toBeDisabled();
    });
  });

  it('redirect-uje korisnike koji nisu organizatori ili administratori', async () => {
    // FIX: waitFor sada stvarno provjerava da je navigate pozvan sa '/dashboard'
    renderPage({ korisnikId: 1, trenutnaUloga: 'IGRAC', punoIme: 'Igrač' });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    // Forma se ne smije prikazati
    expect(screen.queryByLabelText('Takmičenje')).not.toBeInTheDocument();
  });
});