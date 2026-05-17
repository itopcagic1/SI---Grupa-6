import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dohvatiTopStrijelce, fetchTipoviStatistike } from '../api/statistikaApi';
import { getIgrackiTipoviStatistike } from '../utils/statistikaTipovi';
import { fetchLige } from '../api/ligaApi';

function TopStrijelci() {
  const { id } = useParams(); // takmicenjeId iz URL-a

  const [rezultati, setRezultati] = useState(null);
  const [sve_lige, setSveLige] = useState([]);
  const [tipovi_statistike, setTipoviStatistike] = useState([]);
  const [takmicenjeId, setTakmicenjeId] = useState(id || '');
  const [tipStatistikeId, setTipStatistikeId] = useState('');
  const [limit, setLimit] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Učitaj sve lige za filter
  useEffect(() => {
    const ucitajLige = async () => {
      try {
        const response = await fetchLige();
        setSveLige(response.lige || []);
      } catch (err) {
        console.error('Greška pri učitavanju liga:', err);
      }
    };

    ucitajLige();
  }, []);

  // Učitaj tipove statistike kada se promijeni takmičenje
  useEffect(() => {
    const ucitajTipove = async () => {
      if (!takmicenjeId) {
        setTipoviStatistike([]);
        return;
      }

      try {
        // Pronađi sport za takmičenje
        const liga = sve_lige.find(l => l.takmicenjeId === Number(takmicenjeId));
        if (liga) {
          const tipovi = await fetchTipoviStatistike(liga.sportId);
          setTipoviStatistike(getIgrackiTipoviStatistike(tipovi));
        }
      } catch (err) {
        console.error('Greška pri učitavanju tipova statistike:', err);
      }
    };

    ucitajTipove();
  }, [takmicenjeId, sve_lige]);

  // Učitaj top strijelce kada se promijene parametri
  useEffect(() => {
    let isActive = true;

    const ucitajTopStrijelce = async () => {
      if (!takmicenjeId) {
        setRezultati(null);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const data = await dohvatiTopStrijelce(takmicenjeId, tipStatistikeId || undefined, parseInt(limit, 10));
        if (isActive) {
          setRezultati(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.poruka || 'Nije moguće učitati podatke.');
          setRezultati(null);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    ucitajTopStrijelce();
    return () => { isActive = false; };
  }, [takmicenjeId, tipStatistikeId, limit]);

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* Naslov */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">LIDERI STATISTIKE</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Rangirana lista igrača po statističkim kategorijama
          </p>
        </div>

        {/* Filteri */}
        <section className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 block">
                Takmičenje
              </label>
              <select
                value={takmicenjeId}
                onChange={(e) => {
                  setTakmicenjeId(e.target.value);
                  setTipStatistikeId('');
                }}
                className="w-full px-4 py-2 border border-amber-200 rounded-xl focus:outline-none focus:border-orange-600 font-medium"
              >
                <option value="">Odaberite takmičenje</option>
                {sve_lige.map(liga => (
                  <option key={liga.takmicenjeId} value={liga.takmicenjeId}>
                    {liga.naziv}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 block">
                Tip Statistike
              </label>
              <select
                value={tipStatistikeId}
                onChange={(e) => setTipStatistikeId(e.target.value)}
                disabled={!takmicenjeId}
                className="w-full px-4 py-2 border border-amber-200 rounded-xl focus:outline-none focus:border-orange-600 font-medium disabled:bg-gray-100"
              >
                <option value="">Odaberite tip</option>
                {tipovi_statistike.map(tip => (
                  <option key={tip.tipStatistikeId} value={tip.tipStatistikeId}>
                    {tip.nazivStatistike}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 block">
                Broj Igrača
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-4 py-2 border border-amber-200 rounded-xl focus:outline-none focus:border-orange-600 font-medium"
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
              </select>
            </div>
          </div>
        </section>

        {/* Info sekcija */}
        {rezultati && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-amber-900/60">Takmičenje</p>
              <p className="text-2xl font-black text-slate-800 mt-2">{rezultati.takmicenje?.naziv || '-'}</p>
            </div>

            <div className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-amber-900/60">Statistika</p>
              <p className="text-2xl font-black text-slate-800 mt-2">{rezultati.tipStatistike?.nazivStatistike || '-'}</p>
            </div>

            <div className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-amber-900/60">Broj Igrača</p>
              <p className="text-2xl font-black text-slate-800 mt-2">{rezultati.topStrijelci?.length || 0}</p>
            </div>
          </section>
        )}

        {/* Stanja: loading / error / prazno / tabela */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">
              Učitavanje podataka...
            </p>
          </div>

        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
            {error}
          </div>

        ) : !rezultati ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">
              Odaberite takmičenje. Ako nije izabrana kategorija, prikazat će se igrač sa najboljim prosjekom golova i asistencija po utakmici.
            </p>
          </div>

        ) : rezultati.topStrijelci.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">
              Nema dostupnih podataka za odabrane filtere.
            </p>
          </div>

        ) : (
          <div className="space-y-4">
            {rezultati.topStrijelci.map((igrac) => (
              <div
                key={igrac.igrac.korisnikId}
                className={`flex items-center justify-between p-6 rounded-[32px] border border-amber-100 shadow-sm ${
                  igrac.rank === 1
                    ? 'bg-yellow-50 border-yellow-200'
                    : igrac.rank === 2
                    ? 'bg-gray-50 border-gray-200'
                    : igrac.rank === 3
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white hover:bg-amber-50 transition-colors'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 text-orange-600 font-black text-xl">
                    {igrac.rank === 1 && '🥇'}
                    {igrac.rank === 2 && '🥈'}
                    {igrac.rank === 3 && '🥉'}
                    {igrac.rank > 3 && igrac.rank}
                  </div>

                  <div>
                    <p className="font-black text-slate-800">{igrac.igrac.punoIme}</p>
                    <p className="text-sm text-slate-500">{igrac.tim.naziv}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black text-orange-600">
                    {igrac.vrijednost.toFixed(1)}
                  </p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                    {rezultati.tipStatistike?.nazivStatistike}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default TopStrijelci;
