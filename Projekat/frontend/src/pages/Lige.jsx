import { useState, useEffect } from 'react';
import { fetchLige, createLiga, updateLiga, deleteLiga, fetchSportovi } from '../api/ligaApi';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/authApi';

function Lige() {
  const navigate = useNavigate();
  const [lige, setLige] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('');
  const [sportovi, setSportovi] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedLiga, setSelectedLiga] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    naziv: '',
    sportId: '',
    sezona: '',
    opis: '',
    datumPocetka: '',
    datumZavrsetka: '',
    tipTakmicenja: '',
    status: ''
  });

  const [formError, setFormError] = useState(null);

  // User details
  const korisnikStr = localStorage.getItem('korisnik');
  const korisnik = korisnikStr ? JSON.parse(korisnikStr) : null;
  const isAdminOrOrganizer = korisnik && ['ADMINISTRATOR', 'ORGANIZATOR'].includes(korisnik.trenutnaUloga);

  useEffect(() => {
    loadLige();
    loadSportovi();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await logoutUser(token);
      } catch (err) {
        console.error('Greška pri odjavi na serveru', err);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    navigate('/login');
  };

  const loadSportovi = async () => {
    try {
      const data = await fetchSportovi();
      setSportovi(Array.isArray(data) ? data : data.sportovi || []);
    } catch (err) {
      console.error('Greška pri učitavanju sportova', err);
    }
  };

  const loadLige = async () => {
    try {
      setLoading(true);
      const data = await fetchLige();
      // Provjera strukture odgovora (ako backend vraca podatke u nekom objektu)
      const ligeData = data.lige || data.podaci || data || [];
      setLige(Array.isArray(ligeData) ? ligeData : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.poruka || 'Greška pri učitavanju liga.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, liga = null) => {
    setModalMode(mode);
    setFormError(null);
    if (mode === 'edit' && liga) {
      setSelectedLiga(liga);
      setFormData({
        naziv: liga.naziv || '',
        sportId: liga.sportId || '',
        sezona: liga.sezona || '',
        opis: liga.opis || '',
        datumPocetka: liga.datumPocetka ? new Date(liga.datumPocetka).toISOString().slice(0, 16) : '',
        datumZavrsetka: liga.datumZavrsetka ? new Date(liga.datumZavrsetka).toISOString().slice(0, 16) : '',
        tipTakmicenja: liga.tipTakmicenja || '',
        status: liga.status || ''
      });
    } else {
      setSelectedLiga(null);
      setFormData({
        naziv: '',
        sportId: '',
        sezona: '',
        opis: '',
        datumPocetka: '',
        datumZavrsetka: '',
        tipTakmicenja: '',
        status: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLiga(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Prepare data
    const dataToSend = { ...formData };

    // Convert sportId to number
    if (dataToSend.sportId) {
      dataToSend.sportId = parseInt(dataToSend.sportId, 10);
    }

    // Remove empty optional fields
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === '') {
        delete dataToSend[key];
      }
    });

    // Format dates to proper ISO if they exist
    if (dataToSend.datumPocetka) dataToSend.datumPocetka = new Date(dataToSend.datumPocetka).toISOString();
    if (dataToSend.datumZavrsetka) dataToSend.datumZavrsetka = new Date(dataToSend.datumZavrsetka).toISOString();

    try {
      if (modalMode === 'create') {
        await createLiga(dataToSend);
      } else {
        await updateLiga(selectedLiga.takmicenjeId, dataToSend);
      }
      handleCloseModal();
      loadLige(); // Refresh the list
    } catch (err) {
      setFormError(
        err.response?.data?.poruka ||
        err.response?.data?.greska ||
        err.message ||
        'Došlo je do greške prilikom spašavanja.'
      );
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id, naziv) => {
    if (window.confirm(`Da li ste sigurni da želite obrisati ligu "${naziv}"?`)) {
      try {
        await deleteLiga(id);
        loadLige();
      } catch (err) {
        alert(err.response?.data?.poruka || 'Greška pri brisanju lige.');
      }
    }
  };

  const filteredLige = lige.filter((liga) => {
    const matchesSearch = liga.naziv.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSportFilter === '' || liga.sportId === parseInt(selectedSportFilter, 10);
    return matchesSearch && matchesSport;
  });

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      {/* Navbar Placeholder */}
      <nav className="bg-white border-b border-amber-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-2xl font-black text-amber-950 lowercase italic tracking-tighter">
            sport<span className="text-orange-600">.ba</span>
          </Link>
          <div className="hidden md:flex gap-4 ml-6">
            <Link to="/lige" className="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-xl text-sm">
              Lige
            </Link>
            <span className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 cursor-pointer text-sm transition-colors">
              Timovi
            </span>
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
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors"
            >
              Odjava
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Lige</h1>
            <p className="text-slate-500 mt-2 text-lg">Sportske lige u BiH</p>
          </div>
          {isAdminOrOrganizer && (
            <button
              onClick={() => handleOpenModal('create')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Dodaj Novu Ligu
            </button>
          )}
        </div>

        {/* Search Bar & Sport Filter */}
        <div className="mb-10 flex flex-col gap-6">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pretraži lige po nazivu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
            />
          </div>

          {/* Sport Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSportFilter('')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                selectedSportFilter === '' 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-50 hover:border-amber-300'
              }`}
            >
              Svi Sportovi
            </button>
            {sportovi.map((sport) => (
              <button
                key={sport.sportId}
                onClick={() => setSelectedSportFilter(sport.sportId.toString())}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  selectedSportFilter === sport.sportId.toString()
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30' 
                    : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-50 hover:border-amber-300'
                }`}
              >
                {sport.naziv}
              </button>
            ))}
          </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <div className="text-orange-600 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-orange-900 font-medium">
            Kao {korisnik?.trenutnaUloga === 'ADMINISTRATOR' ? 'Administrator' : korisnik?.trenutnaUloga === 'ORGANIZATOR' ? 'Organizator' : 'Korisnik'}, možete pregledati aktuelne lige.
            {isAdminOrOrganizer && ' Također imate opciju kreiranja novih liga te upravljanja postojećim.'}
          </p>
        </div>

        {/* Lige Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">Učitavanje liga...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
            {error}
          </div>
        ) : filteredLige.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">Nije pronađena nijedna liga.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLige.map((liga) => (
              <div key={liga.takmicenjeId} className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-orange-600 transition-colors">{liga.naziv}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest rounded-lg">
                      {sportovi.find(s => s.sportId === liga.sportId)?.naziv || `Sport ID: ${liga.sportId}`}
                    </span>
                    <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg ${liga.status === 'Aktivan' || liga.status === 'U toku'
                        ? 'bg-green-50 text-green-700'
                        : liga.status === 'Završeno'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                      {liga.status || 'Nepoznat Status'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                      <span className="w-20 text-slate-400">Sezona:</span>
                      <span className="text-slate-800">{liga.sezona || 'Nije definisano'}</span>
                    </p>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                      <span className="w-20 text-slate-400">Tip:</span>
                      <span className="text-slate-800">{liga.tipTakmicenja || 'Nije definisano'}</span>
                    </p>
                    {liga.organizator && (
                      <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                        <span className="w-20 text-slate-400">Org:</span>
                        <span className="text-slate-800">{liga.organizator.punoIme || liga.organizator.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                {isAdminOrOrganizer && (
                  <div className="pt-4 border-t border-amber-50 flex gap-3">
                    <button
                      onClick={() => handleOpenModal('edit', liga)}
                      className="flex-1 py-2.5 bg-orange-50 text-orange-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-100 transition-colors"
                    >
                      Izmijeni
                    </button>
                    <button
                      onClick={() => handleDelete(liga.takmicenjeId, liga.naziv)}
                      className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-100 transition-colors"
                    >
                      Obriši
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-amber-50 flex justify-between items-center bg-white z-10">
              <h2 className="text-2xl font-black text-slate-800">
                {modalMode === 'create' ? 'Nova Liga' : 'Izmjena Lige'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-1">
              {formError && (
                <div className="mb-6 px-5 py-3.5 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl text-sm font-bold">
                  {formError}
                </div>
              )}

              <form id="ligaForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                    Naziv Lige *
                  </label>
                  <input
                    type="text"
                    name="naziv"
                    value={formData.naziv}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
                    placeholder="Unesite naziv..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                    Sport *
                  </label>
                  <select
                    name="sportId"
                    value={formData.sportId}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700 appearance-none"
                  >
                    <option value="">Odaberite sport...</option>
                    {sportovi.map((sport) => (
                      <option key={sport.sportId} value={sport.sportId}>
                        {sport.naziv}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                      Sezona
                    </label>
                    <input
                      type="text"
                      name="sezona"
                      value={formData.sezona}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
                      placeholder="Npr. 2026/2027"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                      Tip Takmičenja
                    </label>
                    <input
                      type="text"
                      name="tipTakmicenja"
                      value={formData.tipTakmicenja}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
                      placeholder="Npr. Kup, Liga"
                    />
                  </div>
                </div>

                {modalMode === 'edit' && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700 appearance-none"
                    >
                      <option value="">Odaberite status</option>
                      <option value="U planu">U planu</option>
                      <option value="Aktivan">Aktivan</option>
                      <option value="Završeno">Završeno</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                      Datum Početka
                    </label>
                    <input
                      type="datetime-local"
                      name="datumPocetka"
                      value={formData.datumPocetka}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                      Datum Završetka
                    </label>
                    <input
                      type="datetime-local"
                      name="datumZavrsetka"
                      value={formData.datumZavrsetka}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                    Opis
                  </label>
                  <textarea
                    name="opis"
                    value={formData.opis}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm text-slate-700 resize-none"
                    placeholder="Dodatne informacije o ligi..."
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-amber-50 bg-slate-50 flex justify-end gap-3 rounded-b-[32px]">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-3.5 bg-white border-2 border-amber-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Otkaži
              </button>
              <button
                type="submit"
                form="ligaForm"
                className="px-8 py-3.5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 active:scale-95"
              >
                Spasi Promjene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lige;
