import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  getFreeIndividualTerms,
  reserveIndividualTerm,
  cancelIndividualTerm,
  cancelPendingReservationRequest,
  joinWaitlist,
  getGrupniTreninzi,
  prijaviSeNaGrupniTrening,
  odjaviSeSaGrupnogTreninga,
  getMojeRezervacije,
  getAllFacilities,
} from '../api/reservationApi';

const DAY_LABELS = ['NED', 'PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB'];

function pad(v) { return String(v).padStart(2, '0'); }
function formatDate(d) {
  const date = new Date(d);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}.`;
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
}
function getWeekStart(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  next.setDate(next.getDate() + (day === 0 ? -6 : 1 - day));
  return next;
}
function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}
function getWeekDays(start) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return { date, key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` };
  });
}
function getDayLabel(date) {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}. ${DAY_LABELS[date.getDay()]}`;
}
function groupTermsByDay(terms) {
  return terms.reduce((acc, term) => {
    const key = formatDate(term.vrijemePocetka);
    if (!acc[key]) acc[key] = [];
    acc[key].push(term);
    return acc;
  }, {});
}
function formatWeekRange(start) {
  const end = addDays(start, 6);
  return `${pad(start.getDate())}.${pad(start.getMonth() + 1)}. – ${pad(end.getDate())}.${pad(end.getMonth() + 1)}.${end.getFullYear()}.`;
}
function tipTerminaLabel(tip) {
  const map = { JEDNOM: 'Jednokratno', SEDMICNO: 'Sedmično', MJESECNO: 'Mjesečno', INDIVIDUALNI: 'Individualno' };
  return map[tip] || tip;
}
function under24h(vrijemePocetka) {
  return new Date(vrijemePocetka) - new Date() < 24 * 60 * 60 * 1000;
}

function isPendingReservationRequest(item) {
  const normalizedStatus = String(item?.status || '').trim().toUpperCase().replace(/\s+/g, '_');
  return item?.vrstaZapisa === 'ZAHTJEV' || normalizedStatus === 'NA_CEKANJU';
}

function StatusBadge({ status }) {
  const map = {
    POTVRDJENA: 'bg-green-50 text-green-700 border-green-200',
    NA_CEKANJU: 'bg-amber-50 text-amber-700 border-amber-200',
    OTKAZANA: 'bg-red-50 text-red-700 border-red-200',
  };
  const label = { POTVRDJENA: 'Potvrđena', NA_CEKANJU: 'Na čekanju', OTKAZANA: 'Otkazana' };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${map[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {label[status] || status}
    </span>
  );
}

export default function PlayerDashboard() {
  const korisnik = localStorage.getItem('korisnik')
    ? JSON.parse(localStorage.getItem('korisnik'))
    : null;
  const isPlayer = korisnik?.trenutnaUloga === 'IGRAC' || korisnik?.uloga === 'IGRAC';
  const currentUserId = korisnik?.korisnikId;

  // --- Individualni ---
  const [allTerms, setAllTerms] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [joiningWaitlistIds, setJoiningWaitlistIds] = useState([]);
  const [termModal, setTermModal] = useState({ open: false, term: null, mode: 'reserve' });
  const [termError, setTermError] = useState('');
  const [reservationSubmitting, setReservationSubmitting] = useState(false);

  // --- Grupni ---
  const [trainings, setTrainings] = useState([]);
  const [loadingTrainings, setLoadingTrainings] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [optOutReason, setOptOutReason] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', showInput: false, onConfirm: null });

  // --- Moje rezervacije ---
  const [rezervacije, setRezervacije] = useState([]);
  const [loadingRez, setLoadingRez] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, item: null });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // --- Notifikacija (globalna) ---
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // --- Sedmica ---
  const todayWeekStart = useMemo(() => getWeekStart(new Date()), []);
  const currentWeekStart = useMemo(() => addDays(todayWeekStart, weekOffset * 7), [todayWeekStart, weekOffset]);
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  const weekTerms = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 7);
    return allTerms.filter((t) => {
      const d = new Date(t.vrijemePocetka);
      const inWeek = d >= currentWeekStart && d < weekEnd;
      const matchesFacility = !selectedFacilityId ||
        String(t.sportskiObjekat?.objekatId) === String(selectedFacilityId);
      return inWeek && matchesFacility;
    });
  }, [allTerms, currentWeekStart, selectedFacilityId]);

  const groupedTerms = useMemo(() => groupTermsByDay(weekTerms), [weekTerms]);

  // --- Load functions ---
  const loadTerms = async () => {
    setLoadingTerms(true);
    try {
      const [termsResponse, facsResponse] = await Promise.all([
        getFreeIndividualTerms(),
        getAllFacilities(),
      ]);
      setAllTerms(Array.isArray(termsResponse.termini) ? termsResponse.termini : []);
      setFacilities(Array.isArray(facsResponse) ? facsResponse : []);
    } catch {
      showNotification('error', 'Greška pri učitavanju termina.');
    } finally {
      setLoadingTerms(false);
    }
  };

  const loadTrainingsData = async () => {
    setLoadingTrainings(true);
    try {
      const data = await getGrupniTreninzi();
      setTrainings(data.treninzi || []);
    } catch {
      showNotification('error', 'Greška pri učitavanju grupnih treninga.');
    } finally {
      setLoadingTrainings(false);
    }
  };

  const loadRezervacije = async () => {
    setLoadingRez(true);
    try {
      const data = await getMojeRezervacije();
      setRezervacije(data.rezervacije || []);
    } catch {
      showNotification('error', 'Greška pri učitavanju rezervacija.');
    } finally {
      setLoadingRez(false);
    }
  };

  useEffect(() => {
    if (isPlayer) {
      loadTerms();
      loadTrainingsData();
      loadRezervacije();
    }
  }, [isPlayer]);

  // --- Individualni handlers ---
  const openTermModal = (term, mode) => { setTermModal({ open: true, term, mode }); setTermError(''); };
  const closeTermModal = () => { setTermModal({ open: false, term: null, mode: 'reserve' }); setTermError(''); };

  const handleConfirmReservation = async () => {
    if (!termModal.term || reservationSubmitting) return;
    const selectedTerminId = termModal.term.terminId;
    setReservationSubmitting(true);
    try {
      const response = await reserveIndividualTerm(selectedTerminId);
      showNotification('success', response.status === 'POTVRDJENA'
        ? 'Uspješno ste rezervisali termin!'
        : 'Vaš zahtjev je poslat na čekanje i biće ručno pregledan od strane vlasnika.');
      setAllTerms((current) => current.map((termin) => {
        if (termin.terminId !== selectedTerminId) return termin;
        if (response.status === 'POTVRDJENA') {
          return {
            ...termin,
            status: 'ZAUZET',
            jeMojaRezervacija: true,
            mojStatusRezervacije: null,
            mojZahtjevNaCekanju: false,
          };
        }
        return {
          ...termin,
          mojStatusRezervacije: 'NA_CEKANJU',
          mojZahtjevNaCekanju: true,
          zahtjevId: response.zahtjevId,
        };
      }));
      closeTermModal();
      void Promise.allSettled([
        loadTerms(),
        loadRezervacije(),
      ]);
    } catch (err) {
      setTermError(err.response?.data?.poruka || 'Rezervacija nije uspjela.');
    } finally {
      setReservationSubmitting(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!termModal.term) return;
    try {
      await cancelIndividualTerm(termModal.term.terminId);
      showNotification('success', 'Rezervacija je uspješno otkazana.');
      closeTermModal();
      loadTerms();
      loadRezervacije();
    } catch (err) {
      setTermError(err.response?.data?.poruka || 'Otkazivanje nije uspjelo.');
    }
  };

  const handleJoinWaitlist = async (termin) => {
    setJoiningWaitlistIds((c) => [...c, termin.terminId]);
    try {
      await joinWaitlist(termin.terminId);
      setAllTerms((c) => c.map((item) =>
        item.terminId === termin.terminId ? { ...item, naListiCekanja: true } : item
      ));
      showNotification('success', 'Prijavljeni ste na listu čekanja.');
    } catch (err) {
      showNotification('error', err.response?.data?.poruka || 'Prijava nije uspjela.');
    } finally {
      setJoiningWaitlistIds((c) => c.filter((id) => id !== termin.terminId));
    }
  };

  // --- Grupni handlers ---
  const handleRegister = async (treningId) => {
    setSubmittingId(treningId);
    try {
      const response = await prijaviSeNaGrupniTrening(treningId);
      showNotification('success', response.poruka || 'Uspješno ste se prijavili na grupni trening.');
      loadTrainingsData();
      loadRezervacije();
    } catch (err) {
      showNotification('error', err.response?.data?.poruka || 'Prijava nije uspjela.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCancelRegistration = (treningId) => {
    setOptOutReason('');
    setConfirmModal({
      open: true,
      title: 'Odjava sa treninga',
      message: 'Unesite razlog odjave kako bismo obavijestili trenera:',
      showInput: true,
      onConfirm: async (reasonText) => {
        setSubmittingId(treningId);
        try {
          const response = await odjaviSeSaGrupnogTreninga(treningId, reasonText);
          showNotification('success', response.poruka || 'Uspješno ste se odjavili.');
          loadTrainingsData();
          loadRezervacije();
        } catch (err) {
          showNotification('error', err.response?.data?.poruka || 'Odjava nije uspjela.');
        } finally {
          setSubmittingId(null);
        }
      }
    });
  };

  // --- Moje rezervacije handlers ---
  const openCancelRez = (item) => { setCancelReason(''); setCancelModal({ open: true, item }); };

  const handleCancelRez = async () => {
    const { item } = cancelModal;
    setCancelSubmitting(true);
    try {
      if (item.tip === 'INDIVIDUALNI') {
        if (isPendingReservationRequest(item)) {
          if (!item.zahtjevId) throw new Error('ID zahtjeva nije pronađen.');
          await cancelPendingReservationRequest(item.zahtjevId);
        } else {
          await cancelIndividualTerm(item.terminId);
        }
      } else {
        await odjaviSeSaGrupnogTreninga(item.treningId, cancelReason);
      }
      showNotification('success', 'Rezervacija je uspješno otkazana.');
      setCancelModal({ open: false, item: null });
      loadRezervacije();
      loadTerms();
      loadTrainingsData();
    } catch (err) {
      showNotification('error', err.response?.data?.poruka || 'Otkazivanje nije uspjelo.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  if (!isPlayer) {
    return (
      <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-[32px] border-2 border-amber-100 bg-white p-10 shadow-sm text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-4">Pristup odbijen</h1>
            <p className="text-slate-600 font-medium">Ova stranica je dostupna samo registrovanim igračima.</p>
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
                Igrač <span className="text-orange-600">Dashboard</span>
              </h1>
              <p className="mt-1 text-slate-500 text-sm font-medium">
                Rezervišite termine, pregledajte grupne treninge i pratite vaše rezervacije.
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 px-5 py-3 text-orange-950 shadow-sm text-sm border-2 border-orange-100/50 font-bold">
              Nadolazećih rezervacija: <span className="text-orange-600 ml-1">{rezervacije.length}</span>
            </div>
          </div>

          {/* Globalna notifikacija */}
          {notification && (
            <div className={`rounded-2xl border-2 px-4 py-3.5 text-sm font-bold shadow-sm ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800'
              : notification.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {notification.message}
            </div>
          )}

          {/* ===== SEKCIJA 1: Individualni treninzi ===== */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-amber-950 uppercase tracking-wide">Individualni treninzi</h2>
                <p className="text-xs text-slate-400 font-medium">Odaberite objekat i rezervišite slobodan termin.</p>
              </div>
              <div className="w-full md:w-80">
                <select
                  value={selectedFacilityId}
                  onChange={(e) => { setSelectedFacilityId(e.target.value); setWeekOffset(0); }}
                  className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold text-sm shadow-sm h-12"
                >
                  <option value="">-- Odaberite sportski objekat --</option>
                  {facilities.map((f) => (
                    <option key={f.objekatId} value={f.objekatId}>{f.naziv}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedFacilityId ? (
              <div className="space-y-6">
                {/* Legenda */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-green-200 border border-green-400"></span>Slobodno</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-blue-200 border border-blue-400"></span>Vaša rezervacija</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-amber-200 border border-amber-400"></span>Zauzeto / Na čekanju</span>
                </div>

                {/* Navigacija sedmica */}
                <div className="flex items-center justify-between gap-4 border-t border-amber-50 pt-4">
                  <button type="button" onClick={() => setWeekOffset((w) => w - 1)} disabled={weekOffset === 0}
                    className="rounded-2xl border-2 border-amber-100 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                    ← Prethodna
                  </button>
                  <div className="text-center">
                    <div className="text-sm font-black text-slate-700">
                      {weekOffset === 0 ? 'TRENUTNA SEDMICA' : weekOffset === 1 ? 'SLJEDEĆA SEDMICA' : `ZA ${weekOffset} SEDMICA`}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">{formatWeekRange(currentWeekStart)}</div>
                  </div>
                  <button type="button" onClick={() => setWeekOffset((w) => w + 1)}
                    className="rounded-2xl border-2 border-amber-100 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition hover:bg-slate-50">
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
                          <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-4 text-xs text-slate-400 text-center font-medium">Nema termina</div>
                        ) : (
                          <div className="space-y-3">
                            {dayTerms.map((termin) => {
                              const isMyReservation = termin.jeMojaRezervacija;
                              const isMyPending = !isMyReservation && (
                                termin.mojStatusRezervacije === 'NA_CEKANJU' ||
                                termin.mojZahtjevNaCekanju === true
                              );
                              const isFree = termin.status === 'SLOBODAN' && !isMyPending;
                              const isOccupied = termin.status === 'ZAUZET' && !isMyReservation;
                              const isJoining = joiningWaitlistIds.includes(termin.terminId);
                              return (
                                <button key={termin.terminId} type="button"
                                  disabled={isMyPending || (isOccupied && (termin.naListiCekanja || isJoining))}
                                  onClick={() => {
                                    if (isFree) openTermModal(termin, 'reserve');
                                    if (isMyReservation) openTermModal(termin, 'cancel');
                                    if (isOccupied && !termin.naListiCekanja) handleJoinWaitlist(termin);
                                  }}
                                  className={`w-full rounded-2xl border-2 p-3 text-left shadow-sm transition
                                    ${isFree ? 'border-green-100 bg-white hover:border-green-400 hover:bg-green-50/30 cursor-pointer'
                                    : isMyReservation ? 'border-blue-100 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                                    : isMyPending ? 'border-amber-200 bg-amber-50/40 cursor-not-allowed opacity-80'
                                    : 'border-orange-100 bg-orange-50/25 hover:border-orange-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75'}`}
                                >
                                  <div className="mb-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border
                                      ${isFree ? 'bg-green-50 text-green-700 border-green-100'
                                      : isMyReservation ? 'bg-blue-50 text-blue-700 border-blue-100'
                                      : isMyPending ? 'bg-amber-100 text-amber-700 border-amber-200'
                                      : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                      {isFree ? 'Slobodno' : isMyReservation ? 'Rezervisano' : isMyPending ? 'Na čekanju' : 'Zauzeto'}
                                    </span>
                                  </div>
                                  <div className="font-bold text-slate-900 text-sm">{formatTime(termin.vrijemePocetka)}</div>
                                  <div className="mt-0.5 text-[10px] text-slate-400 truncate font-medium">
                                    {termin.sportskiObjekat?.naziv || 'Sportski objekat'}
                                  </div>
                                  {termin.tipTermina && <div className="mt-0.5 text-[10px] text-slate-400">{tipTerminaLabel(termin.tipTermina)}</div>}
                                  {isMyReservation && <div className="mt-2 text-[10px] text-blue-500 font-black uppercase tracking-wide">Kliknite za otkazivanje</div>}
                                  {isMyPending && <div className="mt-2 text-[10px] text-amber-600 font-black uppercase tracking-wide">Čeka odobrenje vlasnika</div>}
                                  {isOccupied && (
                                    <div className="mt-2 text-[10px] text-orange-700 font-black uppercase tracking-wide">
                                      {termin.naListiCekanja ? 'Na listi čekanja' : isJoining ? 'Prijava u toku...' : 'Prijavi me na listu čekanja'}
                                    </div>
                                  )}
                                </button>
                              );
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
                Odaberite sportski objekat iz padajućeg menija iznad kako biste vidjeli slobodne termine.
              </div>
            )}
          </div>

          {/* ===== SEKCIJA 2: Grupni treninzi ===== */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-amber-950 uppercase tracking-wide">Grupni treninzi</h2>
                <p className="text-xs text-slate-400 font-medium">Prijavite se na grupne treninge koje vode licencirani treneri.</p>
              </div>
              <div className="rounded-2xl bg-orange-50 px-4 py-2 text-orange-950 text-sm border-2 border-orange-100/50 font-bold">
                Dostupno: <span className="text-orange-600 ml-1">{trainings.length}</span>
              </div>
            </div>

            {loadingTrainings ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : trainings.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-amber-200 bg-amber-50/10 p-10 text-center text-slate-400 font-medium">
                Trenutno nema dostupnih grupnih treninga.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {trainings.map((trening) => {
                  const prijavljeniCount = trening.prijave?.length || 0;
                  const maxKapacitet = trening.maksimalanBrojIgraca;
                  const jePrijavljen = trening.prijave?.some((p) => p.korisnikId === currentUserId);
                  const jePopunjen = prijavljeniCount >= maxKapacitet;
                  const procenat = Math.min(100, (prijavljeniCount / maxKapacitet) * 100);
                  const timNaziv = trening.terminObjekta?.zahtjeviZaRezervaciju?.[0]?.tim?.naziv;

                  return (
                    <div key={trening.treningId} className="rounded-[2.5rem] border-2 border-amber-100 bg-amber-50/10 p-6 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-orange-600 mb-1">
                          {trening.terminObjekta?.sportskiObjekat?.naziv || 'Sportski objekat'}
                        </div>
                        {timNaziv && (
                          <div className="text-[10px] font-black text-amber-900/80 mb-2 bg-amber-100/50 rounded-xl px-2.5 py-1 border border-amber-200/30 inline-block">
                            Tim: <span className="text-orange-600 font-black">{timNaziv}</span>
                          </div>
                        )}
                        <h3 className="text-lg font-black text-slate-800">{formatDate(trening.terminObjekta.vrijemePocetka)}</h3>
                        <div className="text-xs text-slate-500 font-bold mt-0.5">
                          {formatTime(trening.terminObjekta.vrijemePocetka)} – {formatTime(trening.terminObjekta.vrijemeZavrsetka)}
                        </div>
                        <div className="mt-4 flex items-center gap-3 bg-amber-50/30 rounded-2xl p-3 border border-amber-100/50">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-black text-sm border border-orange-200">
                            {trening.trener?.punoIme?.charAt(0).toUpperCase() || 'T'}
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trener</div>
                            <div className="text-xs font-bold text-slate-700">{trening.trener?.punoIme || 'Trener'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3 pt-3 border-t border-amber-50">
                        <div>
                          <div className="flex justify-between text-xs font-black text-slate-700 mb-1.5">
                            <span>Popunjenost</span>
                            <span className="text-orange-600">{prijavljeniCount} / {maxKapacitet} mjesta</span>
                          </div>
                          <div className="w-full bg-amber-100/50 h-2 rounded-full overflow-hidden border border-amber-200/20">
                            <div className="bg-orange-600 h-full rounded-full transition-all duration-300" style={{ width: `${procenat}%` }} />
                          </div>
                        </div>
                        {jePrijavljen ? (
                          <div className="space-y-2">
                            <div className="w-full rounded-2xl bg-green-50 text-green-700 border-2 border-green-200 py-2.5 text-xs font-black uppercase tracking-widest text-center">
                              Prijavljeni ste
                            </div>
                            <button type="button" disabled={submittingId === trening.treningId}
                              onClick={() => handleCancelRegistration(trening.treningId)}
                              className="w-full rounded-2xl bg-white text-red-600 border-2 border-red-100 hover:border-red-400 hover:bg-red-50/20 py-2.5 text-xs font-black uppercase tracking-widest text-center transition">
                              {submittingId === trening.treningId ? 'Odjavljivanje...' : 'Odjavi se'}
                            </button>
                          </div>
                        ) : jePopunjen ? (
                          <button disabled className="w-full rounded-2xl bg-slate-100 text-slate-400 border-2 border-slate-200 py-2.5 text-xs font-black uppercase tracking-widest cursor-not-allowed text-center">
                            Popunjeno
                          </button>
                        ) : (
                          <button type="button" disabled={submittingId === trening.treningId}
                            onClick={() => handleRegister(trening.treningId)}
                            className="w-full rounded-2xl bg-orange-600 text-white hover:bg-orange-700 py-2.5 text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95 disabled:opacity-50 text-center transform">
                            {submittingId === trening.treningId ? 'Prijavljivanje...' : 'Prijavi se'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== SEKCIJA 3: Moje rezervacije ===== */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-amber-950 uppercase tracking-wide">Moje rezervacije</h2>
                <p className="text-xs text-slate-400 font-medium">Pregled svih nadolazećih termina — individualnih i grupnih.</p>
              </div>
              <div className="rounded-2xl bg-orange-50 px-4 py-2 text-orange-950 text-sm border-2 border-orange-100/50 font-bold">
                Ukupno: <span className="text-orange-600 ml-1">{rezervacije.length}</span>
              </div>
            </div>

            {loadingRez ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : rezervacije.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-amber-200 bg-amber-50/10 p-10 text-center text-slate-400 font-medium">
                Nemate nadolazećih rezervacija.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rezervacije.map((r, i) => (
                  <div key={i} className="rounded-[2.5rem] border-2 border-amber-100 bg-amber-50/10 p-6 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                          r.tip === 'INDIVIDUALNI' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {r.tip === 'INDIVIDUALNI' ? '👤 Individualni' : '👥 Grupni'}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-orange-600">{r.objekat || 'Sportski objekat'}</div>
                        {r.adresa && <div className="text-[10px] text-slate-400 font-medium mt-0.5">{r.adresa}</div>}
                      </div>
                      <div className="rounded-2xl bg-amber-50/40 border border-amber-100 p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-semibold uppercase tracking-wide">Datum</span>
                          <span className="font-black text-slate-800">{formatDate(r.vrijemePocetka)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-semibold uppercase tracking-wide">Vrijeme</span>
                          <span className="font-black text-slate-800">{formatTime(r.vrijemePocetka)} – {formatTime(r.vrijemeZavrsetka)}</span>
                        </div>
                        <div className="flex justify-between text-xs border-t border-amber-100 pt-1.5 mt-1">
                          <span className="text-slate-400 font-semibold uppercase tracking-wide">Rezervisano</span>
                          <span className="font-bold text-slate-500">{formatDate(r.datumKreiranja)}</span>
                        </div>
                      </div>
                      {r.tip === 'GRUPNI' && r.trener && (
                        <div className="flex items-center gap-2 bg-amber-50/30 rounded-2xl p-2.5 border border-amber-100/50">
                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-black text-xs border border-orange-200">
                            {r.trener.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trener</div>
                            <div className="text-xs font-bold text-slate-700">{r.trener}</div>
                          </div>
                        </div>
                      )}
                      {!isPendingReservationRequest(r) && under24h(r.vrijemePocetka) && (
                        <div className="rounded-2xl bg-red-50 border-2 border-red-100 px-3 py-2 text-[10px] font-black text-red-700 leading-relaxed">
                          ⚠️ Otkazivanje unutar 24h dodjeljuje 1 prekršajni poen!
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => openCancelRez(r)}
                      className="mt-5 w-full rounded-2xl border-2 border-red-100 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50/20">
                      {isPendingReservationRequest(r) ? 'Otkaži zahtjev' : 'Otkaži termin'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Modal — Individualni rezervacija/otkazivanje */}
      {termModal.open && termModal.term && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border-2 border-amber-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {termModal.mode === 'reserve' ? 'Potvrda rezervacije' : 'Otkazivanje rezervacije'}
                </h2>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  {termModal.mode === 'reserve' ? 'Potvrdite rezervaciju termina.' : 'Termin će postati slobodan.'}
                </p>
              </div>
              <button type="button" onClick={closeTermModal}
                className="rounded-full bg-amber-50 p-2 text-amber-900 hover:bg-amber-100 transition-colors font-bold text-xs">✕</button>
            </div>
            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/20 p-4 text-xs font-bold text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Datum</span>
                <span>{formatDate(termModal.term.vrijemePocetka)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Vrijeme</span>
                <span>{formatTime(termModal.term.vrijemePocetka)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Objekat</span>
                <span>{termModal.term.sportskiObjekat?.naziv || 'Sportski objekat'}</span>
              </div>
            </div>
            {termError && (
              <div className="mt-4 rounded-2xl border-2 border-red-100 bg-red-50 p-3.5 text-xs text-red-800 font-bold">{termError}</div>
            )}
            <div className="mt-6 flex gap-2 justify-end">
              <button type="button" onClick={closeTermModal}
                className="px-5 py-3 bg-white border-2 border-amber-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all">
                Odustani
              </button>
              {termModal.mode === 'reserve' ? (
                <button type="button" onClick={handleConfirmReservation} disabled={reservationSubmitting}
                  className="px-6 py-3 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-md active:scale-95 transform disabled:cursor-not-allowed disabled:opacity-60">
                  {reservationSubmitting ? 'Slanje...' : 'Potvrdi rezervaciju'}
                </button>
              ) : (
                <button type="button" onClick={handleConfirmCancellation}
                  className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-md active:scale-95 transform">
                  Otkaži rezervaciju
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal — Odjava sa grupnog (confirm) */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border-2 border-amber-100 space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{confirmModal.title}</h3>
              <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">{confirmModal.message}</p>
              {confirmModal.showInput && (
                <textarea rows="3" placeholder="Unesite razlog odjave (obavezno)..."
                  value={optOutReason} onChange={(e) => setOptOutReason(e.target.value)}
                  className="mt-4 w-full px-4 py-3 bg-slate-50 border-2 border-amber-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-semibold text-xs shadow-sm resize-none" />
              )}
            </div>
            <div className="flex gap-3">
              <button type="button"
                onClick={() => setConfirmModal({ open: false, title: '', message: '', showInput: false, onConfirm: null })}
                className="flex-1 rounded-2xl bg-amber-50 border border-amber-200 py-3 text-xs font-black uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">
                Odustani
              </button>
              <button type="button" disabled={confirmModal.showInput && !optOutReason.trim()}
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm(optOutReason);
                  setConfirmModal({ open: false, title: '', message: '', showInput: false, onConfirm: null });
                }}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                Potvrdi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Otkazivanje iz Mojih rezervacija */}
      {cancelModal.open && cancelModal.item && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border-2 border-amber-100 space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800">Otkaži rezervaciju</h3>
              <p className="mt-2 text-xs text-slate-500 font-medium">Da li ste sigurni da želite otkazati ovaj termin?</p>
              {under24h(cancelModal.item.vrijemePocetka) && (
                <div className="mt-3 rounded-2xl bg-red-50 border-2 border-red-100 p-3 text-xs font-black text-red-700 leading-relaxed">
                  ⚠️ Otkazujete termin unutar 24 sata. Ova akcija će Vam dodijeliti 1 prekršajni poen. Ukoliko sakupite 3 prekršaja, profil će biti označen kao nepouzdan.
                </div>
              )}
            </div>
            {cancelModal.item.tip === 'GRUPNI' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2">Razlog odjave (obavezno)</label>
                <textarea rows="3" placeholder="Unesite razlog odjave..." value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-amber-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-semibold text-xs shadow-sm resize-none" />
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setCancelModal({ open: false, item: null })}
                className="flex-1 rounded-2xl bg-amber-50 border border-amber-200 py-3 text-xs font-black uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">
                Odustani
              </button>
              <button type="button"
                disabled={cancelSubmitting || (cancelModal.item.tip === 'GRUPNI' && !cancelReason.trim())}
                onClick={handleCancelRez}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                {cancelSubmitting ? 'Otkazivanje...' : 'Potvrdi otkazivanje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
