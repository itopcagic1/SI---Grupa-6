import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordData, setPasswordData] = useState({
        trenutnaLozinka: '',
        novaLozinka: '',
        potvrda: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();
    const korisnikData = localStorage.getItem('korisnik') ? JSON.parse(localStorage.getItem('korisnik')) : null;
    const isAdmin = korisnikData?.trenutnaUloga === 'ADMINISTRATOR' || korisnikData?.trenutnaUloga === 'ADMIN';
    const isTrainer = korisnikData?.trenutnaUloga === 'TRENER';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data.korisnik);
        } catch (err) {
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
            await axios.patch('http://localhost:3000/api/auth/change-password', passwordData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Lozinka uspješno promijenjena!' });
            setPasswordData({ trenutnaLozinka: '', novaLozinka: '', potvrda: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.poruka || 'Greška' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('korisnik');
        navigate('/');
    };

    if (loading) {
        return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-amber-500 font-medium">Učitavanje podataka...</div>;
    }

    if (!user) {
        return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-red-500">Korisnik nije pronađen.</div>;
    }

    return (
        <div className="min-h-screen bg-amber-50 font-sans">

            <nav className="bg-white border-b border-amber-100 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <Link to="/dashboard" className="text-2xl font-black text-amber-950 lowercase italic tracking-tighter">
                        sport<span className="text-orange-600">.ba</span>
                    </Link>
                    <div className="hidden md:flex gap-4 ml-6">
                        <Link to="/lige" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 text-sm transition-colors">Lige</Link>
                        <Link to="/teams" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 text-sm transition-colors">Timovi</Link>
                        {isTrainer && (
                            <Link to="/moje-prijave" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 text-sm transition-colors">
                                Moje prijave
                            </Link>
                        )}
                        <Link to="/profile" className="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-xl text-sm">
                            Profil
                        </Link>
                        {isAdmin && (
                            <Link to="/admin/korisnici" className="px-4 py-2 text-slate-500 font-medium hover:text-slate-800 text-sm transition-colors">Admin Panel</Link>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold text-sm">
                        {user.punoIme?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user.punoIme}</span>
                    <button onClick={handleLogout} className="ml-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">
                        Odjava
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Moj Profil</h1>
                    <p className="text-slate-500 mt-2 text-lg">Upravljajte svojim ličnim podacima i sigurnošću</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl border border-amber-100 p-8 shadow-sm text-center">
                            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 border-4 border-white shadow-inner">
                                {user.punoIme?.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-amber-950 mb-1">{user.punoIme}</h2>
                            <p className="text-sm text-amber-600 font-medium mb-4">{user.email}</p>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100 uppercase tracking-widest">
                                {user.uloga}
                            </div>

                            <div className="mt-8 pt-6 border-t border-amber-50 text-left space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-amber-400 tracking-widest mb-1">Status računa</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-bold text-slate-700">{user.statusPouzdanosti || 'AKTIVAN'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm">
                            <h3 className="text-sm font-black uppercase text-amber-950 mb-4 tracking-tighter">Aktivni angažmani</h3>
                            <div className="space-y-3">
                                {user.clanstvaUTimovima && user.clanstvaUTimovima.length > 0 ? (
                                    user.clanstvaUTimovima.map((clanstvo) => (
                                        <div key={clanstvo.clanstvoTimaId} className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100 flex items-center gap-3">
                                           
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">
                                                    {clanstvo.ulogaUTimu || user.uloga}
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
                                        {user.uloga === 'NAVIJAC' && (
                                            <p className="text-[10px] text-slate-400 mt-1">Zapratite neki tim da biste vidjeli novosti!</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
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

                            <form onSubmit={handlePasswordChange} className="space-y-5">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
