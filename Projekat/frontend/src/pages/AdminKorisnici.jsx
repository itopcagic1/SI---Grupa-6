import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [odabraniKorisnik, setOdabraniKorisnik] = useState(null); // popup
  const [brisanjePotvrdа, setBrisanjePotvrda] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const korisnik = JSON.parse(localStorage.getItem('korisnik'));

  const handleLogout = async () => {
    try { if (token) await logoutUser(token); } catch {}
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
    } catch {}
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
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      {/* Navbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>
          sport<span style={{ color: '#ea580c' }}>.ba</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
            {korisnik?.punoIme || korisnik?.email}
          </span>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '0.4rem 1rem', borderRadius: '8px',
            border: '1px solid #e5e7eb', background: '#fff',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#ef4444',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Odjavi se
          </button>
        </div>
      </nav>

      <div style={{ padding: '2.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem', letterSpacing: '-1px' }}>
          Admin Panel
        </h1>

        {/* Tabovi */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {['pending', 'svi'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: tab === t ? '#ea580c' : '#e5e7eb',
              color: tab === t ? '#fff' : '#374151', fontWeight: 700, fontSize: '0.9rem',
            }}>
              {t === 'pending' ? 'Novi zahtjevi' : 'Svi korisnici'}
              {t === 'pending' && pendingBroj > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: tab === 'pending' ? '#fff' : '#ea580c',
                  color: tab === 'pending' ? '#ea580c' : '#fff',
                  borderRadius: '999px', padding: '0 7px', fontSize: '0.78rem', fontWeight: 800,
                }}>{pendingBroj}</span>
              )}
            </button>
          ))}
        </div>

        {/* Pretraga i filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1rem' }}></span>
            <input
              type="text"
              placeholder="Pronađi korisnika po imenu ili emailu..."
              value={pretraga}
              onChange={(e) => setPretraga(e.target.value)}
              style={{
                padding: '0.45rem 0.9rem 0.45rem 0.9rem',
                borderRadius: '8px', border: '1px solid #d1d5db',
                fontSize: '0.9rem', background: '#fff', minWidth: '300px', outline: 'none',
              }}
            />
          </div>
          {tab === 'svi' && (
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{
              padding: '0.45rem 0.9rem', borderRadius: '8px',
              border: '1px solid #d1d5db', fontSize: '0.9rem', background: '#fff',
            }}>
              <option value="">Svi statusi</option>
              <option value="PENDING">PENDING</option>
              <option value="ODOBREN">ODOBREN</option>
              <option value="ODBIJEN">ODBIJEN</option>
            </select>
          )}
        </div>

        {/* Poruke */}
        {poruka && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
            ✓ {poruka}
          </div>
        )}
        {greska && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>
            ✕ {greska}
          </div>
        )}

        {/* Tabela */}
        {loading ? (
          <p style={{ color: '#6b7280' }}>Učitavanje...</p>
        ) : korisnici.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Nema korisnika za prikaz.</p>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={th}>Ime</th>
                  <th style={th}>Email</th>
                  <th style={th}>Uloga</th>
                  <th style={th}>Tražena uloga</th>
                  <th style={th}>Status zahtjeva</th>
                  <th style={th}>Status naloga</th>
                  {tab === 'pending' && <th style={th}>Akcije</th>}
                </tr>
              </thead>
              <tbody>
                {korisnici.map((k) => (
                  <tr
                    key={k.korisnikId}
                    onClick={() => setOdabraniKorisnik(k)}
                    style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={td}>{k.punoIme || '—'}</td>
                    <td style={td}>{k.email}</td>
                    <td style={td}>{k.uloga}</td>
                    <td style={td}>{k.trazenaUloga || '—'}</td>
                    <td style={td}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700,
                        background: k.statusUloge === 'PENDING' ? '#fef3c7' : k.statusUloge === 'ODOBREN' ? '#d1fae5' : k.statusUloge === 'ODBIJEN' ? '#fee2e2' : '#f3f4f6',
                        color: k.statusUloge === 'PENDING' ? '#92400e' : k.statusUloge === 'ODOBREN' ? '#065f46' : k.statusUloge === 'ODBIJEN' ? '#991b1b' : '#6b7280',
                      }}>
                        {k.statusUloge || '—'}
                      </span>
                    </td>
                    <td style={td}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700,
                        background: k.statusPouzdanosti === 'BLOKIRAN' ? '#fee2e2' : '#f3f4f6',
                        color: k.statusPouzdanosti === 'BLOKIRAN' ? '#991b1b' : '#6b7280',
                      }}>
                        {k.statusPouzdanosti || 'AKTIVAN'}
                      </span>
                    </td>
                    {tab === 'pending' && (
                      <td style={td} onClick={(e) => e.stopPropagation()}>
                        {k.statusUloge === 'PENDING' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button onClick={() => handleObradi(k.korisnikId, 'ODOBRI')} style={{ ...dugme, background: '#16a34a', color: '#fff' }}>
                                Odobri
                              </button>
                              <button onClick={() => handleObradi(k.korisnikId, 'ODBIJ')} style={{ ...dugme, background: '#dc2626', color: '#fff' }}>
                                Odbij
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Razlog odbijanja..."
                              value={razlogMap[k.korisnikId] || ''}
                              onChange={(e) => setRazlog(k.korisnikId, e.target.value)}
                              style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.83rem', outline: 'none' }}
                            />
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
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => { setOdabraniKorisnik(null); setBrisanjePotvrda(false); }}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1.2rem' }}>
                  {odabraniKorisnik.punoIme || '—'}
                </h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>{odabraniKorisnik.email}</p>
              </div>
              <button onClick={() => { setOdabraniKorisnik(null); setBrisanjePotvrda(false); }} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#94a3b8', lineHeight: 1,
              }}>✕</button>
            </div>

            {/* Detalji */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
              {[
                ['Uloga', odabraniKorisnik.uloga],
                ['Tražena uloga', odabraniKorisnik.trazenaUloga || '—'],
                ['Status zahtjeva', odabraniKorisnik.statusUloge || '—'],
                ['Status naloga', odabraniKorisnik.statusPouzdanosti || 'AKTIVAN'],
              ].map(([label, value]) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.7rem 1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Akcije — samo ako nije admin */}
            {odabraniKorisnik.uloga !== 'ADMINISTRATOR' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                {/* Blokiranje */}
                <button onClick={handleBlokiranje} style={{
                  padding: '0.6rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700,
                  background: odabraniKorisnik.statusPouzdanosti === 'BLOKIRAN' ? '#e5e7eb' : '#f59e0b',
                  color: odabraniKorisnik.statusPouzdanosti === 'BLOKIRAN' ? '#374151' : '#fff',
                  fontSize: '0.9rem',
                }}>
                  {odabraniKorisnik.statusPouzdanosti === 'BLOKIRAN' ? 'Odblokiraj korisnika' : ' Blokiraj korisnika'}
                </button>

                {/* Brisanje */}
                {!brisanjePotvrdа ? (
                  <button onClick={() => setBrisanjePotvrda(true)} style={{
                    padding: '0.6rem', borderRadius: '8px', border: '1px solid #fca5a5',
                    background: '#fff', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                     Obriši korisnika
                  </button>
                ) : (
                  <div style={{ background: '#fee2e2', borderRadius: '8px', padding: '0.8rem', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 0.7rem', color: '#991b1b', fontWeight: 600, fontSize: '0.88rem' }}>
                      Sigurno želiš obrisati ovog korisnika?
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => setBrisanjePotvrda(false)} style={{ ...dugme, background: '#e5e7eb', color: '#374151' }}>
                        Odustani
                      </button>
                      <button onClick={handleObrisi} style={{ ...dugme, background: '#dc2626', color: '#fff' }}>
                        Da, obriši
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {odabraniKorisnik.uloga === 'ADMINISTRATOR' && (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                Administrator nalog ne može biti blokiran ili obrisan.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const th = {
  padding: '0.8rem 1.2rem', fontWeight: 700, color: '#475569',
  fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const td = {
  padding: '0.85rem 1.2rem', verticalAlign: 'middle', color: '#1e293b',
};

const dugme = {
  padding: '0.3rem 0.8rem', borderRadius: '6px', border: 'none',
  cursor: 'pointer', fontWeight: 700, fontSize: '0.83rem',
};
