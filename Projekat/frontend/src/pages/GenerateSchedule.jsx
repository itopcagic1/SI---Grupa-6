import { useState, useEffect } from 'react';
import { fetchLige } from '../api/ligaApi';
import Navbar from '../components/Navbar';
import { generateSchedule } from '../api/matchApi';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/authApi';

function GenerateSchedule() {
  const navigate = useNavigate();
  const [lige, setLige] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    takmicenjeId: '',
    pocetniDatum: '',
    defaultnoVrijeme: '',
    defaultnaLokacija: ''
  });

  const [formError, setFormError] = useState(null);

  const korisnikStr = localStorage.getItem('korisnik');
  const korisnik = korisnikStr ? JSON.parse(korisnikStr) : null;
  const isAdminOrOrganizer = korisnik && ['ADMINISTRATOR', 'ORGANIZATOR'].includes(korisnik.trenutnaUloga);

  useEffect(() => {
    if (!isAdminOrOrganizer) {
      navigate('/');
      return;
    }

    const loadLige = async () => {
      try {
        const response = await fetchLige();
        setLige(response.lige || []);
      } catch (err) {
        setError('Greška pri učitavanju liga');
      } finally {
        setLoading(false);
      }
    };

    loadLige();
  }, [isAdminOrOrganizer, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setResult(null);
    setGenerating(true);

    try {
      const response = await generateSchedule(formData);
      setResult(response);
    } catch (err) {
      setFormError(err.response?.data?.poruka || 'Greška pri generisanju rasporeda');
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('korisnik');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-xl">Učitavanje...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-10 px-6">
        <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight text-center">Generiši Raspored</h1>
            <p className="text-slate-500 mt-2 text-lg text-center">Automatsko kreiranje utakmica za odabranu ligu</p>
        </div>
        <div className="bg-white rounded-[32px] border border-amber-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Takmičenje */}
            <div>
              <label htmlFor="takmicenjeId" className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                Takmičenje *
              </label>
              <select
                id="takmicenjeId"
                name="takmicenjeId"
                value={formData.takmicenjeId}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700 appearance-none"
              >
                <option value="">Odaberite takmičenje...</option>
                {lige.map(liga => (
                  <option key={liga.takmicenjeId} value={liga.takmicenjeId}>
                    {liga.naziv}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Početni datum */}
                <div>
                  <label htmlFor="pocetniDatum" className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                    Početni datum *
                  </label>
                  <input
                    type="date"
                    id="pocetniDatum"
                    name="pocetniDatum"
                    value={formData.pocetniDatum}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
                  />
                </div>

                {/* Defaultno vrijeme */}
                <div>
                  <label htmlFor="defaultnoVrijeme" className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                    Vrijeme utakmica *
                  </label>
                  <input
                    type="time"
                    id="defaultnoVrijeme"
                    name="defaultnoVrijeme"
                    value={formData.defaultnoVrijeme}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
                  />
                </div>
            </div>

            {/* Defaultna lokacija */}
            <div>
              <label htmlFor="defaultnaLokacija" className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                Lokacija utakmica
              </label>
              <input
                type="text"
                id="defaultnaLokacija"
                name="defaultnaLokacija"
                value={formData.defaultnaLokacija}
                onChange={handleInputChange}
                placeholder="npr. Stadion Grbavica"
                className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
              />
            </div>

            {/* Error */}
            {formError && (
              <div className="px-5 py-3.5 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl text-sm font-bold">{formError}</div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={generating}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 active:scale-95 disabled:opacity-50"
              >
                {generating ? 'Generisanje...' : 'Generiši raspored'}
              </button>
            </div>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-10 pt-10 border-t-2 border-amber-50">
              <div className="bg-green-50 border-2 border-green-200 rounded-[24px] p-6 mb-8">
                  <h2 className="text-xl font-black text-green-900 mb-2">Uspješno generisano!</h2>
                  <p className="text-green-700 font-medium">{result.poruka}</p>
                  <p className="text-green-800 font-bold mt-2">Broj kreiranih utakmica: {result.brojKreiranihUtakmica}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Pregled kreiranih utakmica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.utakmice.map((utakmica, index) => (
                      <div key={utakmica.utakmicaId} className="bg-slate-50 border border-amber-100 rounded-[24px] p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-2">Utakmica {index + 1}</p>
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="font-bold text-slate-800">{utakmica.domaciTim.naziv}</span>
                            <span className="text-xs font-black text-slate-400 px-2 py-1 bg-white border border-amber-50 rounded-lg">VS</span>
                            <span className="font-bold text-slate-800">{utakmica.gostujuciTim.naziv}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-500">
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                                {new Date(utakmica.vrijemePocetka).toLocaleDateString('bs-BA')}
                            </div>
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                {new Date(utakmica.vrijemePocetka).toLocaleTimeString('bs-BA', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GenerateSchedule;