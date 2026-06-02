import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../api/authApi';
import { getNeprocitaneCount } from '../api/notifikacijaApi'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const korisnik = localStorage.getItem('korisnik')
    ? JSON.parse(localStorage.getItem('korisnik'))
    : null;

  const isAuthenticated = Boolean(token);

  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin =
    korisnik?.trenutnaUloga === 'ADMINISTRATOR' ||
    korisnik?.uloga === 'ADMINISTRATOR';

  const isTrainer =
    korisnik?.trenutnaUloga === 'TRENER' ||
    korisnik?.uloga === 'TRENER';

  const isPlayer =
    korisnik?.trenutnaUloga === 'IGRAC' ||
    korisnik?.uloga === 'IGRAC';

  const isOwner =
    korisnik?.trenutnaUloga === 'VLASNIK' ||
    korisnik?.uloga === 'VLASNIK';

  const isNavijac =
    korisnik?.trenutnaUloga === 'NAVIJAC' ||
    korisnik?.uloga === 'NAVIJAC';

  useEffect(() => {
    const fetchCount = async () => {
      if (!isAuthenticated || !isNavijac) return;
      try {
        const data = await getNeprocitaneCount();
        setUnreadCount(data.count || 0);
      } catch (err) {
        console.error('Greška pri dohvatanju broja obavijesti:', err);
      }
    };

    fetchCount();
    // Osvježi stanje svakih 30 sekundi ili pri promjeni rute
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [location.pathname, isAuthenticated, isNavijac]);

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
        <Link
          to="/"
          className="text-2xl font-black text-amber-950 lowercase italic tracking-tighter"
        >
          sport<span className="text-orange-600">.ba</span>
        </Link>

        <div className="hidden md:flex gap-2 ml-6">
          <Link to="/" className={navLinkClass('/')}>
            Početna
          </Link>

          <Link to="/lige" className={navLinkClass('/lige')}>
            Lige
          </Link>

          <Link to="/teams" className={navLinkClass('/teams')}>
            Timovi
          </Link>

          <Link to="/raspored" className={navLinkClass('/raspored')}>
            Raspored
          </Link>

          <Link to="/rezultati" className={navLinkClass('/rezultati')}>
            Rezultati
          </Link>

          {(isAdmin || korisnik?.trenutnaUloga === 'ORGANIZATOR') && (
            <Link
              to="/generate-schedule"
              className={navLinkClass('/generate-schedule')}
            >
              Generiši raspored
            </Link>
          )}

          {isTrainer && (
            <>
              <Link
                to="/prijava-ekipe"
                className={navLinkClass('/prijava-ekipe')}
              >
                Prijavi ekipu
              </Link>

              <Link
                to="/moje-prijave"
                className={navLinkClass('/moje-prijave')}
              >
                Moje prijave
              </Link>

              <Link
                to="/rezervacije/grupne/trener"
                className={navLinkClass('/rezervacije/grupne/trener')}
              >
                Grupni treninzi (Trener)
              </Link>
            </>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated && (isOwner || isAdmin) && (
              <>
                <Link to="/objekti" className={navLinkClass('/objekti')}>
                  Sportski Objekti
                </Link>

                <Link to="/vlasnik/rezervacije" className={navLinkClass('/vlasnik/rezervacije')}>
                  Monitoring Rezervacija
                </Link>
              </>
            )}
          </div>

          {/* DODANO: Link za Notifikacije u glavnom meniju za prijavljene navijače */}
          {isAuthenticated && isNavijac && (
            <Link to="/notifikacije" className={navLinkClass('/notifikacije')}>
              Obavijesti
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/profile" className={navLinkClass('/profile')}>
              Profil
            </Link>
          )}

          {isPlayer && (
            <>
              <Link to="/player" className={navLinkClass('/player')}>
                Moji treninzi
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin/korisnici"
              className={
                location.pathname.startsWith('/admin')
                  ? "px-4 py-2 bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors"
                  : "px-4 py-2 text-slate-500 font-medium hover:text-slate-800 cursor-pointer text-sm transition-colors"
              }
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {/* DODANO: Ikona zvončića sa crvenim badge-om za broj nepročitanih obavijesti */}
            {isNavijac && (
              <Link
                to="/notifikacije"
                className="relative p-2 text-slate-500 hover:text-orange-600 transition-colors mr-2"
                title="Obavijesti"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-red-600 rounded-full border-2 border-white transform translate-x-1/2 -translate-y-1/2">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

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