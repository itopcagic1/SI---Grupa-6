import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { getMyWaitlistTerms, leaveWaitlist } from '../api/reservationApi';
import { getOmiljeniTimovi, removeOmiljeniTim } from '../api/omiljeniTimApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('bs-BA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordData, setPasswordData] = useState({
        trenutnaLozinka: '',
        novaLozinka: '',
        potvrda: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [waitlistItems, setWaitlistItems] = useState([]);
    const [waitlistLoading, setWaitlistLoading] = useState(false);
    const [removingWaitlistId, setRemovingWaitlistId] = useState(null);

    const [favoriteTeams, setFavoriteTeams] = useState([]);
    const korisnikData = localStorage.getItem('korisnik') ? JSON.parse(localStorage.getItem('korisnik')) : null;
    const isPlayer = korisnikData?.trenutnaUloga === 'IGRAC' || korisnikData?.uloga === 'IGRAC';
    const isNavijac = korisnikData?.trenutnaUloga === 'NAVIJAC' || korisnikData?.uloga === 'NAVIJAC';

    // WebSocket za osluškivanje oslobađanja termina u real-time-u
    useEffect(() => {
        const socketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
        const ws = new WebSocket(socketUrl);

        ws.onopen = () => {
            console.log('🔗 Povezan na WebSocket za listu čekanja.');
            const token = localStorage.getItem('token');
            if (token) {
                ws.send(JSON.stringify({ type: 'auth', token }));
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.event === 'termin-oslobodjen' || data.type === 'termin-oslobodjen') {
                    const oslobodjeniTerminId = data.terminId || data.payload?.terminId;
                    
                    // Ažuriramo status termina unutar niza stavki
                    setWaitlistItems((currentItems) => 
                        currentItems.map((item) => {
                            if (item.termin.terminId === oslobodjeniTerminId) {
                                return {
                                    ...item,
                                    termin: { ...item.termin, status: 'SLOBODAN' }
                                };
                            }
                            return item;
                        })
                    );
                    
                    setMessage({ 
                        type: 'success', 
                        text: data.poruka || 'Jedan od vaših termina sa liste čekanja je upravo OSLOBOĐEN! Požurite i rezervišite!' 
                    });
                }
            } catch (err) {
                console.error("Greška pri obradi WS poruke:", err);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const fetchFavorites = async () => {
        try {
            const data = await getOmiljeniTimovi();
            setFavoriteTeams(Array.isArray(data) ? data : []);
        } catch {
            console.error('Greška pri učitavanju omiljenih timova');
        }
    };

    const handleUnfavorite = async (timId) => {
        try {
            await removeOmiljeniTim(timId);
            setFavoriteTeams((current) => current.filter((item) => item.timId !== timId));
            setMessage({ type: 'success', text: 'Tim uspješno uklonjen iz omiljenih.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Greška pri uklanjanju iz omiljenih.' });
        }
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data.korisnik);
        } catch {
            setMessage({ type: 'error', text: 'Greška pri učitavanju profila' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.novaLozinka !== passwordData.potvrda) {
            setMessage({ type: 'error', text: 'Lozinke se ne podudaraju!' });
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/auth/change-password`, passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Lozinka uspješno promijenjena!' });
            setPasswordData({ trenutnaLozinka: '', novaLozinka: '', potvrda: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.poruka || 'Greška' });
        }
    };

    const fetchWaitlist = async () => {
        setWaitlistLoading(true);
        try {
            const data = await getMyWaitlistTerms();
            setWaitlistItems(Array.isArray(data.stavke) ? data.stavke : []);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.poruka || 'Greška pri učitavanju liste čekanja.' });
        } finally {
            setWaitlistLoading(false);
        }
    };

    const handleLeaveWaitlist = async (terminId) => {
        setRemovingWaitlistId(terminId);
        try {
            await leaveWaitlist(terminId);
            setWaitlistItems((current) => current.filter((item) => item.termin.terminId !== terminId));
            setMessage({ type: 'success', text: 'Uklonjeni ste sa liste čekanja.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.poruka || 'Uklanjanje sa liste čekanja nije uspjelo.' });
        } finally {
            setRemovingWaitlistId(null);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchProfile();
        if (isPlayer) fetchWaitlist();
        if (isNavijac) fetchFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-amber-500 font-medium">Učitavanje podataka...</div>;
    }

    return (
        <div className="min-h-screen bg-amber-50 font-sans">

            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Moj Profil</h1>
                    <p className="text-slate-500 mt-2 text-lg">Upravljajte svojim ličnim podacima i sigurnošću</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div className="md:col-span-1 space-y-6">
                        {!user && <div className="text-center py-8 text-red-500 text-sm">Korisnik nije pronađen.</div>}
                        <div className="bg-white rounded-3xl border border-amber-100 p-8 shadow-sm text-center">
                            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 border-4 border-white shadow-inner">
                                {user?.punoIme?.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-amber-950 mb-1">{user?.punoIme}</h2>
                            <p className="text-sm text-amber-600 font-medium mb-4">{user?.email}</p>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100 uppercase tracking-widest">
                                {user?.uloga}
                            </div>

                            <div className="mt-8 pt-6 border-t border-amber-50 text-left space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-amber-400 tracking-widest mb-1">Status računa</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-bold text-slate-700">{user?.statusPouzdanosti || 'AKTIVAN'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
                            <h3 className="text-sm font-black uppercase text-amber-950 mb-4 tracking-tighter">Aktivni angažmani</h3>
                            <div className="space-y-3">
                                {user?.clanstvaUTimovima && user?.clanstvaUTimovima.length > 0 ? (
                                    user?.clanstvaUTimovima?.map((clanstvo) => (
                                        <div key={clanstvo.clanstvoTimaId} className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 flex items-center gap-3">
                                           
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">
                                                    {clanstvo.ulogaUTimu || user?.uloga}
                                                </span>
                                                <span className="text-sm font-bold text-amber-900">
                                                    {clanstvo.tim.naziv}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-amber-400 italic">Trenutno nema aktivnih angažmana.</p>
                                        {user?.uloga === 'NAVIJAC' && (
                                            <p className="text-[10px] text-slate-400 mt-1">Zapratite neki tim da biste vidjeli novosti!</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isNavijac && (
                            <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
                                <h3 className="text-sm font-black uppercase text-amber-950 mb-4 tracking-tighter">Moji omiljeni timovi</h3>
                                <div className="space-y-3">
                                    {favoriteTeams.length > 0 ? (
                                        favoriteTeams.map((fav) => (
                                            <div key={fav.omiljeniTimId} className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 flex items-center justify-between gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">
                                                        {fav.tim?.sport?.naziv || 'Sport'}
                                                    </span>
                                                    <span className="text-sm font-bold text-amber-900">
                                                        {fav.tim?.naziv}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleUnfavorite(fav.timId)}
                                                    className="text-xs text-red-600 hover:text-red-700 font-semibold transition"
                                                    aria-label="Ukloni iz omiljenih"
                                                >
                                                    Ukloni
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-xs text-amber-400 italic">Nemate omiljenih timova.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white rounded-3xl border border-amber-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-amber-950">Promjena lozinke</h3>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-5" noValidate>
                                <div>
                                    <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">Trenutna lozinka</label>
                                    <input
                                        type="password"
                                        className="w-full border border-amber-100 rounded-2xl px-5 py-3.5 text-sm bg-amber-50/30 outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
                                        placeholder="Unesite trenutnu lozinku"
                                        value={passwordData.trenutnaLozinka}
                                        onChange={(e) => setPasswordData({ ...passwordData, trenutnaLozinka: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">Nova lozinka</label>
                                        <input
                                            type="password"
                                            className="w-full border border-amber-100 rounded-2xl px-5 py-3.5 text-sm bg-amber-50/30 outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
                                            placeholder="Nova lozinka"
                                            value={passwordData.novaLozinka}
                                            onChange={(e) => setPasswordData({ ...passwordData, novaLozinka: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">Potvrda lozinke</label>
                                        <input
                                            type="password"
                                            className="w-full border border-amber-100 rounded-2xl px-5 py-3.5 text-sm bg-amber-50/30 outline-none focus:border-orange-500 focus:bg-white transition-all shadow-sm"
                                            placeholder="Potvrdite lozinku"
                                            value={passwordData.potvrda}
                                            onChange={(e) => setPasswordData({ ...passwordData, potvrda: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98]"
                                    >
                                        Ažuriraj lozinku
                                    </button>
                                </div>
                            </form>

                            {message.text && (
                                <div className={`mt-6 p-4 rounded-2xl border text-sm font-bold text-center ${message.type === 'error'
                                    ? 'bg-red-50 border-red-100 text-red-600'
                                    : 'bg-green-50 border-green-100 text-green-600'
                                    }`}>
                                    {message.text}
                                </div>
                            )}
                        </div>

                        {isPlayer && (
                        <div className="mt-8 bg-white rounded-3xl border border-amber-100 p-8 shadow-sm">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-amber-950">Termini na kojima čekam</h3>
                                    <p className="text-sm text-slate-500 mt-1">Aktivne prijave na liste čekanja.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={fetchWaitlist}
                                    disabled={waitlistLoading}
                                    className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
                                >
                                    Osvježi
                                </button>
                            </div>

                            {waitlistLoading ? (
                                <div className="rounded-2xl border border-dashed border-amber-100 p-5 text-center text-sm font-semibold text-amber-500">
                                    Učitavanje liste čekanja...
                                </div>
                            ) : waitlistItems.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-amber-100 p-5 text-center text-sm font-semibold text-slate-400">
                                    Trenutno niste na listi čekanja ni za jedan termin.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {waitlistItems.map((item) => {
                                        const isSlobodan = item.termin?.status === 'SLOBODAN';
                                        
                                        return (
                                            <div 
                                                key={item.stavkaId} 
                                                className={`rounded-2xl border p-4 transition-all duration-300 ${
                                                    isSlobodan 
                                                        ? 'border-green-200 bg-green-50/70 animate-pulse shadow-sm shadow-green-100' 
                                                        : 'border-amber-100 bg-amber-50/50'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <div className="text-sm font-black text-slate-800">
                                                                {formatDateTime(item.termin?.vrijemePocetka)}
                                                            </div>
                                                            {isSlobodan && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-800 uppercase tracking-wider border border-green-200">
                                                                    🔥 Slobodan 
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 text-xs font-semibold text-slate-500">
                                                            {item.termin?.sportskiObjekat?.naziv || 'Sportski objekat'}
                                                            {item.termin?.sportskiObjekat?.adresa ? `, ${item.termin.sportskiObjekat.adresa}` : ''}
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-3">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                                                                Redni broj: {item.redniBroj}
                                                            </span>
                                                            {isSlobodan && (
                                                                <span className="text-xs font-black text-green-700">
                                                                    ⚡ Požurite i rezervišite!
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLeaveWaitlist(item.termin?.terminId)}
                                                        disabled={removingWaitlistId === item.termin?.terminId}
                                                        className="h-10 w-10 shrink-0 rounded-full border border-red-100 bg-white text-sm font-black text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                                        aria-label="Ukloni sa liste čekanja"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;