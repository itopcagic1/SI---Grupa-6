import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { fetchPublicMatches } from '../api/matchApi';
import { fetchLige, fetchSportovi } from '../api/ligaApi';
import { fetchTeams } from '../api/teamApi';

const initialFilters = {
  sportId: '',
  takmicenjeId: '',
  timId: '',
  datum: ''
};

function normalizeList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function formatDateTime(dateString) {
  if (!dateString) return 'Datum nije definisan';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Datum nije definisan';

  return `${date.toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })} | ${date.toLocaleTimeString('bs-BA', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

function getLocationLabel(utakmica) {
  return utakmica.sportskiObjekat?.naziv || utakmica.lokacijaOpis || 'Lokacija nije definisana';
}

function getResultLabel(utakmica) {
  const rezultat = utakmica.rezultatUtakmice;
  if (!rezultat) return null;

  return `${rezultat.rezultatDomacin} : ${rezultat.rezultatGost}`;
}

function formatVrijednosti(vrijednosti = []) {
  return vrijednosti
    .map((item) => `${item.tipStatistike?.nazivStatistike || 'Statistika'}: ${item.vrijednost}`)
    .join(', ');
}

function hasStatistike(utakmica) {
  return Boolean(utakmica?.statistikeTimova?.length || utakmica?.statistikeIgraca?.length);
}

function groupPlayerStatsByTeam(utakmica) {
  const groups = new Map();
  const timovi = [utakmica.domaciTim, utakmica.gostujuciTim].filter(Boolean);

  timovi.forEach((tim) => {
    groups.set(tim.timId, { tim, igraci: [] });
  });

  (utakmica.statistikeIgraca || []).forEach((statistika) => {
    const tim = statistika.tim || { timId: statistika.timId, naziv: 'Tim' };
    if (!groups.has(tim.timId)) {
      groups.set(tim.timId, { tim, igraci: [] });
    }
    groups.get(tim.timId).igraci.push(statistika);
  });

  return Array.from(groups.values());
}

function Rezultati() {
  const [filters, setFilters] = useState(initialFilters);
  const [reloadKey, setReloadKey] = useState(0);
  const [utakmice, setUtakmice] = useState([]);
  const [sportovi, setSportovi] = useState([]);
  const [lige, setLige] = useState([]);
  const [timovi, setTimovi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadOptions = async () => {
      try {
        const [sportoviData, ligeData, timoviData] = await Promise.all([
          fetchSportovi(),
          fetchLige(),
          fetchTeams()
        ]);

        if (!isActive) return;

        setSportovi(normalizeList(sportoviData, ['sportovi', 'podaci']));
        setLige(normalizeList(ligeData, ['lige', 'podaci']));
        setTimovi(normalizeList(timoviData, ['timovi', 'podaci']));
      } catch (err) {
        if (isActive) {
          console.error('Greska pri ucitavanju filtera:', err);
        }
      }
    };

    loadOptions();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadMatches = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchPublicMatches(filters);
        if (isActive) {
          setUtakmice(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.poruka || 'Nije moguce ucitati rezultate.');
          setUtakmice([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadMatches();

    return () => {
      isActive = false;
    };
  }, [filters, reloadKey]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setReloadKey((current) => current + 1);
  };

  const rezultati = useMemo(
    () => utakmice.filter((utakmica) => getResultLabel(utakmica)),
    [utakmice]
  );

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">REZULTATI</h1>
            <p className="text-slate-500 mt-2 text-lg">
              Pregledajte rezultate utakmica.
            </p>
          </div>
        </div>

        <section className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div>
              <label htmlFor="sportId" className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                Sport
              </label>
              <select id="sportId" name="sportId" value={filters.sportId} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-slate-700">
                <option value="">Svi sportovi</option>
                {sportovi.map((sport) => (
                  <option key={sport.sportId} value={sport.sportId}>{sport.naziv}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="takmicenjeId" className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                Liga
              </label>
              <select id="takmicenjeId" name="takmicenjeId" value={filters.takmicenjeId} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-slate-700">
                <option value="">Sve lige</option>
                {lige.map((liga) => (
                  <option key={liga.takmicenjeId} value={liga.takmicenjeId}>{liga.naziv}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="timId" className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                Tim
              </label>
              <select id="timId" name="timId" value={filters.timId} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-slate-700">
                <option value="">Svi timovi</option>
                {timovi.map((tim) => (
                  <option key={tim.timId} value={tim.timId}>{tim.naziv}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="datum" className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                Datum
              </label>
              <input id="datum" name="datum" type="date" value={filters.datum} onChange={handleFilterChange} className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-slate-700" />
            </div>

            <div className="flex items-end">
              <button type="button" onClick={handleReset} className="w-full px-5 py-3 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20 active:scale-95">
                RESET FILTERA
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">Ucitavanje rezultata...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
            {error}
          </div>
        ) : rezultati.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">Nema rezultata za odabrane filtere.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50 text-left">
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Liga</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Domaci tim</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Gostujuci tim</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">Rezultat</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Datum</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Lokacija</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {rezultati.map((utakmica) => (
                    <tr key={utakmica.utakmicaId} className="border-t border-amber-50 hover:bg-amber-50 transition-colors">
                      <td className="px-5 py-4 font-bold text-orange-600">{utakmica.takmicenje?.naziv || 'Takmicenje nije definisano'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{utakmica.domaciTim?.naziv || 'Domaci tim'}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">{utakmica.gostujuciTim?.naziv || 'Gostujuci tim'}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-20 justify-center rounded-2xl bg-orange-50 px-4 py-2 text-lg font-black text-orange-600">
                          {getResultLabel(utakmica)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDateTime(utakmica.vrijemePocetka)}</td>
                      <td className="px-5 py-4 text-slate-600">{getLocationLabel(utakmica)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedMatch(utakmica)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                        >
                          Detalji
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 border-b border-amber-50 flex justify-between items-start gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-orange-600 mb-2">
                    {selectedMatch.takmicenje?.naziv || 'Takmicenje'}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800">Detalji utakmice</h2>
                </div>
                <button onClick={() => setSelectedMatch(null)} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-full transition-colors">
                  <span className="sr-only">Zatvori</span>
                  X
                </button>
              </div>

              <div className="px-8 py-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center text-center mb-6">
                  <div className="rounded-2xl bg-slate-50 px-5 py-4">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Domaci tim</div>
                    <div className="text-lg font-black text-slate-800">{selectedMatch.domaciTim?.naziv || 'Domaci tim'}</div>
                  </div>
                  <div className="rounded-2xl bg-orange-50 px-6 py-4 border border-orange-100">
                    <div className="text-3xl font-black text-orange-600">{getResultLabel(selectedMatch)}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-5 py-4">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Gostujuci tim</div>
                    <div className="text-lg font-black text-slate-800">{selectedMatch.gostujuciTim?.naziv || 'Gostujuci tim'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-slate-500 mb-8">
                  <div className="bg-slate-50 rounded-2xl px-4 py-3">
                    <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Datum i vrijeme</span>
                    <span className="text-slate-800">{formatDateTime(selectedMatch.vrijemePocetka)}</span>
                  </div>
                  <div className="bg-slate-50 rounded-2xl px-4 py-3">
                    <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Lokacija</span>
                    <span className="text-slate-800">{getLocationLabel(selectedMatch)}</span>
                  </div>
                </div>

                {!hasStatistike(selectedMatch) ? (
                  <div className="text-center py-12 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-slate-600 font-bold">Statistika nije unesena.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-4">Statistika timova</h3>
                      {selectedMatch.statistikeTimova?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedMatch.statistikeTimova.map((statistika) => (
                            <div key={statistika.statistikaTimaId} className="border border-amber-100 rounded-2xl p-5">
                              <div className="font-black text-slate-800 mb-3">{statistika.tim?.naziv || 'Tim'}</div>
                              <div className="flex flex-wrap gap-2">
                                {(statistika.vrijednosti || []).map((item) => (
                                  <span key={item.vrijednostId} className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                                    {item.tipStatistike?.nazivStatistike || 'Statistika'}: {item.vrijednost}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-slate-500">Timska statistika nije unesena.</p>
                      )}
                    </section>

                    <section>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-4">Statistika igraca</h3>
                      {selectedMatch.statistikeIgraca?.length ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {groupPlayerStatsByTeam(selectedMatch).map((group) => (
                            <div key={group.tim.timId} className="border border-amber-100 rounded-2xl p-5">
                              <div className="font-black text-slate-800 mb-4">{group.tim.naziv}</div>
                              {group.igraci.length ? (
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                  {group.igraci.map((statistika) => (
                                    <div key={statistika.statistikaIgracaId} className="rounded-2xl bg-slate-50 px-4 py-3">
                                      <div className="font-bold text-slate-800">{statistika.korisnik?.punoIme || 'Igrac'}</div>
                                      <div className="text-sm text-slate-600 mt-1">{formatVrijednosti(statistika.vrijednosti)}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm font-medium text-slate-500">Nema unesene statistike za ovaj tim.</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-slate-500">Statistika igraca nije unesena.</p>
                      )}
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Rezultati;
