import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getKorisnici, obradiZahtjevUloge, obrisiKorisnika, blokirajKorisnika } from '../api/adminApi';
import { logoutUser } from '../api/authApi';

export default function AdminKorisnici() {
  const [tab, setTab] = useState('pending');
  const [filterStatus, setFilterStatus] = useState('');
  const [pretraga, setPretraga] = useState('');
  const [korisnici, setKorisnici] = useState([]);
  const [pendingBroj, setPendingBroj] = useState(0);
  const [loading, setLoading] = useState(false);
  const [greska, setGreska] = useState('');
  const [razlogMap, setRazlogMap] = useState({});
  const [poruka, setPoruka] = useState('');
  const [odabraniKorisnik, setOdabraniKorisnik] = useState(null);
  const [brisanjePotvrda, setBrisanjePotvrda] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const korisnik = JSON.parse(localStorage.getItem('korisnik'));

  const handleLogout = async () => {
    try { if (token) await logoutUser(token); } catch { }
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    navigate('/login');
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

  const ucitajPendingBroj = async () => {
    try {
      const data = await getKorisnici(token, 'PENDING');
      setPendingBroj(data.korisnici.length);
    } catch { }
  };

  useEffect(() => { ucitajPendingBroj(); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      tab === 'pending'
        ? ucitajKorisnike('PENDING', pretraga)
        : ucitajKorisnike(filterStatus, pretraga);
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
      ucitajPendingBroj();
      tab === 'pending' ? ucitajKorisnike('PENDING', pretraga) : ucitajKorisnike(filterStatus, pretraga);
    } catch {
      setGreska('Greška pri obradi zahtjeva.');
    }
  };

  const handleObrisi = async () => {
    try {
      await obrisiKorisnika(token, odabraniKorisnik.korisnikId);
      setBrisanjePotvrda(false);
      setOdabraniKorisnik(null);
      prikaziPoruku('Korisnik uspješno obrisan.');
      ucitajPendingBroj();
      tab === 'pending' ? ucitajKorisnike('PENDING', pretraga) : ucitajKorisnike(filterStatus, pretraga);
    } catch {
      setGreska('Greška pri brisanju korisnika.');
      setBrisanjePotvrda(false);
    }
  };

  const handleBlokiranje = async () => {
    const akcija = odabraniKorisnik.statusPouzdanosti === 'BLOKIRAN' ? 'ODBLOKIRAJ' : 'BLOKIRAJ';
    try {
      await blokirajKorisnika(token, odabraniKorisnik.korisnikId, akcija);
      prikaziPoruku(akcija === 'BLOKIRAJ' ? 'Korisnik blokiran.' : 'Korisnik odblokiran.');
      setOdabraniKorisnik(prev => ({ ...prev, statusPouzdanosti: akcija === 'BLOKIRAJ' ? 'BLOKIRAN' : 'AKTIVAN' }));
      tab === 'pending' ? ucitajKorisnike('PENDING', pretraga) : ucitajKorisnike(filterStatus, pretraga);
    } catch {
      setGreska('Greška pri blokiranju korisnika.');
    }
  };

  const setRazlog = (korisnikId, vrijednost) => {
    setRazlogMap((prev) => ({ ...prev, [korisnikId]: vrijednost }));
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans">

      {/* Navbar — isti stil kao Lige.jsx */}
      <nav className="bg-white border-b border-amber-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-2xl font-black text-amber-950 lowercase italic tracking-tighter">
            sport<span className="text-orange-600">.ba</span>
          </Link>
          <div className="hidden md:flex gap-4 ml-6">
            <Link to="/lige" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 cursor-pointer text-sm transition-colors">Lige</Link>
            <Link to="/teams" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 cursor-pointer text-sm transition-colors">Timovi</Link>
            <Link to="/profile" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 cursor-pointer text-sm transition-colors">
    Profil
  </Link>
            <span className="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-xl text-sm">Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold text-sm">
            {korisnik ? (korisnik.punoIme?.charAt(0) || korisnik.email.charAt(0)).toUpperCase() : '?'}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">
            {korisnik ? korisnik.punoIme || korisnik.email : 'Gost'}
          </span>
          {korisnik && (
            <button onClick={handleLogout} className="ml-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">
              Odjava
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-8">Admin Panel</h1>

        {/* Tabovi */}
        <div className="flex gap-3 mb-6">
          {['pending', 'svi'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === t ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-50'}`}>
              {t === 'pending' ? 'Novi zahtjevi' : 'Svi korisnici'}
              {t === 'pending' && pendingBroj > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-black ${tab === 'pending' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
                  {pendingBroj}
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
            <input
              type="text"
              placeholder="Pronađi korisnika po imenu ili emailu..."
              value={pretraga}
              onChange={(e) => setPretraga(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
            />
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
          <div className="mb-4 px-5 py-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl font-bold text-sm">
            ✓ {poruka}
          </div>
        )}
        {greska && (
          <div className="mb-4 px-5 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-sm">
            ✕ {greska}
          </div>
        )}

        {/* Tabela */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">Učitavanje...</p>
          </div>
        ) : korisnici.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">Nema korisnika za prikaz.</p>
          </div>
        ) : (
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
                  <tr key={k.korisnikId} onClick={() => setOdabraniKorisnik(k)}
                    className="border-t border-amber-50 cursor-pointer hover:bg-amber-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800">{k.punoIme || '—'}</td>
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

      {/* Popup detalji korisnika */}
      {odabraniKorisnik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => { setOdabraniKorisnik(null); setBrisanjePotvrda(false); }}>
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>

            <div className="px-8 py-6 border-b border-amber-50 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-slate-800">{odabraniKorisnik.punoIme || '—'}</h2>
                <p className="text-sm text-slate-500 mt-1">{odabraniKorisnik.email}</p>
              </div>
              <button onClick={() => { setOdabraniKorisnik(null); setBrisanjePotvrda(false); }}
                className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-full transition-colors text-sm">✕</button>
            </div>

            <div className="px-8 py-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  ['Uloga', odabraniKorisnik.uloga],
                  ['Tražena uloga', odabraniKorisnik.trazenaUloga || '—'],
                  ['Status zahtjeva', odabraniKorisnik.statusUloge || '—'],
                  ['Status naloga', odabraniKorisnik.statusPouzdanosti || 'AKTIVAN'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-amber-50 rounded-2xl px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-1">{label}</div>
                    <div className="font-bold text-slate-800 text-sm">{value}</div>
                  </div>
                ))}
              </div>

              {odabraniKorisnik.uloga !== 'ADMINISTRATOR' ? (
                <div className="flex flex-col gap-3">
                  <button onClick={handleBlokiranje}
                    className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-colors
                      ${odabraniKorisnik.statusPouzdanosti === 'BLOKIRAN'
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>
                    {odabraniKorisnik.statusPouzdanosti === 'BLOKIRAN' ? 'Odblokiraj korisnika' : 'Blokiraj korisnika'}
                  </button>

                  {!brisanjePotvrda ? (
                    <button onClick={() => setBrisanjePotvrda(true)}
                      className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-100 transition-colors">
                      Obriši korisnika
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                      <p className="text-sm text-red-700 font-bold mb-3">Sigurno želiš obrisati ovog korisnika?</p>
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => setBrisanjePotvrda(false)}
                          className="px-4 py-2 bg-white border border-amber-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                          Odustani
                        </button>
                        <button onClick={handleObrisi}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
                          Da, obriši
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-400">Administrator nalog ne može biti blokiran ili obrisan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
