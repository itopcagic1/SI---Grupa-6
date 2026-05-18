import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FacilityTermsPage from '../FacilityTermsPage';
import * as facilityTermsApi from '../../api/facilityTermsApi';

vi.mock('../../components/Navbar', () => ({
  default: () => <nav>Navbar</nav>,
}));

vi.mock('../../api/facilityTermsApi', () => ({
  blockTerm: vi.fn(),
  createObjectTerms: vi.fn(),
  getObjectDetails: vi.fn(),
  getObjectTerms: vi.fn(),
  updateTerm: vi.fn(),
}));

const baseTerms = [
  {
    terminId: 1,
    objekatId: 5,
    vrijemePocetka: '2026-05-18T08:00:00',
    vrijemeZavrsetka: '2026-05-18T09:00:00',
    status: 'SLOBODAN',
    tipTermina: 'JEDNOM',
  },
  {
    terminId: 2,
    objekatId: 5,
    vrijemePocetka: '2026-05-19T10:00:00',
    vrijemeZavrsetka: '2026-05-19T11:00:00',
    status: 'BLOKIRAN',
    tipTermina: 'BLOKIRAN',
  },
  {
    terminId: 3,
    objekatId: 5,
    vrijemePocetka: '2026-05-20T08:00:00',
    vrijemeZavrsetka: '2026-05-20T09:00:00',
    status: 'SLOBODAN',
    tipTermina: 'JEDNOM',
  },
  {
    terminId: 4,
    objekatId: 5,
    vrijemePocetka: '2026-05-20T10:00:00',
    vrijemeZavrsetka: '2026-05-20T11:00:00',
    status: 'ZAUZET',
    tipTermina: 'JEDNOM',
  },
  {
    terminId: 5,
    objekatId: 5,
    vrijemePocetka: '2026-05-20T12:00:00',
    vrijemeZavrsetka: '2026-05-20T13:00:00',
    status: 'NA_CEKANJU',
    tipTermina: 'JEDNOM',
  },
  {
    terminId: 6,
    objekatId: 5,
    vrijemePocetka: '2026-05-20T14:00:00',
    vrijemeZavrsetka: '2026-05-20T15:00:00',
    status: 'SLOBODAN',
    tipTermina: 'JEDNOM',
  },
  {
    terminId: 7,
    objekatId: 5,
    vrijemePocetka: '2026-05-20T16:00:00',
    vrijemeZavrsetka: '2026-05-20T17:00:00',
    status: 'SLOBODAN',
    tipTermina: 'JEDNOM',
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/objekti/5/termini']}>
      <Routes>
        <Route path="/objekti/:id/termini" element={<FacilityTermsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

async function waitForPage() {
  await waitFor(() => {
    expect(facilityTermsApi.getObjectTerms).toHaveBeenCalled();
  });
  await screen.findByRole('heading', { name: /Kalendar termina/i });
}

function setCreateForm({ datum = '2026-05-21', vrijeme = '12:00', trajanje = '60', ponavljanje = 'JEDNOM' } = {}) {
  fireEvent.change(document.querySelector('input[name="datum"]'), { target: { value: datum } });
  fireEvent.change(document.querySelector('input[name="vrijeme"]'), { target: { value: vrijeme } });
  fireEvent.change(document.querySelector('select[name="trajanje"]'), { target: { value: trajanje } });
  fireEvent.change(document.querySelector('select[name="ponavljanje"]'), { target: { value: ponavljanje } });
}

describe('FacilityTermsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    facilityTermsApi.getObjectDetails.mockResolvedValue({ objekatId: 5, naziv: 'Sportska dvorana Konjic' });
    facilityTermsApi.getObjectTerms.mockResolvedValue({ termini: baseTerms });
    facilityTermsApi.createObjectTerms.mockResolvedValue({ poruka: 'Termini su uspješno kreirani.' });
    facilityTermsApi.updateTerm.mockResolvedValue({ poruka: 'Termin je uspješno izmijenjen.' });
    facilityTermsApi.blockTerm.mockResolvedValue({ poruka: 'Termin je uspješno blokiran.' });
  });

  it('prikazuje naslov, naziv objekta, sedmicni prikaz i datume u dd.mm.yyyy. formatu', async () => {
    renderPage();
    await waitForPage();

    expect(screen.getByRole('heading', { name: /Kalendar termina/i })).toBeInTheDocument();
    expect(screen.getByText('Pregled termina za "Sportska dvorana Konjic".')).toBeInTheDocument();
    expect(screen.getByText('Sedmični prikaz')).toBeInTheDocument();

    fireEvent.change(document.querySelector('input[type="date"]'), { target: { value: '2026-05-20' } });

    expect(await screen.findByText('18.05.2026. - 24.05.2026.')).toBeInTheDocument();
    expect(screen.getByText('18.05, PON')).toBeInTheDocument();
  });

  it('otvara modal za kreiranje i uspjesno poziva create API', async () => {
    renderPage();
    await waitForPage();

    fireEvent.click(screen.getByRole('button', { name: /\+ Kreiraj termin/i }));

    expect(screen.getByRole('heading', { name: 'Kreiraj termin' })).toBeInTheDocument();
    expect(screen.getByText('Datum *')).toBeInTheDocument();
    expect(screen.getByText('Vrijeme početka *')).toBeInTheDocument();
    expect(screen.getByText('Trajanje *')).toBeInTheDocument();
    expect(screen.getByText('Ponavljanje *')).toBeInTheDocument();
    expect(screen.getByText(/Jednom kreira jedan termin/i)).toBeInTheDocument();

    setCreateForm();
    fireEvent.click(screen.getByRole('button', { name: /^Kreiraj$/i }));

    await waitFor(() => {
      expect(facilityTermsApi.createObjectTerms).toHaveBeenCalledWith('5', expect.objectContaining({
        trajanje: 60,
        ponavljanje: 'JEDNOM',
      }));
    });
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Kreiraj termin' })).not.toBeInTheDocument();
    });
  });

  it('prikazuje TERMIN_SE_PREKLAPA gresku unutar create modala i ne zatvara ga', async () => {
    facilityTermsApi.createObjectTerms.mockRejectedValueOnce({
      response: { data: { greska: 'TERMIN_SE_PREKLAPA' } },
    });

    renderPage();
    await waitForPage();

    fireEvent.click(screen.getByRole('button', { name: /\+ Kreiraj termin/i }));
    setCreateForm({ datum: '2026-05-21', vrijeme: '14:00' });
    fireEvent.click(screen.getByRole('button', { name: /^Kreiraj$/i }));

    expect(await screen.findByText('Termin se preklapa sa već postojećim terminom.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kreiraj termin' })).toBeInTheDocument();
  });

  it('otvara detalje termina, edit modal i poziva update API', async () => {
    renderPage();
    await waitForPage();

    fireEvent.click(screen.getByRole('button', { name: /10:00 - 11:00 ZAUZET/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Uredi' }));

    expect(screen.getByRole('heading', { name: 'Uredi termin' })).toBeInTheDocument();
    expect(document.querySelector('input[name="datum"]')).toHaveValue('2026-05-20');
    expect(document.querySelector('input[name="vrijeme"]')).toHaveValue('10:00');

    fireEvent.change(document.querySelector('input[name="vrijeme"]'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /^Spasi$/i }));

    await waitFor(() => {
      expect(facilityTermsApi.updateTerm).toHaveBeenCalledWith(4, expect.objectContaining({
        trajanje: 60,
      }));
    });
  });

  it('prikazuje TERMIN_SE_PREKLAPA gresku unutar edit modala', async () => {
    facilityTermsApi.updateTerm.mockRejectedValueOnce({
      response: { data: { greska: 'TERMIN_SE_PREKLAPA' } },
    });

    renderPage();
    await waitForPage();

    fireEvent.click(screen.getByRole('button', { name: /10:00 - 11:00 ZAUZET/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Uredi' }));
    fireEvent.change(document.querySelector('input[name="vrijeme"]'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: /^Spasi$/i }));

    expect(await screen.findByText('Termin se preklapa sa već postojećim terminom.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Uredi termin' })).toBeInTheDocument();
  });

  it('blokira termin i za BLOKIRAN termin ne prikazuje Uredi niti Blokiraj', async () => {
    renderPage();
    await waitForPage();

    fireEvent.click(screen.getAllByRole('button', { name: /08:00 - 09:00 SLOBODAN/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Blokiraj' }));

    await waitFor(() => {
      expect(facilityTermsApi.blockTerm).toHaveBeenCalledWith(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /10:00 - 11:00 BLOKIRAN/i }));
    expect(screen.getByRole('heading', { name: 'Detalji termina' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Uredi' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Blokiraj' })).not.toBeInTheDocument();
  });

  it('status filteri frontend-side sakrivaju i vracaju termine', async () => {
    renderPage();
    await waitForPage();

    expect(screen.getAllByRole('button', { name: /08:00 - 09:00 SLOBODAN/i }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'SLOBODAN' }));
    expect(screen.queryAllByRole('button', { name: /08:00 - 09:00 SLOBODAN/i })).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'SLOBODAN' }));
    expect(screen.getAllByRole('button', { name: /08:00 - 09:00 SLOBODAN/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'BLOKIRAN' }));
    expect(screen.queryByRole('button', { name: /10:00 - 11:00 BLOKIRAN/i })).not.toBeInTheDocument();
    expect(facilityTermsApi.getObjectTerms).toHaveBeenCalledTimes(1);
  });

  it('sedmicna navigacija i date picker mijenjaju prikazanu sedmicu', async () => {
    renderPage();
    await waitForPage();

    const datePicker = document.querySelector('input[type="date"]');
    fireEvent.change(datePicker, { target: { value: '2026-05-20' } });
    expect(await screen.findByText('18.05.2026. - 24.05.2026.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Prethodna sedmica' }));
    expect(await screen.findByText('11.05.2026. - 17.05.2026.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sljedeća sedmica' }));
    expect(await screen.findByText('18.05.2026. - 24.05.2026.')).toBeInTheDocument();

    fireEvent.change(datePicker, { target: { value: '2026-06-03' } });
    expect(await screen.findByText('01.06.2026. - 07.06.2026.')).toBeInTheDocument();
  });

  it('prikazuje Vidi sve termine dana samo kada dan ima vise od cetiri termina', async () => {
    renderPage();
    await waitForPage();

    expect(screen.getByText('Vidi sve termine dana')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /16:00 - 17:00 SLOBODAN/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Vidi sve termine dana'));
    expect(screen.getAllByText('20.05.2026.').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /16:00 - 17:00\s*SLOBODAN/i })).toBeInTheDocument();
  });
});
