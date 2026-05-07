import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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

        {/* Naziv i opis — trener može mijenjati */}
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
  const [coaches, setCoaches] = useState([]); // 2. DODANO: State za trenere
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

      // Provjera: ako podaci nisu niz, postavi prazan niz da map() ne pukne
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setSports(Array.isArray(sportsData) ? sportsData : []);
      setCoaches(Array.isArray(coachesData) ? coachesData : []);
    } catch (err) {
      // KLJUČNO: Ne ispisuj cijeli 'err', nego samo poruku
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
      // Priprema podataka za backend (da se poklapaju sa teamController.js)
      const payload = {
        name: data.name,
        sportId: Number(data.sportId),
        description: data.description,
        status: data.status,
        // Backend prima trenerId i dodaje ga u tim (ako imaš tu logiku)
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
      loadData(); // Osvježi listu
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
    <div className="min-h-screen bg-amber-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-amber-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-2xl font-black text-amber-950 lowercase italic tracking-tighter">
            sport<span className="text-orange-600">.ba</span>
          </Link>
          <div className="hidden md:flex gap-4 ml-6">
            <Link to="/lige" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 cursor-pointer text-sm transition-colors">Lige</Link>
            <Link to="/teams" className="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-xl text-sm">Timovi</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold text-sm">
            {korisnikData ? (korisnikData.punoIme?.charAt(0) || korisnikData.ime?.charAt(0) || korisnikData.email?.charAt(0) || '?').toUpperCase() : '?'}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">
            {korisnikData?.ime && korisnikData?.prezime
              ? `${korisnikData.ime} ${korisnikData.prezime}`
              : korisnikData?.punoIme || korisnikData?.ime || korisnikData?.email || 'Gost'}
          </span>
          {korisnikData && (
            <button onClick={handleLogout} className="ml-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">
              Odjava
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-950">Timovi</h1>
            <p className="text-sm text-amber-700 mt-1">Upravljajte i organizujte vaše timove</p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <button onClick={() => navigate('/sports')} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                Upravljaj sportovima
              </button>
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

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Pretraži timove..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-amber-100 rounded-xl text-sm bg-white outline-none focus:border-orange-500 transition"
            />
          </div>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="border border-amber-100 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:border-orange-500 transition min-w-[160px]"
          >
            <option value="">Svi sportovi</option>
            {sports.map((sport) => (
              <option key={sport.sportId} value={String(sport.sportId)}>{sport.naziv}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-20 text-center text-amber-500 text-sm">Učitavanje podataka...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <div key={team.timId} className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-amber-950 text-base">{team.naziv}</h3>
                 {isAdmin && (
                    <div className="relative">
  <button
    onClick={() => setOpenMenuTeamId(openMenuTeamId === team.timId ? null : team.timId)}
    className="p-1 rounded-lg hover:bg-amber-50 text-amber-400"
  >
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
  </button>
  {openMenuTeamId === team.timId && (
    <div className="absolute right-0 top-7 z-10 flex flex-col bg-white border border-amber-100 rounded-xl shadow-lg py-1 min-w-[140px]">
      <button onClick={() => { openEditModal(team); setOpenMenuTeamId(null); }} className="px-4 py-2 text-sm text-left hover:bg-amber-50 text-amber-950">Uredi</button>
      {deleteConfirmTeam?.timId === team.timId ? (
        <div className="px-3 py-2 flex flex-col gap-1 border-t border-amber-50">
          <span className="text-xs text-red-600 font-semibold">Sigurni ste?</span>
          <div className="flex gap-2">
            <button onClick={() => handleDelete(team)} disabled={deletingTeamId === team.timId} className="flex-1 text-xs bg-red-600 text-white rounded-lg py-1 font-bold disabled:opacity-60">
              {deletingTeamId === team.timId ? '...' : 'DA'}
            </button>
            <button onClick={() => { setDeleteConfirmTeam(null); setOpenMenuTeamId(null); }} className="flex-1 text-xs bg-amber-50 text-amber-800 rounded-lg py-1 font-bold">
              NE
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => handleDelete(team)} className="px-4 py-2 text-sm text-left hover:bg-red-50 text-red-600">Obriši</button>
      )}
    </div>
  )}
</div>
                  )}
                  {!isAdmin && team.clanstvaUcesnika?.some(
                    c => c.korisnikId === korisnikData?.korisnikId && c.ulogaUTimu === 'TRENER' && c.status === 'ACTIVE'
                  ) && (
                    <button
                      onClick={() => { setCoachModalTeam(team); setCoachModalOpen(true); }}
                      className="text-xs text-orange-600 font-semibold border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition"
                    >
                      Upravljaj
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">{team.sport?.naziv || 'Sport nije definisan'}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${team.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{team.status === 'ACTIVE' ? 'Aktivan' : 'Neaktivan'}</span>
                </div>
                <p className="text-sm text-amber-700 line-clamp-2">{team.opis || 'Nema opisa'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
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

          {/* 4. POPRAVLJENO: Mapiranje trenera */}
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