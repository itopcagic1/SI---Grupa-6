import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const API_URL = 'https://si-grupa-6.onrender.com' || 'http://localhost:3000';
// SVG Ikone za UI
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

const Homepage = () => {
  const [data, setData] = useState({
    nadolazeceUtakmice: [],
    aktivneLige: [],
    najnovijiRezultati: []
  });
  const [loading, setLoading] = useState(true);

  // Provjera da li je korisnik prijavljen
  const token = localStorage.getItem('token');
  const korisnik = localStorage.getItem('korisnik') ? JSON.parse(localStorage.getItem('korisnik')) : null;
  const isAuthenticated = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    window.location.reload(); // Osveži stranicu da se vrate login dugmići
  };

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/homepage`);
        if (response.data && response.data.uspjeh) {
          setData(response.data.podaci);
        }
      } catch (error) {
        console.error("Greška pri dohvatanju podataka:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('bs-BA', options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('bs-BA', options);
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section 
        className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden bg-cover bg-center bg-no-repeat shadow-inner" 
        style={{ backgroundImage: "url('/hero_stadium_bg.png')" }}
      >
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[3px] z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/50 rounded-full blur-3xl z-0 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-200/40 rounded-full blur-3xl z-0 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-4xl z-10">
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight mb-6 leading-tight">
            SVE LIGE.<br />
            SVE UTAKMICE.<br />
            <span className="text-orange-600">NA JEDNOM MJESTU.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
            Prati rasporede, rezultate i tabele liga. Brzo, jednostavno i dostupno svima. Nema potrebe za računom da biste ostali u toku!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#raspored" className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 active:scale-95 flex items-center justify-center gap-2">
              <CalendarIcon /> Pogledaj raspored
            </a>
            <Link to="/lige" className="px-8 py-4 bg-white text-slate-700 border-2 border-amber-200 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">
              <TrophyIcon /> Pogledaj lige
            </Link>
            <Link to="/teams" className="px-8 py-4 bg-white text-slate-700 border-2 border-amber-200 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-amber-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">
              <UsersIcon /> Pogledaj timove
            </Link>
          </div>
        </div>
      </section>

      {/* Nadolazeće utakmice */}
      <section id="raspored" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-10 border-b-2 border-amber-100 pb-4">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <span className="text-orange-600"><CalendarIcon /></span> NADOLAZEĆE UTAKMICE
          </h2>
          <Link to="/raspored" className="text-orange-600 font-bold hover:underline text-sm uppercase tracking-wider hidden sm:block">
            POGLEDAJ VIŠE &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
             <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.nadolazeceUtakmice.length > 0 ? (
              data.nadolazeceUtakmice.map((utakmica) => (
                <div key={utakmica.utakmicaId} className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="text-center text-xs font-black uppercase tracking-widest text-orange-600 mb-6 bg-orange-50 inline-block px-3 py-1 rounded-lg w-full">
                    {utakmica.takmicenje.naziv}
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col items-center gap-3 w-2/5">
                      <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-xl font-black text-slate-400 overflow-hidden shadow-sm">
                        {utakmica.domaciTim.logoUrl ? <img src={utakmica.domaciTim.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : utakmica.domaciTim.naziv.substring(0, 2)}
                      </div>
                      <div className="font-bold text-sm text-center text-slate-700">{utakmica.domaciTim.naziv}</div>
                    </div>
                    <div className="text-2xl font-black text-slate-300">VS</div>
                    <div className="flex flex-col items-center gap-3 w-2/5">
                      <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-xl font-black text-slate-400 overflow-hidden shadow-sm">
                        {utakmica.gostujuciTim.logoUrl ? <img src={utakmica.gostujuciTim.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : utakmica.gostujuciTim.naziv.substring(0, 2)}
                      </div>
                      <div className="font-bold text-sm text-center text-slate-700">{utakmica.gostujuciTim.naziv}</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <div className="font-bold text-slate-800 mb-1">{formatDate(utakmica.vrijemePocetka)} | {formatTime(utakmica.vrijemePocetka)}</div>
                    <div className="text-sm font-medium text-slate-500 flex items-center justify-center gap-1">
                      <MapPinIcon /> Sportski objekat
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-[32px] border border-amber-100 shadow-sm">
                <p className="text-slate-500 text-lg font-medium">Trenutno nema nadolazećih utakmica.</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 text-center sm:hidden">
            <Link to="/raspored" className="text-orange-600 font-bold hover:underline text-sm uppercase tracking-wider">
              POGLEDAJ VIŠE &rarr;
            </Link>
        </div>
      </section>

      {/* Aktivne Lige */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-10 border-b-2 border-amber-100 pb-4">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <span className="text-orange-600"><TrophyIcon /></span> AKTIVNE LIGE
          </h2>
          <Link to="/lige" className="text-orange-600 font-bold hover:underline text-sm uppercase tracking-wider hidden sm:block">
            Pogledaj sve lige &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
             <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.aktivneLige.length > 0 ? (
              data.aktivneLige.map((liga) => (
                <div key={liga.takmicenjeId} className="bg-white rounded-[32px] border border-amber-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center group">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <TrophyIcon />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">{liga.naziv}</h3>
                  <div className="text-slate-500 font-medium mb-8">
                    <span className="font-bold text-slate-700">{liga._count?.ucesniciTakmicenja || 0}</span> timova • <span className="font-bold text-slate-700">{liga._count?.utakmice || 0}</span> utakmica
                  </div>
                  <Link to="/lige" className="block w-full py-3.5 bg-orange-50 text-orange-700 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-orange-100 transition-colors">
                    Pogledaj ligu
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-[32px] border border-amber-100 shadow-sm">
                <p className="text-slate-500 text-lg font-medium">Trenutno nema aktivnih liga.</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 text-center sm:hidden">
            <Link to="/lige" className="text-orange-600 font-bold hover:underline text-sm uppercase tracking-wider">
              Pogledaj sve lige &rarr;
            </Link>
        </div>
      </section>

      {/* Najnoviji Rezultati */}
      <section id="rezultati" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-10 border-b-2 border-amber-100 pb-4">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <span className="text-orange-600"><ChartIcon /></span> NAJNOVIJI REZULTATI
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20">
             <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm overflow-hidden">
            {data.najnovijiRezultati.length > 0 ? (
              <div className="divide-y divide-amber-50">
                {data.najnovijiRezultati.map((rezultat) => (
                  <div key={rezultat.rezultatUtakmiceId} className="flex flex-col md:flex-row md:items-center p-6 hover:bg-slate-50 transition-colors">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 w-full md:w-1/4 mb-4 md:mb-0">
                      {rezultat.utakmica.takmicenje.naziv}
                    </div>
                    
                    <div className="flex-1 flex justify-center items-center gap-4 md:gap-8">
                      <div className="flex-1 flex items-center justify-end gap-3">
                        <span className="font-bold text-slate-800 text-sm md:text-base text-right">{rezultat.utakmica.domaciTim.naziv}</span>
                        <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-full hidden sm:flex items-center justify-center text-xs font-black text-slate-400">
                          {rezultat.utakmica.domaciTim.naziv.substring(0,2)}
                        </div>
                      </div>
                      
                      <div className="text-3xl font-black text-orange-600 tracking-wider">
                        {rezultat.rezultatDomacin} : {rezultat.rezultatGost}
                      </div>
                      
                      <div className="flex-1 flex items-center justify-start gap-3">
                        <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-full hidden sm:flex items-center justify-center text-xs font-black text-slate-400">
                          {rezultat.utakmica.gostujuciTim.naziv.substring(0,2)}
                        </div>
                        <span className="font-bold text-slate-800 text-sm md:text-base text-left">{rezultat.utakmica.gostujuciTim.naziv}</span>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-1/5 text-right text-sm font-medium text-slate-500 mt-4 md:mt-0 flex items-center justify-end gap-2">
                      <CalendarIcon /> {formatDate(rezultat.utakmica.vrijemePocetka)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg font-medium">Trenutno nema novih rezultata.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Footer Banner */}
      <div className="bg-orange-600 mt-16 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4 text-white">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><ShieldIcon /></div>
            <div>
              <h4 className="font-black text-lg mb-1 tracking-tight">POUZDANO</h4>
              <p className="text-orange-100 text-sm font-medium">Tačni podaci i ažurne informacije.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-white">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><ClockIcon /></div>
            <div>
              <h4 className="font-black text-lg mb-1 tracking-tight">BRZO</h4>
              <p className="text-orange-100 text-sm font-medium">Sve informacije su vam dostupne u sekundi.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-white">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><UsersIcon /></div>
            <div>
              <h4 className="font-black text-lg mb-1 tracking-tight">ZA SVE</h4>
              <p className="text-orange-100 text-sm font-medium">Dizajnirano za igrače, trenere i navijače.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-white">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><LockIcon /></div>
            <div>
              <h4 className="font-black text-lg mb-1 tracking-tight">SIGURNO</h4>
              <p className="text-orange-100 text-sm font-medium">Vaši podaci su sigurni sa nama.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm font-medium">
            &copy; 2026 sport.ba. Sva prava zadržana.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-bold tracking-wide">Uslovi korištenja</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-bold tracking-wide">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
