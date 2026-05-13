import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../api/authApi';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const korisnik = localStorage.getItem('korisnik') ? JSON.parse(localStorage.getItem('korisnik')) : null;
  const isAuthenticated = Boolean(token);
  const isAdmin = korisnik?.trenutnaUloga === 'ADMINISTRATOR' || korisnik?.uloga === 'ADMINISTRATOR';

  const handleLogout = async () => {
    try {
      if (token) await logoutUser(token);
    } catch (error) {
      console.error("Greška pri odjavi:", error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    navigate('/');
    window.location.reload();
  };

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-xl text-sm transition-colors"
      : "px-4 py-2 text-slate-500 font-medium hover:text-slate-800 cursor-pointer text-sm transition-colors";
  };

  return (
    <nav className="bg-white border-b border-amber-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-2xl font-black text-amber-950 lowercase italic tracking-tighter">
          sport<span className="text-orange-600">.ba</span>
        </Link>
        <div className="hidden md:flex gap-2 ml-6">
          <Link to="/" className={navLinkClass('/')}>Početna</Link>
          <Link to="/lige" className={navLinkClass('/lige')}>Lige</Link>
          <Link to="/teams" className={navLinkClass('/teams')}>Timovi</Link>
          <Link to="/raspored" className={navLinkClass('/raspored')}>Raspored</Link>
          <Link to="/rezultati" className={navLinkClass('/rezultati')}>Rezultati</Link>
          {(isAdmin || korisnik?.trenutnaUloga === 'ORGANIZATOR') && (
            <Link to="/generate-schedule" className={navLinkClass('/generate-schedule')}>Generiši raspored</Link>
          )}
          {isAuthenticated && (
            <Link to="/profile" className={navLinkClass('/profile')}>Profil</Link>
          )}
          {isAdmin && (
            <Link to="/admin/korisnici" className={location.pathname.startsWith('/admin') 
              ? "px-4 py-2 bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors" 
              : "px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-xl text-sm hover:bg-orange-200 transition-colors"}>
              Admin Panel
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold text-sm">
              {korisnik ? (korisnik.punoIme?.charAt(0) || korisnik.email?.charAt(0) || '?').toUpperCase() : '?'}
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">
              {korisnik?.punoIme || korisnik?.email || 'Korisnik'}
            </span>
            <button onClick={handleLogout} className="ml-2 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors">
              Odjava
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 text-slate-600 font-bold hover:text-orange-600 transition-colors text-sm uppercase tracking-widest">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all text-sm uppercase tracking-widest shadow-md shadow-orange-600/20 active:scale-95">
              Registracija
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
