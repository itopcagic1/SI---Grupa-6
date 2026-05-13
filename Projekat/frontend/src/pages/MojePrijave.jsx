import { useEffect, useState } from 'react';
import { fetchMojePrijave } from '../api/applicationsApi';
import Navbar from '../components/Navbar';

const statusClasses = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  ODOBRENO: 'bg-green-100 text-green-800 border-green-200',
  ODBIJENO: 'bg-red-100 text-red-800 border-red-200',
};

function formatDatum(value) {
  if (!value) return 'Nije definisano';

  return new Intl.DateTimeFormat('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function MojePrijave() {
  const [prijave, setPrijave] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPrijave = async () => {
    try {
      setLoading(true);

      const data = await fetchMojePrijave();
      const prijaveData = data.prijave || data.podaci || data || [];

      setPrijave(Array.isArray(prijaveData) ? prijaveData : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.poruka || 'Greska pri ucitavanju prijava.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrijave();
  }, []);

  return (
    <div className="min-h-screen bg-amber-50 font-sans">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Moje prijave
            </h1>

            <p className="text-slate-500 mt-2 text-lg">
              Takmicenja na koja ste prijavili svoje timove
            </p>
          </div>

          <button
            onClick={loadPrijave}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95"
          >
            Osvjezi
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>

            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">
              Ucitavanje prijava...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
            {error}
          </div>
        ) : prijave.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">
              Jos nemate prijavljenih takmicenja.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {prijave.map((prijava) => (
              <article
                key={prijava.prijavaId}
                className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">
                      {prijava.tim}
                    </h2>

                    <p className="text-sm font-semibold text-slate-500 mt-1">
                      {prijava.takmicenje}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-widest ${
                      statusClasses[prijava.status] || statusClasses.PENDING
                    }`}
                  >
                    {prijava.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <span className="w-24 text-slate-400">Sport:</span>

                    <span className="text-slate-800">
                      {prijava.sport || 'Nije definisano'}
                    </span>
                  </p>

                  <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <span className="w-24 text-slate-400">Datum:</span>

                    <span className="text-slate-800">
                      {formatDatum(prijava.datumPrijave)}
                    </span>
                  </p>

                  <p className="text-sm text-slate-500 font-medium flex items-start gap-2">
                    <span className="w-24 shrink-0 text-slate-400">
                      Lokacija:
                    </span>

                    <span className="text-slate-800">
                      {prijava.defaultnaLokacija}
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MojePrijave;