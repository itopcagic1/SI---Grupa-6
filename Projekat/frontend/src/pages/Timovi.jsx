import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchTeams,
  fetchSports,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../api/teamApi';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Timovi() {
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const korisnikData = localStorage.getItem('korisnik') ? JSON.parse(localStorage.getItem('korisnik')) : null;
  const isAuthenticated = Boolean(token);
  const navigate = useNavigate();

  // Generiši inicijale iz imena
  const getInitials = (ime, prezime) => {
    return ((ime?.[0] || '') + (prezime?.[0] || '')).toUpperCase();
  };

  const userInitials = getInitials(korisnikData?.ime, korisnikData?.prezime);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      sportId: '',
      description: '',
      status: 'ACTIVE',
      league: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [teamsData, sportsData] = await Promise.all([fetchTeams(), fetchSports()]);
      setTeams(teamsData);
      setSports(sportsData);
    } catch (err) {
      const message = err.response?.data?.message || 'Greška prilikom učitavanja timova.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setSelectedTeam(null);
    reset({ name: '', sportId: '', description: '', status: 'ACTIVE', league: '' });
    setSubmissionMessage('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    reset({
      name: team.naziv,
      sportId: String(team.sportId),
      description: team.opis || '',
      status: team.status || 'ACTIVE',
      league: team.league || '',
    });
    setSubmissionMessage('');
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTeam(null);
  };

  const onSubmit = async (data) => {
    setError('');
    setSubmissionMessage('');

    if (!isAuthenticated) {
      setError('Morate biti prijavljeni da biste upravljali timovima.');
      return;
    }

    try {
      if (selectedTeam) {
        await updateTeam(selectedTeam.timId, {
          name: data.name,
          sportId: Number(data.sportId),
          description: data.description,
          status: data.status,
        });
        setSubmissionMessage('Tim je uspješno ažuriran.');
      } else {
        await createTeam({
          name: data.name,
          sportId: Number(data.sportId),
          description: data.description,
        });
        setSubmissionMessage('Tim je uspješno kreiran.');
      }
      closeModal();
      await loadData();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Greška pri spremanju tima.';
      setError(message);
    }
  };

  const handleDelete = async (team) => {
    if (!isAuthenticated) {
      setError('Morate biti prijavljeni da biste obrisali tim.');
      return;
    }

    const confirmed = window.confirm(`Jeste li sigurni da želite obrisati tim "${team.naziv}"?`);
    if (!confirmed) return;

    setError('');
    try {
      await deleteTeam(team.timId);
      setSubmissionMessage(`Tim "${team.naziv}" je obrisan.`);
      await loadData();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Greška pri brisanju tima.';
      setError(message);
    }
  };

  const statusOptions = useMemo(
    () => [
      { value: 'ACTIVE', label: 'Aktivan' },
      { value: 'INACTIVE', label: 'Neaktivan' },
    ],
    []
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserMenuOpen(false);
    navigate('/');
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch =
        !searchQuery ||
        team.naziv.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.opis && team.opis.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSport =
        !sportFilter || String(team.sportId) === sportFilter;
      return matchesSearch && matchesSport;
    });
  }, [teams, searchQuery, sportFilter]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="font-semibold text-gray-900 text-base">SportManager</span>
          </div>
          <div className="flex gap-1">
            <Link to="/lige" className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 font-medium">
              Lige
            </Link>
            <span className="px-4 py-2 rounded-lg text-sm text-indigo-700 bg-indigo-50 font-medium">
              Timovi
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition relative"
          >
            <span className="text-sm font-medium text-gray-700">
              {korisnikData?.ime && korisnikData?.prezime 
                ? `${korisnikData.ime} ${korisnikData.prezime}` 
                : korisnikData?.ime || korisnikData?.email || 'Korisnik'}
            </span>
          </button>
          {userMenuOpen && (
            <div className="absolute top-16 right-6 bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[160px] z-40">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 transition font-medium"
              >
                Odjava
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timovi</h1>
            <p className="text-sm text-gray-500 mt-1">Upravljajte i organizujte vaše timove</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Kreiraj tim
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {submissionMessage && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {submissionMessage}
          </div>
        )}
        {!isAuthenticated && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Niste prijavljeni. Pregled timova je dostupan, ali upravljanje zahtijeva prijavu.
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Pretraži timove..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-indigo-400 transition"
            />
          </div>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-indigo-400 transition min-w-[160px]"
          >
            <option value="">Svi sportovi</option>
            {sports.map((sport) => (
              <option key={sport.sportId} value={String(sport.sportId)}>
                {sport.naziv}
              </option>
            ))}
          </select>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">Učitavanje podataka...</div>
        ) : filteredTeams.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">Nema dostupnih timova.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <div
                key={team.timId}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 text-base">{team.naziv}</h3>
                  {isAuthenticated && (
                    <div className="relative group">
                      <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                        </svg>
                      </button>
                      {/* Dropdown */}
                      <div className="absolute right-0 top-7 z-10 hidden group-focus-within:flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[120px]">
                        <button
                          onClick={() => openEditModal(team)}
                          className="px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700"
                        >
                          Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(team)}
                          className="px-4 py-2 text-sm text-left hover:bg-red-50 text-red-600"
                        >
                          Obriši
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                    {team.sport?.naziv || 'Sport nije definisan'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    team.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {team.status === 'ACTIVE' ? 'Aktivan' : 'Neaktivan'}
                  </span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2">{team.opis || 'Nema opisa'}</p>

                {team.league && (
                  <p className="text-xs text-gray-400">
                    <span className="font-medium text-gray-500">Liga:</span> {team.league}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal}>
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {selectedTeam ? 'Uredi tim' : 'Kreiraj novi tim'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Naziv tima <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Naziv je obavezan' })}
              placeholder="npr. Thunder Strikers"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${
                errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-indigo-400'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Sport <span className="text-red-500">*</span>
            </label>
            <select
              {...register('sportId', { required: 'Sport je obavezan' })}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${
                errors.sportId ? 'border-red-400' : 'border-gray-200 focus:border-indigo-400'
              }`}
            >
              <option value="">Izaberite sport</option>
              {sports.map((sport) => (
                <option key={sport.sportId} value={sport.sportId}>
                  {sport.naziv}
                </option>
              ))}
            </select>
            {errors.sportId && <p className="mt-1 text-xs text-red-500">{errors.sportId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Liga (opciono)
            </label>
            <input
              {...register('league')}
              placeholder="npr. Summer Championship 2026"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Opis</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Opcioni opis tima..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {selectedTeam ? 'Sačuvaj promjene' : 'Kreiraj tim'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Timovi;