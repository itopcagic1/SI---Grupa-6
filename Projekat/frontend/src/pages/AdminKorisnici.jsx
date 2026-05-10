import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getKorisnici, getBlokiraniKorisnici, obradiZahtjevUloge, blokirajKorisnika } from '../api/adminApi';
import { logoutUser } from '../api/authApi';
import Navbar from '../components/Navbar';

export default function AdminKorisnici() {
  const [tab, setTab] = useState('pending');
  const [filterStatus, setFilterStatus] = useState('');
  const [pretraga, setPretraga] = useState('');
  const [korisnici, setKorisnici] = useState([]);
  const [pendingBroj, setPendingBroj] = useState(0);
  const [blokiraniBroj, setBlokiraniBroj] = useState(0);
  const [loading, setLoading] = useState(false);
  const [greska, setGreska] = useState('');
  const [razlogMap, setRazlogMap] = useState({});
  const [poruka, setPoruka] = useState('');

  // Za inline blokiranje na blokirani tabu
  const [odblokirajId, setOdblokirajId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const korisnik = JSON.parse(localStorage.getItem('korisnik'));

  useEffect(() => {
    if (location.state?.poruka) {
      setPoruka(location.state.poruka);
      setTimeout(() => setPoruka(''), 3000);
      window.history.replaceState({}, '');
    }
  }, []);

  const handleLogout = async () => {
    try { if (token) await logoutUser(token); } catch { }
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    navigate('/');
  };

  const ucitajKorisnike = async (status = '', pretragaVal = '') => {
    setLoading(true);
    setGreska('');
    try {
      const data = await getKorisnici(token, status, pretragaVal);
      setKorisnici(data.korisnici);
    } catch {
      setGreska('Greška pri učitavanju korisnika.');
    } finally {
      setLoading(false);
    }
  };

  const ucitajBlokirane = async (pretragaVal = '') => {
    setLoading(true);
    setGreska('');
    try {
      const data = await getBlokiraniKorisnici(token, pretragaVal);
      setKorisnici(data.korisnici);
    } catch {
      setGreska('Greška pri učitavanju blokiranih korisnika.');
    } finally {
      setLoading(false);
    }
  };

  const ucitajBrojeve = async () => {
    try {
      const [pendingData, blokiraniData] = await Promise.all([
        getKorisnici(token, 'PENDING'),
        getBlokiraniKorisnici(token),
      ]);
      setPendingBroj(pendingData.korisnici.length);
      setBlokiraniBroj(blokiraniData.korisnici.length);
    } catch { }
  };

  useEffect(() => { ucitajBrojeve(); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tab === 'pending') ucitajKorisnike('PENDING', pretraga);
      else if (tab === 'svi') ucitajKorisnike(filterStatus, pretraga);
      else if (tab === 'blokirani') ucitajBlokirane(pretraga);
    }, 300);
    return () => clearTimeout(timeout);
  }, [tab, filterStatus, pretraga]);

  const prikaziPoruku = (tekst) => {
    setPoruka(tekst);
    setTimeout(() => setPoruka(''), 3000);
  };

  const handleObradi = async (korisnikId, akcija) => {
    const razlog = razlogMap[korisnikId] || '';
    if (akcija === 'ODBIJ' && !razlog.trim()) {
      setGreska('Unesite razlog odbijanja.');
      return;
    }
    setGreska('');
    try {
      await obradiZahtjevUloge(token, korisnikId, akcija, razlog);
      prikaziPoruku(akcija === 'ODOBRI' ? 'Uloga odobrena!' : 'Zahtjev odbijen.');
      ucitajBrojeve();
      ucitajKorisnike('PENDING', pretraga);
    } catch {
      setGreska('Greška pri obradi zahtjeva.');
    }
  };

  const handleOdblokiraj = async (korisnikId) => {
    try {
      await blokirajKorisnika(token, korisnikId, 'ODBLOKIRAJ');
      prikaziPoruku('Korisnik uspješno odblokiran.');
      setOdblokirajId(null);
      ucitajBrojeve();
      ucitajBlokirane(pretraga);
    } catch {
      setGreska('Greška pri odblokiranju korisnika.');
    }
  };

  const setRazlog = (korisnikId, vrijednost) => {
    setRazlogMap((prev) => ({ ...prev, [korisnikId]: vrijednost }));
  };

  const TABOVI = [
    { key: 'pending', label: 'Novi zahtjevi', broj: pendingBroj },
    { key: 'svi', label: 'Svi korisnici', broj: null },
    { key: 'blokirani', label: 'Blokirani korisnici', broj: blokiraniBroj },
  ];

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-8">Admin Panel</h1>

        {/* Tabovi */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {TABOVI.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setPretraga(''); }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2
                ${tab === t.key ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-50'}`}>
              {t.label}
              {t.broj > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-black
                  ${tab === t.key ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
                  {t.broj}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pretraga i filter */}
        <div className="flex gap-3 mb-5 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input type="text" placeholder="Pronađi korisnika po imenu ili emailu..."
              value={pretraga} onChange={(e) => setPretraga(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-slate-700 shadow-sm" />
          </div>
          {tab === 'svi' && (
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none font-medium text-slate-700 shadow-sm">
              <option value="">Svi statusi</option>
              <option value="PENDING">PENDING</option>
              <option value="ODOBREN">ODOBREN</option>
              <option value="ODBIJEN">ODBIJEN</option>
            </select>
          )}
        </div>

        {/* Poruke */}
        {poruka && (
          <div className="mb-4 px-5 py-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl font-bold text-sm">✓ {poruka}</div>
        )}
        {greska && (
          <div className="mb-4 px-5 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-sm">✕ {greska}</div>
        )}

        {/* Tabela */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">Učitavanje...</p>
          </div>
        ) : korisnici.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">
              {tab === 'blokirani' ? 'Nema blokiranih korisnika.' : 'Nema korisnika za prikaz.'}
            </p>
          </div>
        ) : tab === 'blokirani' ? (

          /* ── BLOKIRANI TAB ── */
          <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-50 text-left">
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Ime</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Email</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Uloga</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Penali</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Razlog blokiranja</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {korisnici.map((k) => (
                  <tr key={k.korisnikId}
                    className="border-t border-amber-50 hover:bg-amber-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <button onClick={() => navigate(`/admin/korisnici/${k.korisnikId}`)}
                        className="font-medium text-slate-800 hover:text-orange-600 transition-colors text-left">
                        {k.punoIme || '—'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{k.email}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{k.uloga}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black
                        ${k.brojPreksrenihRezervacija > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {k.brojPreksrenihRezervacija} {k.brojPreksrenihRezervacija === 1 ? 'penal' : 'penala'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs">
                      {k.razlogBlokiranja
                        ? <span className="italic text-slate-500">{k.razlogBlokiranja}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {odblokirajId === k.korisnikId ? (
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-slate-600 font-medium">Sigurno?</span>
                          <button onClick={() => handleOdblokiraj(k.korisnikId)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 transition-colors">
                            Da
                          </button>
                          <button onClick={() => setOdblokirajId(null)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-200 transition-colors">
                            Ne
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setOdblokirajId(k.korisnikId)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs hover:bg-green-50 hover:text-green-700 transition-colors">
                          Odblokiraj
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (

          /* ── PENDING / SVI TAB ── */
          <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-50 text-left">
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Ime</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Email</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Uloga</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Tražena uloga</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Status zahtjeva</th>
                  <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Status naloga</th>
                  {tab === 'pending' && <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">Akcije</th>}
                </tr>
              </thead>
              <tbody>
                {korisnici.map((k) => (
                  <tr key={k.korisnikId}
                    onClick={() => navigate(`/admin/korisnici/${k.korisnikId}`)}
                    className="border-t border-amber-50 cursor-pointer hover:bg-amber-50 transition-colors group">
                    <td className="px-5 py-4 font-medium text-slate-800 group-hover:text-orange-600 transition-colors">
                      {k.punoIme || '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{k.email}</td>
                    <td className="px-5 py-4 text-slate-800 font-semibold">{k.uloga}</td>
                    <td className="px-5 py-4 text-slate-600">{k.trazenaUloga || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest
                        ${k.statusUloge === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                          k.statusUloge === 'ODOBREN' ? 'bg-green-50 text-green-700' :
                          k.statusUloge === 'ODBIJEN' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {k.statusUloge || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest
                        ${k.statusPouzdanosti === 'BLOKIRAN' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {k.statusPouzdanosti || 'AKTIVAN'}
                      </span>
                    </td>
                    {tab === 'pending' && (
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {k.statusUloge === 'PENDING' && (
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <button onClick={() => handleObradi(k.korisnikId, 'ODOBRI')}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 transition-colors">
                                Odobri
                              </button>
                              <button onClick={() => handleObradi(k.korisnikId, 'ODBIJ')}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-colors">
                                Odbij
                              </button>
                            </div>
                            <input type="text" placeholder="Razlog odbijanja..."
                              value={razlogMap[k.korisnikId] || ''}
                              onChange={(e) => setRazlog(k.korisnikId, e.target.value)}
                              className="px-3 py-1.5 border border-amber-200 rounded-lg text-xs outline-none focus:border-orange-500 w-40" />
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
