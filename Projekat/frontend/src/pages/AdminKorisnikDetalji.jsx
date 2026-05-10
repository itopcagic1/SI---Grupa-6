import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getKorisnikDetalji, obrisiKorisnika, blokirajKorisnika, obradiZahtjevUloge, promijeniUlogu } from '../api/adminApi';
import { logoutUser } from '../api/authApi';

const SVE_ULOGE = ['NAVIJAC', 'IGRAC', 'TRENER', 'ORGANIZATOR', 'VLASNIK'];

export default function AdminKorisnikDetalji() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const adminKorisnik = JSON.parse(localStorage.getItem('korisnik'));

  const [korisnik, setKorisnik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState('');
  const [poruka, setPoruka] = useState('');
  const [brisanjePotvrda, setBrisanjePotvrda] = useState(false);
  const [razlogOdbijanja, setRazlogOdbijanja] = useState('');
  const [razlogBlokiranja, setRazlogBlokiranja] = useState('');
  const [pokaziRazlog, setPokaziRazlog] = useState(false);
  const [odabranaUloga, setOdabranaUloga] = useState('');
  const [mijenjamUlogu, setMijenjamUlogu] = useState(false);

  const handleLogout = async () => {
    try { if (token) await logoutUser(token); } catch { }
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    navigate('/login');
  };

  const ucitajKorisnika = async () => {
    setLoading(true);
    setGreska('');
    try {
      const data = await getKorisnikDetalji(token, id);
      setKorisnik(data.korisnik);
      setOdabranaUloga(data.korisnik.uloga);
    } catch {
      setGreska('Greška pri učitavanju podataka o korisniku.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ucitajKorisnika(); }, [id]);

  const prikaziPoruku = (tekst) => {
    setPoruka(tekst);
    setTimeout(() => setPoruka(''), 3000);
  };

  const handleBlokiranje = async () => {
    const akcija = korisnik.statusPouzdanosti === 'BLOKIRAN' ? 'ODBLOKIRAJ' : 'BLOKIRAJ';
    if (akcija === 'BLOKIRAJ' && !razlogBlokiranja.trim()) {
      setGreska('Unesite razlog blokiranja.');
      return;
    }
    setGreska('');
    try {
      await blokirajKorisnika(token, korisnik.korisnikId, akcija, razlogBlokiranja);
      prikaziPoruku(akcija === 'BLOKIRAJ' ? 'Korisnik uspješno blokiran.' : 'Korisnik uspješno odblokiran.');
      setRazlogBlokiranja('');
      setPokaziRazlog(false);
      ucitajKorisnika();
    } catch {
      setGreska('Greška pri blokiranju korisnika.');
    }
  };

  const handleObrisi = async () => {
    try {
      await obrisiKorisnika(token, korisnik.korisnikId);
      navigate('/admin/korisnici', { state: { poruka: 'Korisnik uspješno obrisan.' } });
    } catch {
      setGreska('Greška pri brisanju korisnika.');
      setBrisanjePotvrda(false);
    }
  };

  const handleObradiZahtjev = async (akcija) => {
    if (akcija === 'ODBIJ' && !razlogOdbijanja.trim()) {
      setGreska('Unesite razlog odbijanja.');
      return;
    }
    setGreska('');
    try {
      await obradiZahtjevUloge(token, korisnik.korisnikId, akcija, razlogOdbijanja);
      prikaziPoruku(akcija === 'ODOBRI' ? 'Uloga odobrena!' : 'Zahtjev odbijen.');
      setRazlogOdbijanja('');
      ucitajKorisnika();
    } catch {
      setGreska('Greška pri obradi zahtjeva za ulogu.');
    }
  };

  const handlePromijeniUlogu = async () => {
    if (odabranaUloga === korisnik.uloga) {
      setGreska('Odabrana uloga je ista kao trenutna.');
      return;
    }
    setGreska('');
    setMijenjamUlogu(true);
    try {
      await promijeniUlogu(token, korisnik.korisnikId, odabranaUloga);
      prikaziPoruku(`Uloga uspješno promijenjena u ${odabranaUloga}.`);
      ucitajKorisnika();
    } catch {
      setGreska('Greška pri promjeni uloge.');
    } finally {
      setMijenjamUlogu(false);
    }
  };

  const inicijalice = (ime) =>
    ime ? ime.split(' ').map(r => r[0]).join('').toUpperCase().slice(0, 2) : '?';

  const statusBoja = (status) => {
    if (status === 'BLOKIRAN') return 'bg-red-100 text-red-700';
    if (status === 'AKTIVAN') return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-500';
  };

  const zahtjevBoja = (status) => {
    if (status === 'PENDING') return 'bg-amber-100 text-amber-700';
    if (status === 'ODOBREN') return 'bg-green-100 text-green-700';
    if (status === 'ODBIJEN') return 'bg-red-100 text-red-600';
    return 'bg-slate-100 text-slate-500';
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans">

      {/* Navbar */}
      <nav className="bg-white border-b border-amber-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-2xl font-black text-amber-950 lowercase italic tracking-tighter">
            sport<span className="text-orange-600">.ba</span>
          </Link>
          <div className="hidden md:flex gap-4 ml-6">
            <Link to="/lige" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 text-sm transition-colors">Lige</Link>
            <Link to="/teams" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 text-sm transition-colors">Timovi</Link>
            <Link to="/profile" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 text-sm transition-colors">Profil</Link>
            <Link to="/admin/korisnici" className="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-xl text-sm">Admin Panel</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold text-sm">
            {adminKorisnik ? (adminKorisnik.punoIme?.charAt(0) || adminKorisnik.email.charAt(0)).toUpperCase() : '?'}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">
            {adminKorisnik ? adminKorisnik.punoIme || adminKorisnik.email : 'Gost'}
          </span>
          {adminKorisnik && (
            <button onClick={handleLogout} className="ml-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">
              Odjava
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/admin/korisnici" className="text-sm text-slate-500 hover:text-orange-600 font-medium transition-colors">
            ← Nazad na listu korisnika
          </Link>
        </div>

        {/* Poruke */}
        {poruka && (
          <div className="mb-5 px-5 py-3 bg-green-50 border border-green-200 text-green-800 rounded-2xl font-bold text-sm">
            ✓ {poruka}
          </div>
        )}
        {greska && (
          <div className="mb-5 px-5 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-sm">
            ✕ {greska}
          </div>
        )}

        {loading ? (
          <div className="text-center py-32">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">Učitavanje...</p>
          </div>
        ) : !korisnik ? (
          <div className="text-center py-32 bg-white rounded-[32px] border border-amber-100">
            <p className="text-slate-500 text-lg font-medium">Korisnik nije pronađen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Lijeva kolona ── */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Osnovno */}
              <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm p-8">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-black text-xl flex-shrink-0">
                    {inicijalice(korisnik.punoIme)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-800">{korisnik.punoIme || '—'}</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{korisnik.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-amber-50 rounded-2xl px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-1">Uloga</div>
                    <div className="font-bold text-slate-800">{korisnik.uloga}</div>
                  </div>
                  <div className="bg-amber-50 rounded-2xl px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-1">Tražena uloga</div>
                    <div className="font-bold text-slate-800">{korisnik.trazenaUloga || '—'}</div>
                  </div>
                  <div className="bg-amber-50 rounded-2xl px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-1">Datum registracije</div>
                    <div className="font-bold text-slate-800">
                      {korisnik.datumKreiranja
                        ? new Date(korisnik.datumKreiranja).toLocaleDateString('bs-BA')
                        : '—'}
                    </div>
                  </div>
                  <div className="bg-amber-50 rounded-2xl px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-1">Status zahtjeva</div>
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${zahtjevBoja(korisnik.statusUloge)}`}>
                      {korisnik.statusUloge || '—'}
                    </span>
                  </div>
                  <div className="bg-amber-50 rounded-2xl px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-1">Status naloga</div>
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${statusBoja(korisnik.statusPouzdanosti || 'AKTIVAN')}`}>
                      {korisnik.statusPouzdanosti || 'AKTIVAN'}
                    </span>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${korisnik.brojPreksrenihRezervacija > 0 ? 'bg-red-50' : 'bg-amber-50'}`}>
                    <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-1">Prekinute rezervacije</div>
                    <div className={`font-bold ${korisnik.brojPreksrenihRezervacija > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {korisnik.brojPreksrenihRezervacija ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Razlog blokiranja — prikaži samo ako je blokiran */}
              {korisnik.statusPouzdanosti === 'BLOKIRAN' && (
                <div className="bg-red-50 rounded-[32px] border border-red-100 shadow-sm p-8">
                  <h2 className="text-base font-black text-red-800 uppercase tracking-widest mb-3">
                    🔒 Nalog je blokiran
                  </h2>
                  <div className="text-xs font-black uppercase tracking-widest text-red-900/50 mb-1">Razlog blokiranja</div>
                  <p className="text-sm text-red-700 font-medium">
                    {korisnik.razlogBlokiranja || <span className="italic text-red-400">Razlog nije naveden.</span>}
                  </p>
                </div>
              )}

              {/* Zahtjev za ulogu — samo ako je PENDING */}
              {korisnik.statusUloge === 'PENDING' && (
                <div className="bg-white rounded-[32px] border border-amber-200 shadow-sm p-8">
                  <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4">
                    Zahtjev za ulogu
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Korisnik traži ulogu <span className="font-black text-orange-600">{korisnik.trazenaUloga}</span>.
                  </p>
                  <input type="text" placeholder="Razlog odbijanja (obavezno ako odbijate)..."
                    value={razlogOdbijanja} onChange={(e) => setRazlogOdbijanja(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none text-sm font-medium text-slate-700 mb-3" />
                  <div className="flex gap-3">
                    <button onClick={() => handleObradiZahtjev('ODOBRI')}
                      className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-colors">
                      Odobri ulogu
                    </button>
                    <button onClick={() => handleObradiZahtjev('ODBIJ')}
                      className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-colors">
                      Odbij zahtjev
                    </button>
                  </div>
                </div>
              )}

              {/* Angažmani */}
              <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm p-8">
                <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4">
                  Aktivni angažmani
                </h2>
                {korisnik.angazmani && korisnik.angazmani.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {korisnik.angazmani.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-amber-50 rounded-2xl px-4 py-3">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{a.naziv}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{a.tip}</div>
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-700 px-3 py-1 rounded-lg">
                          {a.uloga}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Nema aktivnih angažmana.</p>
                )}
              </div>
            </div>

            {/* ── Desna kolona: admin akcije ── */}
            {korisnik.uloga !== 'ADMINISTRATOR' ? (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm p-6">
                  <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4">
                    Admin akcije
                  </h2>

                  {/* Promjena uloge */}
                  <div className="mb-4">
                    <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-2">Promijeni ulogu</div>
                    <select value={odabranaUloga} onChange={(e) => setOdabranaUloga(e.target.value)}
                      className="w-full px-4 py-2.5 bg-amber-50 border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-slate-700 text-sm mb-2">
                      {SVE_ULOGE.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <button onClick={handlePromijeniUlogu}
                      disabled={mijenjamUlogu || odabranaUloga === korisnik.uloga}
                      className="w-full py-2.5 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {mijenjamUlogu ? 'Mijenjam...' : 'Sačuvaj ulogu'}
                    </button>
                  </div>

                  <div className="border-t border-amber-100 my-4" />

                  {/* Blokiranje */}
                  {korisnik.statusPouzdanosti === 'BLOKIRAN' ? (
                    <button onClick={handleBlokiranje}
                      className="w-full py-3 rounded-2xl font-black uppercase tracking-widest text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors mb-3">
                      🔓 Odblokiraj korisnika
                    </button>
                  ) : !pokaziRazlog ? (
                    <button onClick={() => setPokaziRazlog(true)}
                      className="w-full py-3 rounded-2xl font-black uppercase tracking-widest text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors mb-3">
                      🔒 Blokiraj korisnika
                    </button>
                  ) : (
                    <div className="mb-3">
                      <div className="text-xs font-black uppercase tracking-widest text-amber-900/50 mb-2">Razlog blokiranja</div>
                      <textarea
                        placeholder="Unesite razlog blokiranja..."
                        value={razlogBlokiranja}
                        onChange={(e) => setRazlogBlokiranja(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-amber-50 border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none text-sm font-medium text-slate-700 resize-none mb-2"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { setPokaziRazlog(false); setRazlogBlokiranja(''); }}
                          className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
                          Odustani
                        </button>
                        <button onClick={handleBlokiranje}
                          className="flex-1 py-2.5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-colors">
                          Potvrdi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Brisanje */}
                  {!brisanjePotvrda ? (
                    <button onClick={() => setBrisanjePotvrda(true)}
                      className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-100 transition-colors">
                      🗑 Obriši korisnika
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                      <p className="text-sm text-red-700 font-bold mb-3">Sigurno želiš trajno obrisati ovog korisnika?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setBrisanjePotvrda(false)}
                          className="flex-1 py-2 bg-white border border-amber-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                          Odustani
                        </button>
                        <button onClick={handleObrisi}
                          className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
                          Da, obriši
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 rounded-[32px] border border-amber-100 p-6">
                  <p className="text-xs text-amber-900/60 font-medium leading-relaxed">
                    Brisanje korisnika je permanentna akcija i ne može biti poništena. Blokirani korisnik ne može pristupiti aplikaciji.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm p-6 flex items-center justify-center">
                <p className="text-center text-sm text-slate-400 font-medium">
                  Administrator nalog ne može biti blokiran ili obrisan.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
