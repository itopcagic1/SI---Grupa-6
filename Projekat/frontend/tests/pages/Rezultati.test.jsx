import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Rezultati from '../../src/pages/Rezultati';
import * as matchApi from '../../src/api/matchApi';
import * as ligaApi from '../../src/api/ligaApi';
import * as teamApi from '../../src/api/teamApi';

vi.mock('../../src/api/matchApi', () => ({
  fetchPublicMatches: vi.fn(),
}));

vi.mock('../../src/api/ligaApi', () => ({
  fetchSportovi: vi.fn(),
  fetchLige: vi.fn(),
}));

vi.mock('../../src/api/teamApi', () => ({
  fetchTeams: vi.fn(),
}));

const utakmica = {
  utakmicaId: 1,
  vrijemePocetka: '2026-05-18T17:00:00.000Z',
  status: 'ZAKAZANA',
  lokacijaOpis: 'Stadion',
  takmicenje: { takmicenjeId: 2, naziv: 'Premijer liga', sportId: 1 },
  domaciTim: { timId: 5, naziv: 'FK Tempo' },
  gostujuciTim: { timId: 6, naziv: 'FC Arena' },
  rezultatUtakmice: null,
};

function renderPage() {
  return render(
    <BrowserRouter>
      <Rezultati />
    </BrowserRouter>
  );
}

describe('Rezultati page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    matchApi.fetchPublicMatches.mockResolvedValue([utakmica]);
    ligaApi.fetchSportovi.mockResolvedValue([{ sportId: 1, naziv: 'Fudbal' }]);
    ligaApi.fetchLige.mockResolvedValue({ lige: [{ takmicenjeId: 2, naziv: 'Premijer liga' }] });
    teamApi.fetchTeams.mockResolvedValue([{ timId: 5, naziv: 'FK Tempo' }]);
  });

  it('renderuje filtere i listu utakmica', async () => {
    renderPage();

    expect(screen.getByText('RASPORED I REZULTATI')).toBeInTheDocument();
    expect(screen.getByLabelText('Sport')).toBeInTheDocument();
    expect(screen.getByLabelText('Liga')).toBeInTheDocument();
    expect(screen.getByLabelText('Tim')).toBeInTheDocument();
    expect(screen.getByLabelText('Datum')).toBeInTheDocument();

    expect(await screen.findByText('FC Arena')).toBeInTheDocument();
    expect(screen.getByText('FC Arena')).toBeInTheDocument();
  });

  it('promjena filtera osvjezava utakmice sa query vrijednostima', async () => {
    renderPage();

    await screen.findByText('FC Arena');

    fireEvent.change(screen.getByLabelText('Sport'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Liga'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Tim'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Datum'), { target: { value: '2026-05-18' } });

    await waitFor(() => {
      expect(matchApi.fetchPublicMatches).toHaveBeenLastCalledWith({
        sportId: '1',
        takmicenjeId: '2',
        timId: '5',
        datum: '2026-05-18',
      });
    });
  });

  it('reset filtera vraca prazne vrijednosti i ponovo ucitava utakmice', async () => {
    renderPage();

    await screen.findByText('FC Arena');
    fireEvent.change(screen.getByLabelText('Sport'), { target: { value: '1' } });

    await waitFor(() => {
      expect(matchApi.fetchPublicMatches).toHaveBeenLastCalledWith(expect.objectContaining({ sportId: '1' }));
    });

    fireEvent.click(screen.getByText('RESET FILTERA'));

    await waitFor(() => {
      expect(screen.getByLabelText('Sport')).toHaveValue('');
      expect(matchApi.fetchPublicMatches).toHaveBeenLastCalledWith({
        sportId: '',
        takmicenjeId: '',
        timId: '',
        datum: '',
      });
    });
  });

  it('prikazuje empty state poruku kada nema utakmica', async () => {
    matchApi.fetchPublicMatches.mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText('Nema utakmica za odabrane filtere.')).toBeInTheDocument();
  });
});
