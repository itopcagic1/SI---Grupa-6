import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest'; // Dodan eksplicitan import za Vitest
import Notifikacije from '../../src/pages/Notifikacije'; 
import { getNotifikacije, oznaciKaoProcitano, oznaciSveKaoProcitane } from '../../src/api/notifikacijaApi';

vi.mock('../../src/api/notifikacijaApi', () => ({
  getNotifikacije: vi.fn(),
  oznaciKaoProcitano: vi.fn(),
  oznaciSveKaoProcitane: vi.fn()
}));

vi.mock('../../src/components/Navbar', () => ({
  default: () => <div data-testid="mock-navbar">Navbar</div>
}));

const mockNotifikacije = [
  {
    notifikacijaId: 1,
    tipNotifikacije: 'TRENING',
    vrijemeSlanja: '2026-06-02T10:00:00.000Z',
    sadrzajPoruke: 'Trener je otkazao trening.',
    status: 'NEPROCITANO',
  },
  {
    notifikacijaId: 2,
    tipNotifikacije: 'SISTEM',
    vrijemeSlanja: '2026-06-01T09:00:00.000Z',
    sadrzajPoruke: 'Uspješno ste se registrovali.',
    status: 'PROCITANO',
  },
];

describe('Notifikacije Frontend Komponenta - Unit Testovi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Treba prikazati loader dok se obavijesti učitavaju', async () => {
    getNotifikacije.mockReturnValue(new Promise(() => {}));
    render(<Notifikacije />);
    expect(screen.getByText('Učitavanje obavijesti...')).toBeInTheDocument();
  });

  it('Treba ispravno prikazati listu notifikacija nakon učitavanja', async () => {
    getNotifikacije.mockResolvedValue({ notifikacije: mockNotifikacije });

    render(<Notifikacije />);

    await waitFor(() => {
      expect(screen.getByText('Trener je otkazao trening.')).toBeInTheDocument();
      expect(screen.getByText('Uspješno ste se registrovali.')).toBeInTheDocument();
    });

    const neprocitanaPoruka = screen.getByText('Trener je otkazao trening.');
    const procitanaPoruka = screen.getByText('Uspješno ste se registrovali.');
    
    expect(neprocitanaPoruka).toHaveClass('font-bold');
    expect(procitanaPoruka).toHaveClass('text-slate-600');
  });

  it('Klik na nepročitanu obavijest treba pozvati API i označiti je kao pročitanu', async () => {
    getNotifikacije.mockResolvedValue({ notifikacije: [mockNotifikacije[0]] });
    oznaciKaoProcitano.mockResolvedValue({ success: true });

    render(<Notifikacije />);

    await waitFor(() => {
      expect(screen.getByText('Trener je otkazao trening.')).toBeInTheDocument();
    });

    const karticaNotifikacije = screen.getByText('Trener je otkazao trening.').closest('div').parentElement;
    fireEvent.click(karticaNotifikacije);

    expect(oznaciKaoProcitano).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText('Trener je otkazao trening.')).toHaveClass('text-slate-600');
    });
  });

  it('Klik na "Onači sve kao pročitano" treba ažurirati sve obavijesti', async () => {
    getNotifikacije.mockResolvedValue({ notifikacije: mockNotifikacije });
    oznaciSveKaoProcitane.mockResolvedValue({ success: true });

    render(<Notifikacije />);

    await waitFor(() => {
      expect(screen.getByText('Onači sve kao pročitano')).toBeInTheDocument();
    });

    const dugmeOznaciSve = screen.getByText('Onači sve kao pročitano');
    fireEvent.click(dugmeOznaciSve);

    expect(oznaciSveKaoProcitane).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText('Onači sve kao pročitano')).not.toBeInTheDocument();
    });
  });

  it('Treba prikazati praznu poruku ako nema obavijesti u bazi', async () => {
    getNotifikacije.mockResolvedValue({ notifikacije: [] });

    render(<Notifikacije />);

    await waitFor(() => {
      expect(screen.getByText('Nemate obavijesti')).toBeInTheDocument();
    });
  });
});