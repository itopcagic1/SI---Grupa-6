import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  getFreeIndividualTerms,
  reserveIndividualTerm,
  cancelIndividualTerm,
  joinWaitlist,
} from '../api/reservationApi';

const DAY_LABELS = ['NED', 'PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB'];

function pad(value) { return String(value).padStart(2, '0'); }

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}.`;
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
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

function tipTerminaLabel(tip) {
  if (!tip) return null;
  const map = { JEDNOM: 'Jednokratno', SEDMICNO: 'Sedmično', MJESECNO: 'Mjesečno', INDIVIDUALNI: 'Individualno' };
  return map[tip] || tip;
}

function formatWeekRange(start) {
  const end = addDays(start, 6);
  return `${pad(start.getDate())}.${pad(start.getMonth() + 1)}. – ${pad(end.getDate())}.${pad(end.getMonth() + 1)}.${end.getFullYear()}.`;
}

export default function IndividualTraining() {
  const [allTerms, setAllTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('reserve');
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [joiningWaitlistIds, setJoiningWaitlistIds] = useState([]);

  const korisnik = localStorage.getItem('korisnik')
    ? JSON.parse(localStorage.getItem('korisnik'))
    : null;

  const isPlayer = korisnik?.trenutnaUloga === 'IGRAC' || korisnik?.uloga === 'IGRAC';

  const todayWeekStart = useMemo(() => getWeekStart(new Date()), []);
  const currentWeekStart = useMemo(() => addDays(todayWeekStart, weekOffset * 7), [todayWeekStart, weekOffset]);
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  const weekTerms = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 7);
    return allTerms.filter((t) => {
      const d = new Date(t.vrijemePocetka);
      return d >= currentWeekStart && d < weekEnd;
    });
  }, [allTerms, currentWeekStart]);

  const groupedTerms = useMemo(() => groupTermsByDay(weekTerms), [weekTerms]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadTerms = async () => {
    setLoading(true);
    try {
      const response = await getFreeIndividualTerms();
      const podaci = Array.isArray(response) ? response : (response?.termini || []);
      setAllTerms(podaci);
    } catch {
      showNotification('error', 'Neuspješno učitavanje termina.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTerms(); }, []);

  const openReservationModal = (termin) => { setSelectedTerm(termin); setModalMode('reserve'); setModalOpen(true); setError(''); };
  const openCancelModal = (termin) => { setSelectedTerm(termin); setModalMode('cancel'); setModalOpen(true); setError(''); };
  const closeModal = () => { setModalOpen(false); setSelectedTerm(null); setError(''); };

  const handleConfirmReservation = async () => {
    if (!selectedTerm) return;
    try {
      const response = await reserveIndividualTerm(selectedTerm.terminId);
      if (response?.status === 'POTVRDJENA') {
        showNotification('success', 'Uspješno ste rezervisali termin!');
      } else {
        showNotification('warning', 'Vaš zahtjev je poslat na čekanje i biće ručno pregledan od strane vlasnika objekta.');
      }
      closeModal();
      loadTerms();
    } catch (err) {
      setError(err.response?.data?.poruka || 'Rezervacija nije uspjela.');
    }
  };

  const handleConfirmCancellation = async () => {
    if (!selectedTerm) return;
    try {
      await cancelIndividualTerm(selectedTerm.terminId);
      showNotification('success', 'Rezervacija je uspješno otkazana.');
      closeModal();
      loadTerms();
    } catch (err) {
      setError(err.response?.data?.poruka || 'Otkazivanje nije uspjelo.');
    }
  };

  const handleJoinWaitlist = async (termin) => {
    setJoiningWaitlistIds((current) => [...current, termin.terminId]);
    try {
      await joinWaitlist(termin.terminId);
      setAllTerms((current) => current.map((item) =>
        item.terminId === termin.terminId ? { ...item, naListiCekanja: true } : item
      ));
      showNotification('success', 'Prijavljeni ste na listu čekanja za ovaj termin.');
    } catch (err) {
      showNotification('error', err.response?.data?.poruka || 'Prijava na listu čekanja nije uspjela.');
    } finally {
      setJoiningWaitlistIds((current) => current.filter((id) => id !== termin.terminId));
    }
  };

  if (!isPlayer) {
    return (
      <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-[32px] border-2 border-amber-100 bg-white p-10 shadow-sm text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-4">Pristup odbijen</h1>
            <p className="text-slate-600 leading-7 font-medium">Ova stranica je dostupna samo registrovanim igračima.</p>
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
                Individualni <span className="text-orange-600">treninzi</span>
              </h1>
              <p className="mt-1 text-slate-500 text-sm font-medium">
                Pregledaj slobodne termine i rezerviši trening jednim klikom.
              </p>
            </div>
          </div>

          {/* Notifikacija */}
          {notification && (
            <div className={`rounded-2xl border-2 px-4 py-3.5 text-sm font-bold shadow-sm ${
              notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800'
              : notification.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {notification.message}
            </div>
          )}

          {/* Kalendar */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 space-y-6">

            {/* Legenda */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-green-200 border border-green-400"></span>
                Slobodno
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-200 border border-blue-400"></span>
                Vaša rezervacija
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-200 border border-amber-400"></span>
                Zauzeto
              </span>
            </div>

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
                    {loading ? (
                      <div className="text-xs text-slate-400 font-bold text-center py-4">Učitavanje...</div>
                    ) : dayTerms.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-4 text-xs text-slate-400 text-center font-medium">
                        Nema termina
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayTerms.map((termin) => {
                          const isFree = termin.status === 'SLOBODAN';
                          const isMyReservation = termin.jeMojaRezervacija || termin.status === 'POTVRDJENA';
                          const isOccupied = (termin.status === 'ZAUZET' || termin.status === 'NA_CEKANJU') && !isMyReservation;
                          const isJoining = joiningWaitlistIds.includes(termin.terminId);

                          return (
                            <button
                              key={termin.terminId}
                              type="button"
                              disabled={isOccupied && (termin.naListiCekanja || isJoining)}
                              onClick={() => {
                                if (isFree) openReservationModal(termin);
                                if (isMyReservation) openCancelModal(termin);
                                if (isOccupied && !termin.naListiCekanja) handleJoinWaitlist(termin);
                              }}
                              className={`w-full rounded-2xl border-2 p-3 text-left shadow-sm transition
                                ${isFree
                                  ? 'border-green-100 bg-white hover:border-green-400 hover:bg-green-50/30 cursor-pointer'
                                  : isMyReservation
                                  ? 'border-blue-100 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                                  : 'border-orange-100 bg-orange-50/25 hover:border-orange-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75'
                                }`}
                            >
                              <div className="mb-2">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border
                                  ${isFree ? 'bg-green-50 text-green-700 border-green-100'
                                  : isMyReservation ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                  {isFree ? 'Slobodno' : isMyReservation ? 'Rezervisano' : 'Zauzeto'}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 text-sm">
                                {formatTime(termin.vrijemePocetka)}
                              </div>
                              <div className="mt-0.5 text-[10px] text-slate-400 truncate font-medium">
                                {termin.sportskiObjekat?.naziv || termin.objekat || 'Sportski objekat'}
                              </div>
                              {termin.tipTermina && (
                                <div className="mt-0.5 text-[10px] text-slate-400">
                                  {tipTerminaLabel(termin.tipTermina)}
                                </div>
                              )}
                              {isMyReservation && (
                                <div className="mt-2 text-[10px] text-blue-500 font-black uppercase tracking-wide">
                                  Kliknite za otkazivanje
                                </div>
                              )}
                              {isOccupied && (
                                <div className="mt-2 text-[10px] text-orange-700 font-black uppercase tracking-wide">
                                  {termin.naListiCekanja ? 'Na listi čekanja'
                                  : isJoining ? 'Prijava u toku...'
                                  : 'Prijavi me na listu čekanja'}
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
        </div>
      </main>

      {/* Modal */}
      {modalOpen && selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border-2 border-amber-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {modalMode === 'reserve' ? 'Potvrda rezervacije' : 'Otkazivanje rezervacije'}
                </h2>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  {modalMode === 'reserve' ? 'Potvrdite rezervaciju termina.' : 'Termin će postati slobodan.'}
                </p>
              </div>
              <button type="button" onClick={closeModal}
                className="rounded-full bg-amber-50 p-2 text-amber-900 hover:bg-amber-100 transition-colors font-bold text-xs">
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/20 p-4 text-xs font-bold text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Datum</span>
                <span>{formatDate(selectedTerm.vrijemePocetka)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Vrijeme</span>
                <span>{formatTime(selectedTerm.vrijemePocetka)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wide">Objekat</span>
                <span>{selectedTerm.sportskiObjekat?.naziv || selectedTerm.objekat || 'Sportski objekat'}</span>
              </div>
              {selectedTerm.tipTermina && (
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase tracking-wide">Tip</span>
                  <span>{tipTerminaLabel(selectedTerm.tipTermina)}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border-2 border-red-100 bg-red-50 p-3.5 text-xs text-red-800 font-bold">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-2 justify-end">
              <button type="button" onClick={closeModal}
                className="px-5 py-3 bg-white border-2 border-amber-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all">
                Odustani
              </button>
              {modalMode === 'reserve' ? (
                <button type="button" onClick={handleConfirmReservation}
                  className="px-6 py-3 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-md active:scale-95 transform">
                  Potvrdi rezervaciju
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
    </div>
  );
}