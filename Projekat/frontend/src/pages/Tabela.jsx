import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchTabela } from '../api/tabelaApi';
import { fetchLige } from '../api/ligaApi';

// Boja reda prema poziciji
function getRedBoja(pozicija) {
  if (pozicija === 1) return 'border-l-4 border-yellow-400 bg-yellow-50';
  if (pozicija === 2) return 'border-l-4 border-gray-300 bg-gray-50';
  if (pozicija === 3) return 'border-l-4 border-amber-500 bg-amber-50';
  return 'hover:bg-amber-50 transition-colors';
}

// Emoji medalja za top 3
function getPozicijaLabel(pozicija) {
  if (pozicija === 1) return '🥇';
  if (pozicija === 2) return '🥈';
  if (pozicija === 3) return '🥉';
  return pozicija;
}

// Boja gol razlike
function getGolRazlikaBoja(gr) {
  if (gr > 0) return 'text-green-600';
  if (gr < 0) return 'text-red-500';
  return 'text-slate-500';
}

function Tabela() {
  const { id } = useParams(); // takmicenjeId iz URL-a /tabela/:id

  const [tabela, setTabela] = useState([]);
  const [takmicenje, setTakmicenje] = useState(null);
  const [sortBy, setSortBy] = useState('ukupniBodovi');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ucitaj tabelu kada se promijeni id ili sortiranje
  useEffect(() => {
    let isActive = true;

    const ucitajTabelu = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchTabela(id, sortBy);
        if (isActive) {
          setTakmicenje(data.takmicenje);
          setTabela(data.tabela);
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || 'Nije moguće učitati tabelu.');
          setTabela([]);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    ucitajTabelu();
    return () => { isActive = false; };
  }, [id, sortBy]);

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Naslov */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">TABELA</h1>
          <p className="text-slate-500 mt-2 text-lg">
            {takmicenje ? `${takmicenje.naziv}${takmicenje.sezona ? ` · Sezona ${takmicenje.sezona}` : ''}` : 'Učitavanje...'}
          </p>
        </div>

        {/* Sortiranje */}
        <section className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-black uppercase tracking-widest text-amber-900/60">
              Sortiraj po:
            </span>
            {[
              { key: 'ukupniBodovi', label: 'Bodovi' },
              { key: 'pobjede', label: 'Pobjede' },
              { key: 'golRazlika', label: 'Gol razlika' },
            ].map(opcija => (
              <button
                key={opcija.key}
                onClick={() => setSortBy(opcija.key)}
                className={`px-5 py-2 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${
                  sortBy === opcija.key
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                }`}
              >
                {opcija.label}
              </button>
            ))}
          </div>
        </section>

        {/* Stanja: loading / error / prazno / tabela */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">
              Učitavanje tabele...
            </p>
          </div>

        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
            {error}
          </div>

        ) : tabela.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">
              Nema dostupnih podataka za ovo takmičenje.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Tabela će biti prikazana nakon unosa rezultata.
            </p>
          </div>

        ) : (
          <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50 text-left">
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">#</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Tim</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">O</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">W</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">D</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">L</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">G+</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">G-</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">GR</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">BOD</th>
                  </tr>
                </thead>
                <tbody>
                  {tabela.map((tim) => (
                    <tr
                      key={tim.timId}
                      className={`border-t border-amber-50 ${getRedBoja(tim.pozicija)}`}
                    >
                      {/* Pozicija / medalja */}
                      <td className="px-5 py-4 font-bold text-lg">
                        {getPozicijaLabel(tim.pozicija)}
                      </td>

                      {/* Tim sa logom */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {tim.logoUrl ? (
                                <img
                                    src={tim.logoUrl}
                                    alt={tim.naziv}
                                    className="w-7 h-7 rounded-full object-cover"
                                    onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                                ) : null}
                                <div
                                style={{ display: tim.logoUrl ? 'none' : 'flex' }}
                                className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-black text-orange-600"
                                >
                                {tim.naziv.charAt(0)}
                                </div>
                          <span className="font-bold text-slate-800">{tim.naziv}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center text-slate-600">{tim.odigrane}</td>
                      <td className="px-5 py-4 text-center font-bold text-green-600">{tim.pobjede}</td>
                      <td className="px-5 py-4 text-center text-slate-500">{tim.nerijeseno}</td>
                      <td className="px-5 py-4 text-center text-red-500">{tim.porazi}</td>
                      <td className="px-5 py-4 text-center text-slate-600">{tim.golovi}</td>
                      <td className="px-5 py-4 text-center text-slate-600">{tim.primljeniGolovi}</td>
                      <td className={`px-5 py-4 text-center font-bold ${getGolRazlikaBoja(tim.golRazlika)}`}>
                        {tim.golRazlika > 0 ? `+${tim.golRazlika}` : tim.golRazlika}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-10 justify-center rounded-2xl bg-orange-50 px-3 py-1 font-black text-orange-600">
                          {tim.bodovi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Tabela;