import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  getAllFacilities,
  getFacilityTerms,
  kreirajGrupniTrening,
  getTrenerGrupniTreninzi,
  getAllTeams,
  otkaziGrupniTrening,
  cancelIndividualTerm,
  getTrenerNotifikacije
} from '../api/reservationApi';

const DAY_LABELS = ['NED', 'PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}.`;
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('bs-BA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getWeekStart(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + offset);
  return next;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getWeekDays(start) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return { date, key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` };
  });
}

function getDayLabel(date) {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}. ${DAY_LABELS[date.getDay()]}`;
}

function groupTermsByDay(terms) {
  return terms.reduce((acc, term) => {
    const dayKey = formatDate(term.vrijemePocetka);
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(term);
    return acc;
  }, {});
}

function formatWeekRange(start) {
  const end = addDays(start, 6);
  return `${pad(start.getDate())}.${pad(start.getMonth() + 1)}. – ${pad(end.getDate())}.${pad(end.getMonth() + 1)}.${end.getFullYear()}.`;
}

export default function CoachDashboard() {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [allTerms, setAllTerms] = useState([]);
  const [myTrainings, setMyTrainings] = useState([]);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingTrainings, setLoadingTrainings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [capacity, setCapacity] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const korisnik = localStorage.getItem('korisnik')
    ? JSON.parse(localStorage.getItem('korisnik'))
    : null;

  const isTrainer = korisnik?.trenutnaUloga === 'TRENER' || korisnik?.uloga === 'TRENER';

  const todayWeekStart = useMemo(() => getWeekStart(new Date()), []);

  const currentWeekStart = useMemo(
    () => addDays(todayWeekStart, weekOffset * 7),
    [todayWeekStart, weekOffset]
  );

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  // Filtriramo sve slobodne i buduće termine za tekuću prikazanu sedmicu
  const weekTerms = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 7);
    const now = new Date();
    return allTerms.filter((t) => {
      const d = new Date(t.vrijemePocetka);
      return d >= currentWeekStart && d < weekEnd && d > now;
    });
  }, [allTerms, currentWeekStart]);

  const groupedTerms = useMemo(() => groupTermsByDay(weekTerms), [weekTerms]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadInitialData = async () => {
    try {
      const facs = await getAllFacilities();
      setFacilities(Array.isArray(facs) ? facs : []);

      const teamsData = await getAllTeams();
      if (Array.isArray(teamsData) && korisnik?.korisnikId) {
        const currentUserId = parseInt(korisnik.korisnikId, 10);
        const filtered = teamsData.filter((t) =>
          t.clanstvaUcesnika?.some(
            (c) => c.korisnikId === currentUserId && c.ulogaUTimu === 'TRENER'
          )
        );
        setMyTeams(filtered);
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Greška pri učitavanju sportskih objekata ili timova.');
    }
  };

  const loadMyTrainings = async () => {
    setLoadingTrainings(true);
    try {
      const data = await getTrenerGrupniTreninzi();
      setMyTrainings(data.treninzi || []);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Greška pri učitavanju vaših grupnih treninga.');
    } finally {
      setLoadingTrainings(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getTrenerNotifikacije();
      setNotifications(data.notifikacije || []);
    } catch (err) {
      console.error(err);
    }
  };

 const handleCancelTraining = (trening) => {
    const vrijemePocetka = new Date(trening.terminObjekta.vrijemePocetka);
    const sada = new Date();
    const razlikaUMilisekundama = vrijemePocetka - sada;
    const razlikaUSatima = razlikaUMilisekundama / (1000 * 60 * 60);

    let porukaModala = 'Da li ste sigurni da želite otkazati ovaj grupni trening? Svi prijavljeni igrači će biti obrisani i termin će ponovo biti slobodan.\n\n';
 if (razlikaUSatima > 0 && razlikaUSatima < 24) {
      porukaModala = '\n\n⚠️ PAŽNJA: Ovaj trening počinje za manje od 24 sata! Otkazivanjem u zadnji čas dobit ćete kazneni prekršaj na svom profilu.';
    }

    const naCekanjuModal = trening.statusTreninga === 'NA_CEKANJU';

    setConfirmModal({
      open: true,
      title: naCekanjuModal ? 'Povuci zahtjev' : 'Otkaži grupni trening',
      message: naCekanjuModal
        ? 'Da li ste sigurni da želite povući zahtjev za ovaj grupni trening? Termin će ostati slobodan.'
        : porukaModala,
      onConfirm: async () => {
        try {
          let resData;
          
          if (naCekanjuModal) {
            // Umjesto cancelIndividualTerm, šaljemo zahtjev kroz otkaziGrupniTrening sa jasnim string prefiksom!
            // Koristimo trening.zahtjevId koji je mapiran iz baze
            const privremeniId = `zahtjev-${trening.zahtjevId}`;
            resData = await otkaziGrupniTrening(privremeniId);
          } else {
            // Za regularne, potvrđene treninge šaljemo normalni brojčani treningId
            resData = await otkaziGrupniTrening(trening.treningId);
          }

          if (resData && resData.upozorenje === 'PREKRSAJ') {
            showNotification('warning', `Trening otkazan uz kaznu! ${resData.poruka}`);
          } else {
            showNotification('success', naCekanjuModal ? 'Zahtjev je uspješno povučen.' : 'Grupni trening je uspješno otkazan.');
          }

          loadMyTrainings();
          loadNotifications();
          if (selectedFacilityId) {
            setLoadingTerms(true);
            const data = await getFacilityTerms(selectedFacilityId);
            setAllTerms(data.termini || []);
            setLoadingTerms(false);
          }
        } catch (err) {
          console.error(err);
          showNotification('error', err.response?.data?.poruka || err.response?.data?.message || 'Greška pri otkazivanju.');
        }
      }
    });
  };
  useEffect(() => {
    if (isTrainer) {
      loadInitialData();
      loadMyTrainings();
      loadNotifications();
    }
  }, [isTrainer]);

  const handleFacilityChange = async (e) => {
    const facilityId = e.target.value;
    setSelectedFacilityId(facilityId);
    setWeekOffset(0);
    if (!facilityId) {
      setAllTerms([]);
      return;
    }

    setLoadingTerms(true);
    try {
      const data = await getFacilityTerms(facilityId);
      setAllTerms(data.termini || []);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Greška pri učitavanju termina za izabrani objekat.');
    } finally {
      setLoadingTerms(false);
    }
  };

  const refreshTerms = async () => {
    if (!selectedFacilityId) return;
    try {
      const data = await getFacilityTerms(selectedFacilityId);
      setAllTerms(data.termini || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openRentModal = (term) => {
    setSelectedTerm(term);
    setCapacity(15);
    setSelectedTeamId('');
    setError('');
    setModalOpen(true);
  };

  const handleConfirmRent = async (e) => {
    e.preventDefault();
    if (!selectedTerm) return;

    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum < 2 || capacityNum > 30) {
      setError('Kapacitet mora biti između 2 i 30.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await kreirajGrupniTrening(
        selectedTerm.terminId,
        capacityNum,
        selectedTeamId ? parseInt(selectedTeamId, 10) : null
      );
      showNotification('success', 'Uspješno ste kreirali grupni trening!');
      setModalOpen(false);
      setSelectedTerm(null);
      loadMyTrainings();
      refreshTerms();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.poruka || 'Kreiranje grupnog treninga nije uspjelo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isTrainer) {
    return (
      <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12 text-slate-800">
          <div className="rounded-[32px] border-2 border-amber-100 bg-white p-10 shadow-sm text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-4">Pristup odbijen</h1>
            <p className="text-slate-600 leading-7 font-medium">
              Ova stranica je rezervisana isključivo za korisnike sa ulogom TRENER.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-10">
          
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b-2 border-amber-100 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Trener <span className="text-orange-600">Dashboard</span>
              </h1>
              <p className="mt-1 text-slate-500 text-sm font-medium">
                Upravljajte grupnim treninzima, zakupljujte slobodne termine i pratite popunjenost grupa.
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 px-5 py-3 text-orange-950 shadow-sm text-sm border-2 border-orange-100/50 font-bold">
              Aktivnih treninga: <span className="text-orange-600 ml-1">{myTrainings.length}</span>
            </div>
          </div>

          {/* Notifikacija */}
          {notification && (
            <div
              className={`rounded-2xl border-2 px-4 py-3.5 text-sm font-bold shadow-sm transition-all ${
                notification.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* DIO 1: Kalendar za Zakup grupnog termina */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-amber-950 uppercase tracking-wide">Zakupi slobodan termin</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Odaberite objekat i pretražite slobodne termine na kalendaru.
                </p>
              </div>
              
              {/* Odabir objekta */}
              <div className="w-full md:w-80">
                <select
                  value={selectedFacilityId}
                  onChange={handleFacilityChange}
                  className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold text-sm shadow-sm h-12"
                >
                  <option value="">-- Odaberite sportski objekat --</option>
                  {facilities.map((f) => (
                    <option key={f.objekatId} value={f.objekatId}>
                      {f.naziv}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedFacilityId ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Navigacija sedmica */}
                <div className="flex items-center justify-between gap-4 border-t border-amber-50 pt-4">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => w - 1)}
                    disabled={weekOffset === 0}
                    className="rounded-2xl border-2 border-amber-100 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Prethodna
                  </button>
                  <div className="text-center">
                    <div className="text-sm font-black text-slate-700">
                      {weekOffset === 0 ? 'TRENUTNA SEDMICA' : weekOffset === 1 ? 'SLJEDEĆA SEDMICA' : `ZA ${weekOffset} SEDMICA`}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">{formatWeekRange(currentWeekStart)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((w) => w + 1)}
                    className="rounded-2xl border-2 border-amber-100 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Sljedeća →
                  </button>
                </div>

                {/* Grid sedmice */}
                <div className="grid gap-4 lg:grid-cols-7">
                  {weekDays.map((day) => {
                    const dayKey = formatDate(day.date.toISOString());
                    const dayTerms = groupedTerms[dayKey] || [];

                    return (
                      <div key={day.key} className="rounded-3xl border border-amber-100 bg-amber-50/20 p-4">
                        <div className="mb-4 text-xs font-black uppercase tracking-wider text-amber-900/60 border-b border-amber-100/50 pb-2">
                          {getDayLabel(day.date)}
                        </div>
                        {loadingTerms ? (
                          <div className="text-xs text-slate-400 font-bold text-center py-4">Učitavanje...</div>
                        ) : dayTerms.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-4 text-xs text-slate-400 text-center font-medium">
                            Nema termina
                          </div>
                        ) : (
                          <div className="space-y-3 animate-fadeIn">
                            {dayTerms.map((termin) => {
                              const jeSlobodan = termin.status === 'SLOBODAN';
                              const jeBlokiran = termin.status === 'BLOKIRAN';
                              const odobrenaRezervacija = termin.zahtjeviZaRezervaciju?.[0];
                              const rezervisaoKorisnik = odobrenaRezervacija?.korisnik?.punoIme;
                              const rezervisaoTim = odobrenaRezervacija?.tim?.naziv;

                              if (jeSlobodan) {
                                return (
                                  <button
                                    key={termin.terminId}
                                    type="button"
                                    onClick={() => openRentModal(termin)}
                                    className="w-full rounded-2xl border-2 border-green-100 bg-white p-3 text-left shadow-sm transition hover:border-green-400 hover:bg-green-50/30 cursor-pointer"
                                  >
                                    <div className="mb-2">
                                      <span className="rounded-full bg-green-50 text-green-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-green-100">
                                        Slobodno
                                      </span>
                                    </div>
                                    <div className="font-bold text-slate-900 text-sm">
                                      {formatTime(termin.vrijemePocetka)}
                                    </div>
                                    <div className="mt-0.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      Klikni za zakup
                                    </div>
                                  </button>
                                );
                              } else {
                                return (
                                  <div
                                    key={termin.terminId}
                                    className={`w-full rounded-2xl border-2 p-3 text-left shadow-sm opacity-90 ${
                                      jeBlokiran 
                                        ? 'border-red-100 bg-red-50/20' 
                                        : 'border-orange-100 bg-orange-50/25'
                                    }`}
                                  >
                                    <div className="mb-2">
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                                        jeBlokiran
                                          ? 'bg-red-50 text-red-700 border-red-100'
                                          : 'bg-orange-100 text-orange-700 border-orange-200'
                                      }`}>
                                        {jeBlokiran ? 'Blokirano' : 'Zauzeto'}
                                      </span>
                                    </div>
                                    <div className="font-bold text-slate-900 text-sm">
                                      {formatTime(termin.vrijemePocetka)}
                                    </div>
                                    {!jeBlokiran && (rezervisaoKorisnik || rezervisaoTim) ? (
                                      <div className="mt-2 pt-2 border-t border-amber-100/50 text-[10px] text-slate-500 font-bold leading-tight space-y-0.5">
                                        {rezervisaoKorisnik && <div>Rezervisao: {rezervisaoKorisnik}</div>}
                                        {rezervisaoTim && <div>Tim: <span className="text-orange-600 font-extrabold">{rezervisaoTim}</span></div>}
                                      </div>
                                    ) : (
                                      !jeBlokiran && (
                                        <div className="mt-1 text-[9px] text-slate-400 font-bold italic">
                                          Zakupljeno
                                        </div>
                                      )
                                    )}
                                  </div>
                                );
                              }
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-amber-200 bg-amber-50/10 p-12 text-center text-slate-400 font-medium">
                Odaberite sportski objekat iz padajućeg menija iznad kako biste vidjeli i zakupili slobodne termine na kalendaru.
              </div>
            )}
          </div>

          {/* DIO 2: Moji zakazani grupni treninzi */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-amber-950 uppercase tracking-wide">Moji aktivni grupni treninzi</h2>
              <p className="text-xs text-slate-400 font-medium">
                Pregledajte popunjenost i listu prijavljenih igrača po svakom grupnom treningu.
              </p>
            </div>

            {loadingTrainings ? (
              <div className="py-12 text-center text-sm font-bold text-slate-400">Učitavanje podataka...</div>
            ) : myTrainings.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-amber-200 p-12 text-center text-slate-400 font-medium">
                Nemate aktivnih grupnih treninga. Zakupite slobodan termin na kalendaru iznad.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myTrainings.map((trening) => {
                  const prijavljeniCount = trening.prijave?.length || 0;
                  const maxKapacitet = trening.maksimalanBrojIgraca;
                  const procenat = Math.min(100, (prijavljeniCount / maxKapacitet) * 100);
                  const timNaziv = trening.terminObjekta?.zahtjeviZaRezervaciju?.[0]?.tim?.naziv;
                  const naCekanju = trening.statusTreninga === 'NA_CEKANJU';

                  return (
                    <div
                      key={trening.treningId ?? `zahtjev-${trening.zahtjevId}`}
                      className={`rounded-[2.5rem] border-2 p-6 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300 ${naCekanju ? 'border-amber-300 bg-amber-50/40' : 'border-amber-100 bg-amber-50/10'}`}
                    >
                      <div>
                        {/* Objekat */}
                        <div className="text-xs font-black uppercase tracking-widest text-orange-600 mb-1">
                          {trening.terminObjekta?.sportskiObjekat?.naziv || 'Sportski objekat'}
                        </div>

                        {/* Status badge */}
                        {naCekanju ? (
                          <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-2xl bg-amber-100 border border-amber-300 text-[10px] font-black uppercase tracking-wider text-amber-800">
                             Na čekanju — čeka odobrenje vlasnika
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                            ✓ Potvrđeno
                          </div>
                        )}

                        {timNaziv && (
                          <div className="text-[10px] font-black text-amber-900/80 mb-2 bg-amber-100/50 rounded-xl px-2.5 py-1 border border-amber-200/30 inline-block">
                            Tim: <span className="text-orange-600 font-black">{timNaziv}</span>
                          </div>
                        )}
                        
                        {/* Datum i Vrijeme */}
                        <h3 className="text-lg font-black text-slate-800">
                          {formatDate(trening.terminObjekta.vrijemePocetka)}
                        </h3>
                        <div className="text-xs text-slate-500 font-bold mt-0.5">
                          {formatTime(trening.terminObjekta.vrijemePocetka)} -{' '}
                          {formatTime(trening.terminObjekta.vrijemeZavrsetka)}
                        </div>

                        {/* Spisak igrača */}
                        <div className="mt-4 border-t border-amber-100 pt-3">
                          <h4 className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest mb-2">
                            Prijavljeni igrači ({prijavljeniCount}):
                          </h4>
                          {prijavljeniCount === 0 ? (
                            <div className="text-xs text-slate-400 italic">Nema prijavljenih igrača.</div>
                          ) : (
                            <ul className="text-xs text-slate-600 space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                              {trening.prijave.map((p) => (
                                <li key={p.prijavaId} className="flex justify-between items-center bg-white rounded-xl p-2 border border-amber-50 shadow-sm">
                                  <span className="font-bold text-slate-700 truncate max-w-[140px]">
                                    {p.korisnik?.punoIme || p.korisnik?.email}
                                  </span>
                                  <span className="text-[9px] font-black text-slate-400">
                                    {new Date(p.datumPrijave).toLocaleDateString('bs-BA')}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Progres popunjenosti */}
                      <div className="mt-6 pt-3 border-t border-amber-50">
                        <div className="flex justify-between text-xs font-black text-slate-700 mb-1.5">
                          <span>Popunjenost</span>
                          <span className="text-orange-600">
                            {prijavljeniCount} / {maxKapacitet} mjesta
                          </span>
                        </div>
                        <div className="w-full bg-amber-100/50 h-2.5 rounded-full overflow-hidden border border-amber-200/30">
                          <div
                            className="bg-orange-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${procenat}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Gumb za otkazivanje */}
                      <button
                        type="button"
                        onClick={() => handleCancelTraining(trening)}
                        className="mt-4 w-full rounded-2xl border-2 border-red-100 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50/20"
                      >
                        {naCekanju ? 'Povuci zahtjev' : 'Otkaži trening'}
                      </button>


                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DIO 3: Obavijesti o odjavama igrača */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-xl font-black text-amber-950 uppercase tracking-wide">Obavijesti o odjavama igrača</h2>
              <p className="text-xs text-slate-400 font-medium">
                Pregledajte historiju igrača koji su otkazali dolazak na treninge.
              </p>
            </div>

            {notifications.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-amber-200 p-8 text-center text-slate-400 font-medium text-sm">
                Nema novih obavijesti o odjavama.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {notifications.map((n) => (
                  <div
                    key={n.notifikacijaId}
                    className="flex items-start gap-4 rounded-2xl border-2 border-amber-50 bg-amber-50/10 p-4 shadow-sm animate-fadeIn"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-650 font-black text-sm border border-red-200 shrink-0">
                      🛈
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">
                        {n.sadrzajPoruke}
                      </p>
                      <div className="text-[10px] text-slate-400 font-bold">
                        {new Date(n.vrijemeSlanja).toLocaleString('bs-BA')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Modal za zakup grupnog termina */}
      {modalOpen && selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border-2 border-amber-100 animate-scaleUp">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kreiraj grupni trening</h2>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  Pretvorite termin u grupni trening definisanjem kapaciteta.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full bg-amber-50 p-2 text-amber-900 hover:bg-amber-100 transition-colors font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRent} className="mt-6 space-y-5">
              
              <div className="rounded-2xl border border-amber-100 bg-amber-50/20 p-4 text-xs font-bold text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase tracking-wide">Datum:</span>
                  <span className="text-slate-900">{formatDate(selectedTerm.vrijemePocetka)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase tracking-wide">Vrijeme:</span>
                  <span className="text-slate-900">
                    {formatTime(selectedTerm.vrijemePocetka)} - {formatTime(selectedTerm.vrijemeZavrsetka)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase tracking-wide">Objekat:</span>
                  <span className="text-slate-900">
                    {facilities.find((f) => String(f.objekatId) === String(selectedFacilityId))?.naziv || 'Objekat'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                  Maksimalan broj igrača (2 - 30)
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold text-sm shadow-sm h-12"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                  Tim za koji se zakazuje trening (opcionalno)
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold text-sm shadow-sm h-12"
                >
                  <option value="">-- Bez tima (opcionalno) --</option>
                  {myTeams.map((t) => (
                    <option key={t.timId} value={t.timId}>
                      {t.naziv}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-3.5 text-xs text-red-800 font-bold shadow-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-3 bg-white border-2 border-amber-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-md active:scale-95 transform disabled:opacity-50"
                >
                  {submitting ? 'Kreiranje...' : 'Potvrdi zakup'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border-2 border-amber-100 animate-scaleUp space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{confirmModal.title}</h3>
              <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, title: '', message: '', onConfirm: null })}
                className="flex-1 rounded-2xl bg-amber-50/50 border border-amber-150 py-3 text-xs font-black uppercase tracking-wider text-amber-900 transition hover:bg-amber-100 font-bold"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ open: false, title: '', message: '', onConfirm: null });
                }}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-red-700 active:scale-95 font-bold"
              >
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}