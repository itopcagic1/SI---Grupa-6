import { useEffect, useState } from 'react';
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

function Raspored() {
  const [filters, setFilters] = useState(initialFilters);
  const [reloadKey, setReloadKey] = useState(0);
  const [utakmice, setUtakmice] = useState([]);
  const [sportovi, setSportovi] = useState([]);
  const [lige, setLige] = useState([]);
  const [timovi, setTimovi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          console.error('Greška pri učitavanju filtera:', err);
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
          setError(err.response?.data?.poruka || 'Nije moguće učitati utakmice.');
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

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">RASPORED UTAKMICA</h1>
            <p className="text-slate-500 mt-2 text-lg">
              Pregledajte nadolazeće utakmice.
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
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">Učitavanje utakmica...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
            {error}
          </div>
        ) : utakmice.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">Nema utakmica za odabrane filtere.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {utakmice.map((utakmica) => {
              const rezultat = getResultLabel(utakmica);

              return (
                <article key={utakmica.utakmicaId} className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                      {utakmica.takmicenje?.naziv || 'Takmičenje nije definisano'}
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                      {utakmica.status || 'Status nije definisan'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex-1 text-right">
                      <div className="text-lg font-black text-slate-800">{utakmica.domaciTim?.naziv || 'Domaći tim'}</div>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 text-center min-w-20">
                      <div className="text-xl font-black text-orange-600">{rezultat || 'VS'}</div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-lg font-black text-slate-800">{utakmica.gostujuciTim?.naziv || 'Gostujući tim'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-slate-500">
                    <div className="bg-slate-50 rounded-2xl px-4 py-3">
                      <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Datum i vrijeme</span>
                      <span className="text-slate-800">{formatDateTime(utakmica.vrijemePocetka)}</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl px-4 py-3">
                      <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Lokacija</span>
                      <span className="text-slate-800">{getLocationLabel(utakmica)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Raspored;
