import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlayerDashboard from '../../src/pages/PlayerDashboard';
import * as reservationApi from '../../src/api/reservationApi';

// ── Mockovi ─────────────────────────────────────────────────────────
vi.mock('../../src/api/reservationApi', () => ({
  getFreeIndividualTerms: vi.fn(),
  reserveIndividualTerm: vi.fn(),
  cancelIndividualTerm: vi.fn(),
  joinWaitlist: vi.fn(),
  getGrupniTreninzi: vi.fn(),
  prijaviSeNaGrupniTrening: vi.fn(),
  odjaviSeSaGrupnogTreninga: vi.fn(),
  getMojeRezervacije: vi.fn(),
  getAllFacilities: vi.fn(),
}));

vi.mock('../../src/components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

// ── Mock podaci ──────────────────────────────────────────────────────
const now = new Date();
const future = new Date(now.getTime() + 48 * 60 * 60 * 1000);
const futureStr = future.toISOString();
const futureEndStr = new Date(future.getTime() + 3600000).toISOString();

const mockFacility = { objekatId: 1, naziv: 'Arena Sarajevo', adresa: 'Ulica 1' };

const mockTermin = {
  terminId: 10,
  vrijemePocetka: futureStr,
  vrijemeZavrsetka: futureEndStr,
  status: 'SLOBODAN',
  jeMojaRezervacija: false,
  naListiCekanja: false,
  sportskiObjekat: mockFacility,
};

const mockMojaRezervacija = {
  tip: 'INDIVIDUALNI',
  status: 'POTVRDJENA',
  datumKreiranja: now.toISOString(),
  vrijemePocetka: futureStr,
  vrijemeZavrsetka: futureEndStr,
  objekat: 'Arena Sarajevo',
  adresa: 'Ulica 1',
  terminId: 10,
  rezervacijaId: 1,
};

const mockGrupniTrening = {
  treningId: 5,
  maksimalanBrojIgraca: 10,
  prijave: [],
  jaPrijavljen: false,
  terminObjekta: {
    vrijemePocetka: futureStr,
    vrijemeZavrsetka: futureEndStr,
    sportskiObjekat: { naziv: 'Sala Mostar', adresa: 'Ulica 2' },
  },
  trener: { punoIme: 'Edin Trener' },
};

const mockGrupnaRezervacija = {
  tip: 'GRUPNI',
  status: 'POTVRDJENA',
  datumKreiranja: now.toISOString(),
  vrijemePocetka: futureStr,
  vrijemeZavrsetka: futureEndStr,
  objekat: 'Sala Mostar',
  adresa: 'Ulica 2',
  trener: 'Edin Trener',
  treningId: 5,
};

// ── Setup ────────────────────────────────────────────────────────────
const renderDashboard = () =>
  render(
    <BrowserRouter>
      <PlayerDashboard />
    </BrowserRouter>
  );

const setPlayerUser = () => {
  localStorage.setItem('token', 'test-token');
  localStorage.setItem(
    'korisnik',
    JSON.stringify({
      korisnikId: 1,
      punoIme: 'Test Igrač',
      email: 'igrac@test.com',
      uloga: 'IGRAC',
    })
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  reservationApi.getFreeIndividualTerms.mockResolvedValue({ termini: [mockTermin] });
  reservationApi.getGrupniTreninzi.mockResolvedValue({ treninzi: [mockGrupniTrening] });
  reservationApi.getMojeRezervacije.mockResolvedValue({ rezervacije: [mockMojaRezervacija] });
  reservationApi.getAllFacilities.mockResolvedValue([mockFacility]);
});

// ════════════════════════════════════════════════════════════════════
// Pristup i zaglavlje
// ════════════════════════════════════════════════════════════════════
describe('PlayerDashboard — pristup i zaglavlje', () => {
  it('prikazuje poruku o odbijenom pristupu za neulogovane korisnike', () => {
    renderDashboard();
    expect(screen.getByText(/Pristup odbijen/i)).toBeInTheDocument();
  });

  it('prikazuje dashboard za igrača', async () => {
    setPlayerUser();
    renderDashboard();
    expect(screen.getByText(/Igrač/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('prikazuje broj nadolazećih rezervacija u headeru', async () => {
    setPlayerUser();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Nadolazećih rezervacija/i)).toBeInTheDocument();
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// Individualni treninzi — sekcija
// ════════════════════════════════════════════════════════════════════
describe('PlayerDashboard — individualni treninzi', () => {
  beforeEach(() => setPlayerUser());

  it('prikazuje sekciju Individualni treninzi', async () => {
    renderDashboard();
    expect(screen.getByText(/Individualni treninzi/i)).toBeInTheDocument();
  });

  it('prikazuje dropdown za odabir sportskog objekta', async () => {
    renderDashboard();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('prikazuje placeholder tekst kada objekat nije odabran', async () => {
    renderDashboard();
    expect(screen.getByText(/Odaberite sportski objekat iz padajućeg/i)).toBeInTheDocument();
  });

  it('prikazuje sedmicu i termine nakon odabira objekta', async () => {
    renderDashboard();

    await waitFor(() => screen.getAllByText('Arena Sarajevo'));

    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText(/Trenutna sedmica/i)).toBeInTheDocument();
    });
  });

  it('prikazuje navigacijske gumbe za sedmice', async () => {
    renderDashboard();

    await waitFor(() => screen.getAllByText('Arena Sarajevo'));
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText(/Sljedeća →/i)).toBeInTheDocument();
    });
  });

  it('otvara modal za rezervaciju na klik slobodnog termina', async () => {
  setPlayerUser();
  reservationApi.getFreeIndividualTerms.mockResolvedValue({ termini: [mockTermin] });
  renderDashboard();

  await waitFor(() => screen.getAllByText('Arena Sarajevo'));
  const select = screen.getAllByRole('combobox')[0];
  fireEvent.change(select, { target: { value: '1' } });

  // Klikni na dugme termina koje sadrži "Slobodno" span — uzmi zadnji jer legenda je prvi
  await waitFor(() => screen.getAllByText('Slobodno'));
  const slobodniButtons = screen.getAllByRole('button', { name: /Slobodno/i });
  fireEvent.click(slobodniButtons[0]);

  await waitFor(() => {
    expect(screen.getByText(/Potvrda rezervacije/i)).toBeInTheDocument();
  });
});

it('zatvara modal na klik Odustani', async () => {
  setPlayerUser();
  renderDashboard();

  await waitFor(() => screen.getAllByText('Arena Sarajevo'));
  const select = screen.getAllByRole('combobox')[0];
  fireEvent.change(select, { target: { value: '1' } });

  await waitFor(() => screen.getAllByRole('button', { name: /Slobodno/i }));
  fireEvent.click(screen.getAllByRole('button', { name: /Slobodno/i })[0]);
  await waitFor(() => screen.getByText('Odustani'));
  fireEvent.click(screen.getByText('Odustani'));

  await waitFor(() => {
    expect(screen.queryByText(/Potvrda rezervacije/i)).not.toBeInTheDocument();
  });
});

it('poziva reserveIndividualTerm na potvrdu rezervacije', async () => {
  reservationApi.reserveIndividualTerm.mockResolvedValue({ status: 'POTVRDJENA' });
  renderDashboard();

  await waitFor(() => screen.getAllByText('Arena Sarajevo'));
  const select = screen.getAllByRole('combobox')[0];
  fireEvent.change(select, { target: { value: '1' } });

  await waitFor(() => screen.getAllByRole('button', { name: /Slobodno/i }));
  fireEvent.click(screen.getAllByRole('button', { name: /Slobodno/i })[0]);
  await waitFor(() => screen.getByText(/Potvrdi rezervaciju/i));
  fireEvent.click(screen.getByText(/Potvrdi rezervaciju/i));

  await waitFor(() => {
    expect(reservationApi.reserveIndividualTerm).toHaveBeenCalledWith(10);
  });
});
});

// ════════════════════════════════════════════════════════════════════
// Grupni treninzi — sekcija
// ════════════════════════════════════════════════════════════════════
describe('PlayerDashboard — grupni treninzi', () => {
  beforeEach(() => setPlayerUser());

  it('prikazuje sekciju Grupni treninzi', async () => {
    renderDashboard();
    expect(screen.getByText(/Grupni treninzi/i)).toBeInTheDocument();
  });

  it('prikazuje dostupan grupni trening', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Sala Mostar')).toBeInTheDocument();
      expect(screen.getAllByText('Edin Trener')[0]).toBeInTheDocument();
    });
  });

  it('prikazuje dugme Prijavi se za slobodan trening', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Prijavi se')).toBeInTheDocument();
    });
  });

  it('poziva prijaviSeNaGrupniTrening na klik Prijavi se', async () => {
    reservationApi.prijaviSeNaGrupniTrening.mockResolvedValue({
      poruka: 'Uspješno ste se prijavili na grupni trening.',
    });
    renderDashboard();

    await waitFor(() => screen.getByText('Prijavi se'));
    fireEvent.click(screen.getByText('Prijavi se'));

    await waitFor(() => {
      expect(reservationApi.prijaviSeNaGrupniTrening).toHaveBeenCalledWith(5);
    });
  });

  it('prikazuje Odjavi se i Prijavljeni ste kada je korisnik prijavljen', async () => {
    reservationApi.getGrupniTreninzi.mockResolvedValue({
      treninzi: [{ ...mockGrupniTrening, prijave: [{ korisnikId: 1 }] }],
    });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Prijavljeni ste/i)).toBeInTheDocument();
      expect(screen.getByText(/Odjavi se/i)).toBeInTheDocument();
    });
  });

  it('prikazuje Popunjeno kada je trening pun', async () => {
    reservationApi.getGrupniTreninzi.mockResolvedValue({
      treninzi: [
        {
          ...mockGrupniTrening,
          maksimalanBrojIgraca: 2,
          prijave: [{ korisnikId: 99 }, { korisnikId: 98 }],
        },
      ],
    });
    reservationApi.getMojeRezervacije.mockResolvedValue({ rezervacije: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Popunjeno')).toBeInTheDocument();
    });
  });

  it('prikazuje empty state kada nema grupnih treninga', async () => {
    reservationApi.getGrupniTreninzi.mockResolvedValue({ treninzi: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Trenutno nema dostupnih grupnih treninga/i)).toBeInTheDocument();
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// Moje rezervacije — sekcija
// ════════════════════════════════════════════════════════════════════
describe('PlayerDashboard — moje rezervacije', () => {
  beforeEach(() => setPlayerUser());

  it('prikazuje sekciju Moje rezervacije', async () => {
    renderDashboard();
    expect(screen.getByText(/Moje rezervacije/i)).toBeInTheDocument();
  });

  it('prikazuje individualnu rezervaciju sa ispravnim tipom', async () => {
    reservationApi.getGrupniTreninzi.mockResolvedValue({ treninzi: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('👤 Individualni')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Arena Sarajevo')[0]).toBeInTheDocument();
    });
  });

  it('prikazuje grupnu rezervaciju sa imenom trenera', async () => {
    reservationApi.getMojeRezervacije.mockResolvedValue({
      rezervacije: [mockGrupnaRezervacija],
    });
    reservationApi.getGrupniTreninzi.mockResolvedValue({ treninzi: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('👥 Grupni')).toBeInTheDocument();
      expect(screen.getAllByText('Edin Trener')[0]).toBeInTheDocument();
    });
  });

  it('prikazuje dugme Otkaži termin za svaku rezervaciju', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText(/Otkaži termin/i).length).toBeGreaterThan(0);
    });
  });

  it('otvara modal za otkazivanje na klik Otkaži termin', async () => {
    renderDashboard();

    await waitFor(() => screen.getAllByText(/Otkaži termin/i));
    fireEvent.click(screen.getAllByText(/Otkaži termin/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/Otkaži rezervaciju/i)).toBeInTheDocument();
      expect(screen.getByText(/Potvrdi otkazivanje/i)).toBeInTheDocument();
    });
  });

  it('poziva cancelIndividualTerm na potvrdu otkazivanja individualnog termina', async () => {
    reservationApi.cancelIndividualTerm.mockResolvedValue({
      poruka: 'Rezervacija je uspješno otkazana.',
    });
    renderDashboard();

    await waitFor(() => screen.getAllByText(/Otkaži termin/i));
    fireEvent.click(screen.getAllByText(/Otkaži termin/i)[0]);
    await waitFor(() => screen.getByText(/Potvrdi otkazivanje/i));
    fireEvent.click(screen.getByText(/Potvrdi otkazivanje/i));

    await waitFor(() => {
      expect(reservationApi.cancelIndividualTerm).toHaveBeenCalledWith(10);
    });
  });

  it('zahtijeva razlog odjave za grupni trening', async () => {
    reservationApi.getMojeRezervacije.mockResolvedValue({
      rezervacije: [mockGrupnaRezervacija],
    });
    reservationApi.getGrupniTreninzi.mockResolvedValue({ treninzi: [] });
    renderDashboard();

    await waitFor(() => screen.getAllByText(/Otkaži termin/i));
    fireEvent.click(screen.getAllByText(/Otkaži termin/i)[0]);

    await waitFor(() => {
      expect(screen.getByText(/Razlog odjave/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getByText(/Potvrdi otkazivanje/i);
    expect(confirmBtn).toBeDisabled();
  });

  it('prikazuje empty state kada nema rezervacija', async () => {
    reservationApi.getMojeRezervacije.mockResolvedValue({ rezervacije: [] });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Nemate nadolazećih rezervacija/i)).toBeInTheDocument();
    });
  });

  it('prikazuje grešku ako učitavanje ne uspije', async () => {
    reservationApi.getMojeRezervacije.mockRejectedValue(new Error('API greška'));
    reservationApi.getFreeIndividualTerms.mockRejectedValue(new Error('API greška'));
    reservationApi.getGrupniTreninzi.mockRejectedValue(new Error('API greška'));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Greška pri učitavanju/i)).toBeInTheDocument();
    });
  });
});
