import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import {
  getFreeIndividualTerms,
  reserveIndividualTerm,
  cancelIndividualTerm,
  joinWaitlist,
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

function tipTerminaLabel(tip) {
  if (!tip) return null;
  const map = {
    JEDNOM: 'Jednokratno',
    SEDMICNO: 'Sedmično',
    MJESECNO: 'Mjesečno',
    INDIVIDUALNI: 'Individualno',
  };
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

  const currentWeekStart = useMemo(
    () => addDays(todayWeekStart, weekOffset * 7),
    [todayWeekStart, weekOffset]
  );

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
      setAllTerms(Array.isArray(response.termini) ? response.termini : []);
    } catch {
      showNotification('error', 'Neuspješno učitavanje termina.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const openReservationModal = (termin) => {
    setSelectedTerm(termin);
    setModalMode('reserve');
    setModalOpen(true);
    setError('');
  };

  const openCancelModal = (termin) => {
    setSelectedTerm(termin);
    setModalMode('cancel');
    setModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTerm(null);
    setError('');
  };

  const handleConfirmReservation = async () => {
    if (!selectedTerm) return;
    try {
      const response = await reserveIndividualTerm(selectedTerm.terminId);
      if (response.status === 'POTVRDJENA') {
        showNotification('success', 'Uspješno ste rezervisali termin!');
      } else {
        showNotification(
          'warning',
          'Vaš zahtjev je poslat na čekanje i biće ručno pregledan od strane vlasnika objekta.'
        );
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
      setAllTerms((current) => current.map((item) => (
        item.terminId === termin.terminId ? { ...item, naListiCekanja: true } : item
      )));
      showNotification('success', 'Prijavljeni ste na listu cekanja za ovaj termin.');
    } catch (err) {
      showNotification('error', err.response?.data?.poruka || 'Prijava na listu cekanja nije uspjela.');
    } finally {
      setJoiningWaitlistIds((current) => current.filter((id) => id !== termin.terminId));
    }
  };

  if (!isPlayer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12 text-slate-800">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Rezervacija termina</h1>
            <p className="text-slate-600 leading-7">
              Ova stranica je dostupna samo registrovanim igračima.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Rezervacija termina</h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Pregledaj slobodne termine i rezerviši trening jednim klikom.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-900 shadow-sm text-sm">
              <span className="font-semibold">Napomena:</span> Ako ste označeni kao nepouzdani igrač,
              zahtjev će biti poslan na čekanje umjesto trenutne potvrde.
            </div>
          </div>

          {/* Notifikacija */}
          {notification && (
            <div
              className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
                notification.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : notification.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Legenda */}
          <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
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
          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              disabled={weekOffset === 0}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prethodna
            </button>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-700">
                {weekOffset === 0 ? 'Trenutna sedmica' : weekOffset === 1 ? 'Sljedeća sedmica' : `Za ${weekOffset} sedmica`}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{formatWeekRange(currentWeekStart)}</div>
            </div>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              Sljedeća →
            </button>
          </div>

          {/* Grid sedmice */}
          <div className="mt-4 grid gap-4 lg:grid-cols-7">
            {weekDays.map((day) => {
              const dayKey = formatDate(day.date.toISOString());
              const dayTerms = groupedTerms[dayKey] || [];

              return (
                <div key={day.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {getDayLabel(day.date)}
                  </div>
                  {loading ? (
                    <div className="text-xs text-slate-400">Učitavanje...</div>
                  ) : dayTerms.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-400 text-center">
                      Nema termina
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayTerms.map((termin) => {
                        const isFree = termin.status === 'SLOBODAN';
                        const isMyReservation = termin.jeMojaRezervacija;
                        const isOccupied = termin.status === 'ZAUZET' && !isMyReservation;
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
                            className={`w-full rounded-2xl border p-3 text-left shadow-sm transition
                              ${isFree
                                ? 'border-green-200 bg-white hover:border-green-400 hover:bg-green-50 cursor-pointer'
                                : isMyReservation
                                ? 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 cursor-pointer'
                                : 'border-amber-200 bg-amber-50 hover:border-amber-400 hover:bg-amber-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-75'
                              }`}
                          >
                            {/* Labela gore */}
                            <div className="mb-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide
                                  ${isFree
                                    ? 'bg-green-100 text-green-700'
                                    : isMyReservation
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-amber-100 text-amber-800'
                                  }`}
                              >
                                {isFree ? 'Slobodno' : isMyReservation ? 'Rezervisano' : 'Zauzeto'}
                              </span>
                            </div>

                            {/* Sat ispod labele */}
                            <div className="font-semibold text-slate-900 text-sm">
                              {formatTime(termin.vrijemePocetka)}
                            </div>

                            <div className="mt-1 text-xs text-slate-500 truncate">
                              {termin.sportskiObjekat?.naziv || 'Sportski objekat'}
                            </div>
                            {termin.tipTermina && (
                              <div className="mt-0.5 text-xs text-slate-400">
                                {tipTerminaLabel(termin.tipTermina)}
                              </div>
                            )}

                            {/* Hint za otkazivanje */}
                            {isMyReservation && (
                              <div className="mt-2 text-xs text-blue-500 font-medium">
                                Kliknite za otkazivanje
                              </div>
                            )}
                            {isOccupied && (
                              <div className="mt-2 text-xs text-amber-700 font-semibold">
                                {termin.naListiCekanja
                                  ? 'Nalazite se na listi cekanja'
                                  : isJoining
                                  ? 'Prijava u toku...'
                                  : 'Prijavi me na listu cekanja'}
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

          {/* Modal */}
          {modalOpen && selectedTerm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
              <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {modalMode === 'reserve' ? 'Potvrda rezervacije' : 'Otkazivanje rezervacije'}
                    </h2>
                    <p className="mt-2 text-slate-600">
                      {modalMode === 'reserve'
                        ? 'Potvrdite rezervaciju termina.'
                        : 'Da li sigurno želite otkazati ovu rezervaciju? Termin će postati slobodan.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full bg-slate-100 p-3 text-slate-700 hover:bg-slate-200"
                  >
                    Zatvori
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Datum</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {formatDate(selectedTerm.vrijemePocetka)}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Vrijeme</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {formatTime(selectedTerm.vrijemePocetka)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Objekat</div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selectedTerm.sportskiObjekat?.naziv || 'Sportski objekat'}
                  </div>
                  {selectedTerm.sportskiObjekat?.adresa && (
                    <div className="mt-1 text-sm text-slate-500">{selectedTerm.sportskiObjekat.adresa}</div>
                  )}
                  {selectedTerm.tipTermina && (
                    <div className="mt-2 text-xs text-slate-400">
                      Tip termina: {tipTerminaLabel(selectedTerm.tipTermina)}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Odustani
                  </button>

                  {modalMode === 'reserve' ? (
                    <button
                      type="button"
                      onClick={handleConfirmReservation}
                      className="rounded-3xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700"
                    >
                      Potvrdi rezervaciju
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmCancellation}
                      className="rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                    >
                      Otkaži rezervaciju
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
