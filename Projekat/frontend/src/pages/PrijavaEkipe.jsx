import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchTeams } from '../api/teamApi';
import { fetchLige } from '../api/ligaApi';
import { createApplication } from '../api/applicationsApi';

function PrijavaEkipe() {
  const navigate = useNavigate();

  const [timovi, setTimovi] = useState([]);
  const [lige, setLige] = useState([]);
  const [timId, setTimId] = useState('');
  const [takmicenjeId, setTakmicenjeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [poruka, setPoruka] = useState('');
  const [greska, setGreska] = useState('');

  const korisnikStr = localStorage.getItem('korisnik');
  const korisnik = korisnikStr ? JSON.parse(korisnikStr) : null;

  useEffect(() => {
    if (!korisnik || korisnik.trenutnaUloga !== 'TRENER') {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setGreska('');

      const [timoviData, ligeData] = await Promise.all([
        fetchTeams(),
        fetchLige(),
      ]);

      setTimovi(Array.isArray(timoviData) ? timoviData : []);

      const listaLiga = ligeData.lige || ligeData.podaci || ligeData || [];
      setLige(Array.isArray(listaLiga) ? listaLiga : []);
    } catch (error) {
      setGreska('Greška pri učitavanju timova i liga.');
    } finally {
      setLoading(false);
    }
  };

  const mojiTimovi = useMemo(() => {
    if (!korisnik) return [];

    return timovi.filter((tim) =>
      tim.clanstvaUcesnika?.some(
        (clanstvo) =>
          clanstvo.korisnikId === korisnik.korisnikId &&
          clanstvo.ulogaUTimu === 'TRENER' &&
          clanstvo.status === 'ACTIVE'
      )
    );
  }, [timovi, korisnik]);

  const odabraniTim = mojiTimovi.find((tim) => String(tim.timId) === String(timId));

  const dostupneLige = useMemo(() => {
    if (!odabraniTim) return lige;

    return lige.filter((liga) => liga.sportId === odabraniTim.sportId);
  }, [lige, odabraniTim]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPoruka('');
    setGreska('');

    if (!timId || !takmicenjeId) {
      setGreska('Morate odabrati tim i takmičenje.');
      return;
    }

    try {
      setSubmitting(true);

      await createApplication({
        timId: Number(timId),
        takmicenjeId: Number(takmicenjeId),
      });

      setPoruka('Tim je uspješno prijavljen na takmičenje.');
      setTimId('');
      setTakmicenjeId('');
    } catch (error) {
      setGreska(
        error.response?.data?.poruka ||
          'Greška pri prijavi tima na takmičenje.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans">

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-sm font-bold text-orange-700 hover:text-orange-800"
          >
            ← Nazad na dashboard
          </Link>

          <h1 className="text-4xl font-black text-slate-800 tracking-tight mt-4">
            Prijava ekipe
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Odaberite svoj tim i ligu/takmičenje na koje želite prijaviti ekipu.
          </p>
        </div>

        <section className="bg-white rounded-[32px] border border-amber-100 p-8 shadow-sm">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">
                Učitavanje podataka...
              </p>
            </div>
          ) : (
            <>
              {poruka && (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
                  {poruka}
                </div>
              )}

              {greska && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                  {greska}
                </div>
              )}

              {mojiTimovi.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-500 font-medium">
                    Trenutno nemate aktivan tim koji možete prijaviti.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                      Moj tim *
                    </label>
                    <select
                      value={timId}
                      onChange={(e) => {
                        setTimId(e.target.value);
                        setTakmicenjeId('');
                      }}
                      className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
                    >
                      <option value="">Odaberite tim</option>
                      {mojiTimovi.map((tim) => (
                        <option key={tim.timId} value={tim.timId}>
                          {tim.naziv} — {tim.sport?.naziv || 'Sport nije definisan'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                      Liga/takmičenje *
                    </label>
                    <select
                      value={takmicenjeId}
                      onChange={(e) => setTakmicenjeId(e.target.value)}
                      disabled={!timId}
                      className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        {timId ? 'Odaberite ligu/takmičenje' : 'Prvo odaberite tim'}
                      </option>
                      {dostupneLige.map((liga) => (
                        <option key={liga.takmicenjeId} value={liga.takmicenjeId}>
                          {liga.naziv} — {liga.sezona || 'Sezona nije definisana'}
                        </option>
                      ))}
                    </select>

                    {timId && dostupneLige.length === 0 && (
                      <p className="mt-2 text-sm text-red-600 font-semibold">
                        Nema dostupnih liga za sport odabranog tima.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!timId || !takmicenjeId || submitting}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Prijava u toku...' : 'Prijavi ekipu'}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default PrijavaEkipe;