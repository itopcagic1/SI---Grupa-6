import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import IndividualTraining from '../IndividualTraining';
import * as reservationApi from '../../api/reservationApi';

vi.mock('../../components/Navbar', () => ({
  default: () => <nav>Navbar</nav>,
}));

vi.mock('../../api/reservationApi', () => ({
  getFreeIndividualTerms: vi.fn(),
  reserveIndividualTerm: vi.fn(),
  cancelIndividualTerm: vi.fn(),
  getMojeRezervacije: vi.fn(),
  joinWaitlist: vi.fn(),
}));

function getTerminInCurrentWeek() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

function getTerminEndInCurrentWeek() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(11, 0, 0, 0);
  return date.toISOString();
}

describe('IndividualTraining page', () => {
  const vrijemePocetka = getTerminInCurrentWeek();
  const vrijemeZavrsetka = getTerminEndInCurrentWeek();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('korisnik', JSON.stringify({ trenutnaUloga: 'IGRAC' }));

    reservationApi.getFreeIndividualTerms.mockResolvedValue({
      termini: [
        {
          terminId: 101,
          vrijemePocetka,
          vrijemeZavrsetka,
          status: 'SLOBODAN',
          sportskiObjekat: { naziv: 'Sportska dvorana' },
        },
      ],
    });

    reservationApi.getMojeRezervacije.mockResolvedValue({
      rezervacije: [],
    });

    reservationApi.reserveIndividualTerm.mockResolvedValue({
      status: 'POTVRDJENA',
      poruka: 'Termin je uspješno rezervisan.',
    });
  });

  it('prikazuje slobodne termine i otvara modal za rezervaciju', async () => {
    render(
      <MemoryRouter initialEntries={['/rezervacije/individualne']}>
        <Routes>
          <Route path="/rezervacije/individualne" element={<IndividualTraining />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Individualni/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sportska dvorana/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Slobodno/i }));


    const modalHeading = screen.getByRole('heading', { name: /Potvrda rezervacije/i });
    expect(modalHeading).toBeInTheDocument();


    const modal = modalHeading.closest('.fixed');
    expect(within(modal).getAllByText(/10:00/).length).toBeGreaterThanOrEqual(1);
  });

  it('potvrđuje rezervaciju i prikazuje uspjeh', async () => {
    render(
      <MemoryRouter initialEntries={['/rezervacije/individualne']}>
        <Routes>
          <Route path="/rezervacije/individualne" element={<IndividualTraining />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Sportska dvorana/i);
    fireEvent.click(screen.getByRole('button', { name: /Slobodno/i }));
    fireEvent.click(screen.getByRole('button', { name: /Potvrdi rezervaciju/i }));

    await waitFor(() => {
      expect(reservationApi.reserveIndividualTerm).toHaveBeenCalledWith(101);
      expect(screen.getByText(/Uspješno ste rezervisali termin/i)).toBeInTheDocument();
    });
  });

  it('prikazuje upozorenje za zahtjev na čekanju', async () => {
    reservationApi.reserveIndividualTerm.mockResolvedValue({
      status: 'NA_CEKANJU',
      poruka: 'Vaš zahtjev je poslan na čekanje.',
    });

    render(
      <MemoryRouter initialEntries={['/rezervacije/individualne']}>
        <Routes>
          <Route path="/rezervacije/individualne" element={<IndividualTraining />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Sportska dvorana/i);
    fireEvent.click(screen.getByRole('button', { name: /Slobodno/i }));
    fireEvent.click(screen.getByRole('button', { name: /Potvrdi rezervaciju/i }));

    await waitFor(() => {
      expect(reservationApi.reserveIndividualTerm).toHaveBeenCalledWith(101);
      expect(screen.getByText(/zahtjev je poslat na čekanje/i)).toBeInTheDocument();
    });
  });

  it('prikazuje poruku o grešci kada rezervacija ne uspije', async () => {
    reservationApi.reserveIndividualTerm.mockRejectedValue({
      response: { data: { poruka: 'Termin više nije dostupan.' } },
    });

    render(
      <MemoryRouter initialEntries={['/rezervacije/individualne']}>
        <Routes>
          <Route path="/rezervacije/individualne" element={<IndividualTraining />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Sportska dvorana/i);
    fireEvent.click(screen.getByRole('button', { name: /Slobodno/i }));
    fireEvent.click(screen.getByRole('button', { name: /Potvrdi rezervaciju/i }));

    await waitFor(() => {
      expect(screen.getByText(/Termin više nije dostupan/i)).toBeInTheDocument();
    });
  });

  it('otvara modal za otkazivanje za termin koji je korisnik rezervisao', async () => {
    reservationApi.getFreeIndividualTerms.mockResolvedValue({
      termini: [
        {
          terminId: 202,
          vrijemePocetka,
          vrijemeZavrsetka,
          status: 'ZAUZET',
          jeMojaRezervacija: true,
          sportskiObjekat: { naziv: 'Zatvoreni bazen' },
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/rezervacije/individualne']}>
        <Routes>
          <Route path="/rezervacije/individualne" element={<IndividualTraining />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Zatvoreni bazen/i);
    fireEvent.click(screen.getByRole('button', { name: /Vaš Termin/i }));

    expect(screen.getByRole('heading', { name: /Otkazivanje rezervacije/i })).toBeInTheDocument();
  });

  it('prikazuje poruku kada korisnik nije igrač', async () => {
    localStorage.setItem('korisnik', JSON.stringify({ trenutnaUloga: 'NAVIJAC' }));
    reservationApi.getFreeIndividualTerms.mockResolvedValue({ termini: [] });

    render(
      <MemoryRouter initialEntries={['/rezervacije/individualne']}>
        <Routes>
          <Route path="/rezervacije/individualne" element={<IndividualTraining />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Ova stranica je dostupna samo registrovanim igračima/i)
    ).toBeInTheDocument();
  });
});