import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dohvatiStatistikuIgraca, dohvatiTakmicenjaIgraca } from '../api/statistikaApi';

function StatistikaIgraca() {
  const { id } = useParams(); // igracId iz URL-a

  const [podatki, setPodatki] = useState(null);
  const [sve_lige, setSveLige] = useState([]);
  const [takmicenjeId, setTakmicenjeId] = useState('');
  const [sezona, setSezona] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Učitaj sve lige za filter
  useEffect(() => {
    const ucitajTakmicenja = async () => {
      try {
        const response = await dohvatiTakmicenjaIgraca(id);
        setSveLige(response || []);
      } catch (err) {
        console.error('Greška pri učitavanju takmičenja igrača:', err);
      }
    };

    ucitajTakmicenja();
  }, [id]);

  // Učitaj statistiku igrača kada se promijene filteri
  useEffect(() => {
    let isActive = true;

    const ucitajStatistiku = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await dohvatiStatistikuIgraca(id, takmicenjeId || null, sezona || null);
        if (isActive) {
          setPodatki(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.poruka || 'Nije moguće učitati statistiku.');
          setPodatki(null);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    ucitajStatistiku();
    return () => { isActive = false; };
  }, [id, takmicenjeId, sezona]);

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Naslov */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">STATISTIKA IGRAČA</h1>
          <p className="text-slate-500 mt-2 text-lg">
            {podatki?.igrac ? podatki.igrac.punoIme : 'Učitavanje...'}
          </p>
        </div>

        {/* Filteri */}
        <section className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 block">
                Takmičenje
              </label>
              <select
                value={takmicenjeId}
                onChange={(e) => setTakmicenjeId(e.target.value)}
                className="w-full px-4 py-2 border border-amber-200 rounded-xl focus:outline-none focus:border-orange-600 font-medium"
              >
                <option value="">Sva takmičenja</option>
                {sve_lige.map(liga => (
                  <option key={liga.takmicenjeId} value={liga.takmicenjeId}>
                    {liga.naziv}{liga.sezona ? ` · ${liga.sezona}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 block">
                Sezona
              </label>
              <input
                type="text"
                value={sezona}
                onChange={(e) => setSezona(e.target.value)}
                placeholder="npr. 2025/2026"
                className="w-full px-4 py-2 border border-amber-200 rounded-xl focus:outline-none focus:border-orange-600 font-medium"
              />
            </div>
          </div>
        </section>

        {/* Info sekcija */}
        {podatki && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-amber-900/60">Igrac</p>
              <p className="text-2xl font-black text-slate-800 mt-2">{podatki.igrac?.punoIme || '-'}</p>
              <p className="text-sm text-slate-500 mt-1">{podatki.tim?.naziv || '-'}</p>
            </div>

            <div className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-amber-900/60">Takmičenje</p>
              <p className="text-2xl font-black text-slate-800 mt-2">{podatki.takmicenje?.naziv || '-'}</p>
              <p className="text-sm text-slate-500 mt-1">Sezona {podatki.takmicenje?.sezona || '-'}</p>
            </div>

            <div className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-amber-900/60">Utakmica</p>
              <p className="text-2xl font-black text-slate-800 mt-2">{podatki.brojUtakmica || 0}</p>
              <p className="text-sm text-slate-500 mt-1">Broj odigranih</p>
            </div>
          </section>
        )}

        {/* Stanja: loading / error / prazno / tabela */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">
              Učitavanje statistike...
            </p>
          </div>

        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
            {error}
          </div>

        ) : !podatki || !podatki.statistike || podatki.statistike.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">
              Nema dostupnih statističkih podataka.
            </p>
          </div>

        ) : (
          <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50 text-left">
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">
                      Tip Statistike
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      Ukupno
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      Prosjek
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {podatki.statistike.map((stat, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-amber-100 hover:bg-amber-50 transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-slate-800">
                        {stat.nazivStatistike}
                      </td>
                      <td className="px-5 py-4 text-center font-black text-orange-600">
                        {stat.ukupno.toFixed(1)}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-600">
                        {(stat.ukupno / (podatki.brojUtakmica || 1)).toFixed(2)}
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

export default StatistikaIgraca;
