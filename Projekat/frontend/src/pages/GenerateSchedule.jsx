import { useState, useEffect } from 'react';
import { fetchLige } from '../api/ligaApi';
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
      navigate('/dashboard');
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
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Generiši raspored</h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-orange-600 hover:text-orange-800"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Odjava
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Takmičenje */}
            <div>
              <label htmlFor="takmicenjeId" className="block text-sm font-medium text-gray-700">
                Takmičenje
              </label>
              <select
                id="takmicenjeId"
                name="takmicenjeId"
                value={formData.takmicenjeId}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Odaberite takmičenje</option>
                {lige.map(liga => (
                  <option key={liga.takmicenjeId} value={liga.takmicenjeId}>
                    {liga.naziv} ({liga.sport?.naziv})
                  </option>
                ))}
              </select>
            </div>

            {/* Početni datum */}
            <div>
              <label htmlFor="pocetniDatum" className="block text-sm font-medium text-gray-700">
                Početni datum
              </label>
              <input
                type="date"
                id="pocetniDatum"
                name="pocetniDatum"
                value={formData.pocetniDatum}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Defaultno vrijeme */}
            <div>
              <label htmlFor="defaultnoVrijeme" className="block text-sm font-medium text-gray-700">
                Vrijeme utakmica
              </label>
              <input
                type="time"
                id="defaultnoVrijeme"
                name="defaultnoVrijeme"
                value={formData.defaultnoVrijeme}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Defaultna lokacija */}
            <div>
              <label htmlFor="defaultnaLokacija" className="block text-sm font-medium text-gray-700">
                Lokacija utakmica
              </label>
              <input
                type="text"
                id="defaultnaLokacija"
                name="defaultnaLokacija"
                value={formData.defaultnaLokacija}
                onChange={handleInputChange}
                placeholder="npr. Stadion Grbavica"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Error */}
            {formError && (
              <div className="text-red-600 text-sm">{formError}</div>
            )}

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={generating}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {generating ? 'Generisanje...' : 'Generiši raspored'}
              </button>
            </div>
          </form>

          {/* Result */}
          {result && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Rezultat generisanja</h2>
              <p className="text-green-600 mb-4">{result.poruka}</p>
              <p className="mb-4">Broj kreiranih utakmica: {result.brojKreiranihUtakmica}</p>

              <div className="space-y-2">
                <h3 className="font-medium">Generisane utakmice:</h3>
                {result.utakmice.map((utakmica, index) => (
                  <div key={utakmica.utakmicaId} className="border rounded p-3">
                    <p><strong>Utakmica {index + 1}:</strong></p>
                    <p>{utakmica.domaciTim.naziv} vs {utakmica.gostujuciTim.naziv}</p>
                    <p>Datum: {new Date(utakmica.vrijemePocetka).toLocaleDateString()}</p>
                    <p>Vrijeme: {new Date(utakmica.vrijemePocetka).toLocaleTimeString()}</p>
                    {utakmica.lokacijaOpis && <p>Lokacija: {utakmica.lokacijaOpis}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GenerateSchedule;