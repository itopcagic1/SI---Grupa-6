import { useEffect, useMemo, useState } from 'react';

import { useForm } from 'react-hook-form';

import { Link, useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';

import {
  fetchTeams,
  fetchSports,
  fetchCoaches,
  fetchPlayers,
  addPlayerToTeam,
  removePlayerFromTeam,
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



function CoachModal({ isOpen, onClose, team, onRefresh }) {
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [naziv, setNaziv] = useState('');
  const [opis, setOpis] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);

  useEffect(() => {
    if (isOpen && team) {
      fetchPlayers().then(d => setAllPlayers(Array.isArray(d) ? d : [])).catch(() => setAllPlayers([]));
      setMsg(''); setErr(''); setSelectedPlayerId('');
      setNaziv(team.naziv || '');
      setOpis(team.opis || '');
    }
  }, [isOpen, team]);

  if (!isOpen || !team) return null;

  const currentPlayers = (team.clanstvaUcesnika || []).filter(
    c => c.ulogaUTimu === 'IGRAC' && c.status === 'ACTIVE'
  );
  const availablePlayers = allPlayers.filter(
    p => !currentPlayers.some(cp => cp.korisnikId === p.id)
  );

  const handleSaveInfo = async () => {
    if (!naziv.trim()) { setErr('Naziv ne može biti prazan.'); return; }
    setErr(''); setMsg(''); setSavingInfo(true);
    try {
      await updateTeam(team.timId, { name: naziv, description: opis, status: team.status });
      setMsg('Podaci tima uspješno sačuvani.');
      onRefresh();
    } catch (e) {
      setErr(e.response?.data?.message || 'Greška pri ažuriranju tima.');
    } finally { setSavingInfo(false); }
  };

  const handleAdd = async () => {
    if (!selectedPlayerId) return;
    setErr(''); setMsg(''); setLoading(true);
    try {
      await addPlayerToTeam(team.timId, Number(selectedPlayerId));
      setMsg('Igrač uspješno dodan!');
      setSelectedPlayerId('');
      onRefresh();
    } catch (e) {
      setErr(e.response?.data?.message || 'Greška pri dodavanju.');
    } finally { setLoading(false); }
  };

  const handleRemove = async (playerId) => {
    setErr(''); setMsg(''); setLoading(true);
    try {
      await removePlayerFromTeam(team.timId, playerId);
      setMsg('Igrač uklonjen iz tima.');
      onRefresh();
    } catch (e) {
      setErr(e.response?.data?.message || 'Greška pri uklanjanju.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-amber-50 text-amber-400 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-xl font-bold text-amber-950 mb-1">Uredi tim</h2>
        <p className="text-sm text-amber-700 mb-5">{team.sport?.naziv || '—'} · {team.status === 'ACTIVE' ? 'Aktivan' : 'Neaktivan'}</p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Naziv tima</label>
            <input value={naziv} onChange={e => setNaziv(e.target.value)} className="w-full border border-amber-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Opis</label>
            <textarea value={opis} onChange={e => setOpis(e.target.value)} rows={3} className="w-full border border-amber-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition resize-none" />
          </div>
          <button onClick={handleSaveInfo} disabled={savingInfo} className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50 transition">
            {savingInfo ? 'Čuvanje...' : 'Sačuvaj izmjene'}
          </button>
        </div>

        <hr className="border-amber-100 mb-4" />

        {msg && <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">{msg}</div>}
        {err && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{err}</div>}

        <h3 className="text-sm font-semibold text-amber-900 mb-2">Igrači u timu</h3>
        {currentPlayers.length === 0
          ? <p className="text-sm text-amber-500 mb-4 italic">Nema igrača u timu.</p>
          : <ul className="mb-4 space-y-2">
            {currentPlayers.map(c => (
              <li key={c.korisnikId} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-2.5">
                <span className="text-sm text-amber-950 font-medium">{c.korisnik?.punoIme || `Igrač #${c.korisnikId}`}</span>
                <button onClick={() => handleRemove(c.korisnikId)} disabled={loading} className="text-xs text-red-600 hover:text-red-700 font-semibold disabled:opacity-50 transition">Ukloni</button>
              </li>
            ))}
          </ul>
        }

        <h3 className="text-sm font-semibold text-amber-900 mb-2">Dodaj igrača</h3>
        <div className="flex gap-2">
          <select value={selectedPlayerId} onChange={e => setSelectedPlayerId(e.target.value)} className="flex-1 border border-amber-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-500 transition">
            <option value="">Izaberite igrača...</option>
            {availablePlayers.map(p => <option key={p.id} value={p.id}>{p.ime}</option>)}
          </select>
          <button onClick={handleAdd} disabled={!selectedPlayerId || loading} className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50 transition">
            {loading ? '...' : 'Dodaj'}
          </button>
        </div>
      </div>
    </div>
  );
}



function Timovi() {
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState(null);
  const [deletingTeamId, setDeletingTeamId] = useState(null);
  const [openMenuTeamId, setOpenMenuTeamId] = useState(null);
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [coachModalTeam, setCoachModalTeam] = useState(null);
  const token = localStorage.getItem('token');
  const korisnikData = localStorage.getItem('korisnik') ? JSON.parse(localStorage.getItem('korisnik')) : null;
  const isAuthenticated = Boolean(token);

  const isAdmin = korisnikData?.trenutnaUloga === 'ADMINISTRATOR' || korisnikData?.trenutnaUloga === 'ADMIN';
  const isTrainer = korisnikData?.trenutnaUloga === 'TRENER';
  const isAdminOrTrainer = isAdmin || isTrainer;

  const navigate = useNavigate();

  const getInitials = (ime, prezime) => {
    return ((ime?.[0] || '') + (prezime?.[0] || '')).toUpperCase();
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      sportId: '',
      trenerId: '',
      description: '',
      status: 'ACTIVE',
      league: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [teamsData, sportsData, coachesData] = await Promise.all([
        fetchTeams(),
        fetchSports(),
        fetchCoaches()
      ]);

      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setCoaches(Array.isArray(coachesData) ? coachesData : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Došlo je do greške pri učitavanju.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setSelectedTeam(null);
    reset({ name: '', sportId: '', trenerId: '', description: '', status: 'ACTIVE', league: '' });
    setSubmissionMessage('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    reset({
      name: team.naziv,
      sportId: String(team.sportId),
      trenerId: team.trenerId ? String(team.trenerId) : '',
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
      setError('Morate biti prijavljeni.');
      return;
    }

    try {
      const payload = {
        name: data.name,
        sportId: Number(data.sportId),
        description: data.description,
        status: data.status,
        trenerId: data.trenerId ? Number(data.trenerId) : null,
      };

      if (selectedTeam) {
        await updateTeam(selectedTeam.timId, payload);
        setSubmissionMessage('Tim uspješno ažuriran.');
      } else {
        await createTeam(payload);
        setSubmissionMessage('Tim uspješno kreiran.');
      }

      closeModal();
      loadData();
    } catch (err) {
      const message = err.response?.data?.message || 'Greška pri spremanju tima.';
      setError(message);
    }
  };

  const handleDelete = async (team) => {
    if (!isAuthenticated) {
      setError('Morate biti prijavljeni da biste obrisali tim.');
      return;
    }
    if (deleteConfirmTeam?.timId !== team.timId) {
      setDeleteConfirmTeam(team);
      return;
    }
    setError('');
    try {
      setDeletingTeamId(team.timId);
      await deleteTeam(team.timId);
      setSubmissionMessage(`Tim "${team.naziv}" je obrisan.`);
      setTeams(prev => prev.filter(t => t.timId !== team.timId));
      setDeleteConfirmTeam(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Greška pri brisanju tima.';
      setError(message);
    } finally {
      setDeletingTeamId(null);
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
    <div className="min-h-screen bg-amber-50 font-sans">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Timovi</h1>
            <p className="text-slate-500 mt-2 text-lg">Sportski timovi</p>
          </div>

          {isAdminOrTrainer && (
            <div className="flex gap-3">
              {isAdmin && (
                <button onClick={() => navigate('/sports')} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                  Upravljaj sportovima
                </button>
              )}

              <button onClick={openCreateModal} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Kreiraj tim
              </button>
            </div>
          )}
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {submissionMessage && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{submissionMessage}</div>}

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pretraži timove..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
            />
          </div>

          {/* Sport filter pills */}
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setSportFilter('')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${sportFilter === '' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-50'}`}
            >
              Svi
            </button>
            {sports.map((sport) => (
              <button
                key={sport.sportId}
                onClick={() => setSportFilter(String(sport.sportId))}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${sportFilter === String(sport.sportId) ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-50'}`}
              >
                {sport.naziv}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">Učitavanje timova...</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">Nije pronađen nijedan tim.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <div
                key={team.timId}
                className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors leading-snug pr-2">
                    {team.naziv}
                  </h3>

                  {/* Admin menu */}
                  {isAdmin && (
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setOpenMenuTeamId(openMenuTeamId === team.timId ? null : team.timId)}
                        className="p-2 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                        </svg>
                      </button>
                      {openMenuTeamId === team.timId && (
                        <div className="absolute right-0 top-9 z-10 flex flex-col bg-white border border-amber-100 rounded-2xl shadow-lg py-1 min-w-[150px]">
                          <button
                            onClick={() => { openEditModal(team); setOpenMenuTeamId(null); }}
                            className="px-4 py-2.5 text-sm text-left hover:bg-amber-50 text-slate-700 font-semibold rounded-t-2xl transition-colors"
                          >
                            Uredi
                          </button>
                          {deleteConfirmTeam?.timId === team.timId ? (
                            <div className="px-3 py-2 flex flex-col gap-1 border-t border-amber-50">
                              <span className="text-xs text-red-600 font-bold uppercase tracking-wider">Sigurni ste?</span>
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleDelete(team)}
                                  disabled={deletingTeamId === team.timId}
                                  className="flex-1 text-xs bg-red-600 text-white rounded-xl py-1.5 font-bold disabled:opacity-60 transition-colors"
                                >
                                  {deletingTeamId === team.timId ? '...' : 'DA'}
                                </button>
                                <button
                                  onClick={() => { setDeleteConfirmTeam(null); setOpenMenuTeamId(null); }}
                                  className="flex-1 text-xs bg-amber-50 text-amber-800 rounded-xl py-1.5 font-bold transition-colors"
                                >
                                  NE
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(team)}
                              className="px-4 py-2.5 text-sm text-left hover:bg-red-50 text-red-600 font-semibold rounded-b-2xl transition-colors"
                            >
                              Obriši
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trainer manage button */}
                  {!isAdmin && team.clanstvaUcesnika?.some(
                    c => c.korisnikId === korisnikData?.korisnikId && c.ulogaUTimu === 'TRENER' && c.status === 'ACTIVE'
                  ) && (
                    <button
                      onClick={() => { setCoachModalTeam(team); setCoachModalOpen(true); }}
                      className="flex-shrink-0 text-xs text-orange-600 font-bold border border-orange-200 rounded-xl px-3 py-1.5 hover:bg-orange-50 transition-colors uppercase tracking-wider"
                    >
                      Upravljaj
                    </button>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest rounded-lg border border-amber-100">
                    {team.sport?.naziv || 'Sport nije definisan'}
                  </span>
                  <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg ${
                    team.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {team.status === 'ACTIVE' ? 'Aktivan' : 'Neaktivan'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 font-medium line-clamp-2 flex-1">
                  {team.opis || 'Nema opisa'}
                </p>

                {/* Coach and Player count */}
<div className="mt-4 pt-4 border-t border-amber-50 flex items-center gap-3">
  {/* Trener - Suptilni prikaz */}
  {team.clanstvaUcesnika?.some(c => c.ulogaUTimu === 'TRENER' && c.status === 'ACTIVE') && (
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        Trener: {team.clanstvaUcesnika.find(c => c.ulogaUTimu === 'TRENER' && c.status === 'ACTIVE')?.korisnik?.punoIme || 'Nije dodijeljen'}
      </span>
    </div>
  )}

  {/* Separator | - prikazuje se samo ako imamo i trenera i igrače */}
  {team.clanstvaUcesnika?.some(c => c.ulogaUTimu === 'TRENER' && c.status === 'ACTIVE') && (
    <span className="text-amber-200 font-light">|</span>
  )}

  {/* Broj igrača */}
  {team.clanstvaUcesnika && (
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {team.clanstvaUcesnika.filter(c => c.ulogaUTimu === 'IGRAC' && c.status === 'ACTIVE').length} igrača
      </span>
    </div>
  )}
</div>

                
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-amber-50 text-amber-400 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-xl font-bold text-amber-950 mb-6">{selectedTeam ? 'Uredi tim' : 'Kreiraj novi tim'}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Naziv tima <span className="text-red-500">*</span></label>
            <input {...register('name', { required: 'Naziv je obavezan' })} className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${errors.name ? 'border-red-400' : 'border-amber-100 focus:border-orange-500'}`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Sport <span className="text-red-500">*</span></label>
            <select {...register('sportId', { required: 'Sport je obavezan' })} className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition ${errors.sportId ? 'border-red-400' : 'border-amber-100 focus:border-orange-500'}`}>
              <option value="">Izaberite sport</option>
              {sports.map((sport) => (<option key={sport.sportId} value={sport.sportId}>{sport.naziv}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Trener tima</label>
            <select
              {...register('trenerId')}
              className="w-full border border-amber-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition"
            >
              <option value="">Izaberite trenera</option>
              {coaches.map((trener) => (
                <option key={trener.id} value={trener.id}>
                  {trener.ime}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Status</label>
            <select {...register('status')} className="w-full border border-amber-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition">
              {statusOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1.5">Opis</label>
            <textarea {...register('description')} rows={4} className="w-full border border-amber-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 border border-amber-100 rounded-xl py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-50">Odustani</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60">{selectedTeam ? 'Sačuvaj' : 'Kreiraj'}</button>
          </div>
        </form>
      </Modal>

      <CoachModal
        isOpen={coachModalOpen}
        onClose={() => { setCoachModalOpen(false); setCoachModalTeam(null); }}
        team={coachModalTeam}
        onRefresh={loadData}
      />
    </div>
  );
}

export default Timovi;