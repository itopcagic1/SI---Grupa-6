import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getGrupniTreninzi, prijaviSeNaGrupniTrening, odjaviSeSaGrupnogTreninga } from '../api/reservationApi';

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

export default function GroupTrainingsBrowse() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [optOutReason, setOptOutReason] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    showInput: false,
    onConfirm: null,
  });

  const korisnik = localStorage.getItem('korisnik')
    ? JSON.parse(localStorage.getItem('korisnik'))
    : null;

  const currentUserId = korisnik?.korisnikId;
  const isPlayer = korisnik?.trenutnaUloga === 'IGRAC' || korisnik?.uloga === 'IGRAC';

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadTrainings = async () => {
    setLoading(true);
    try {
      const data = await getGrupniTreninzi();
      setTrainings(data.treninzi || []);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Greška pri učitavanju grupnih treninga.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPlayer) {
      loadTrainings();
    }
  }, [isPlayer]);

  const handleRegister = async (treningId) => {
    setSubmittingId(treningId);
    try {
      const response = await prijaviSeNaGrupniTrening(treningId);
      showNotification('success', response.poruka || 'Uspješno ste se prijavili na grupni trening.');
      loadTrainings();
    } catch (err) {
      console.error(err);
      showNotification(
        'error',
        err.response?.data?.poruka || 'Prijava na grupni trening nije uspjela.'
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCancelRegistration = (treningId) => {
    setOptOutReason('');
    setConfirmModal({
      open: true,
      title: 'Odjava sa treninga',
      message: 'Molimo vas da unesete razlog odjave sa ovog grupnog treninga kako bismo obavijestili trenera:',
      showInput: true,
      onConfirm: async (reasonText) => {
        setSubmittingId(treningId);
        try {
          const response = await odjaviSeSaGrupnogTreninga(treningId, reasonText);
          showNotification('success', response.poruka || 'Uspješno ste se odjavili.');
          loadTrainings();
        } catch (err) {
          console.error(err);
          showNotification(
            'error',
            err.response?.data?.poruka || 'Odjava sa grupnog treninga nije uspjela.'
          );
        } finally {
          setSubmittingId(null);
        }
      }
    });
  };

  if (!isPlayer) {
    return (
      <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-12 text-slate-800">
          <div className="rounded-[32px] border-2 border-amber-100 bg-white p-10 shadow-sm text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-4">Pristup odbijen</h1>
            <p className="text-slate-600 leading-7 font-medium">
              Ova stranica je dostupna samo registrovanim igračima.
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
                Grupni <span className="text-orange-600">treninzi</span>
              </h1>
              <p className="mt-1 text-slate-500 text-sm font-medium">
                Pregledajte i prijavite se na grupne treninge koje vode licencirani treneri.
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 px-5 py-3 text-orange-950 shadow-sm text-sm border-2 border-orange-100/50 font-bold">
              Dostupnih treninga: <span className="text-orange-600 ml-1">{trainings.length}</span>
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

          {/* Glavni sadržaj */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : trainings.length === 0 ? (
            <div className="rounded-[2.5rem] border border-dashed border-amber-200 bg-amber-50/10 p-12 text-center text-slate-400 font-medium">
              Trenutno nema dostupnih grupnih treninga na koje se možete prijaviti.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trainings.map((trening) => {
                const prijavljeniCount = trening.prijave?.length || 0;
                const maxKapacitet = trening.maksimalanBrojIgraca;
                const jePrijavljen = trening.prijave?.some((p) => p.korisnikId === currentUserId);
                const jePopunjen = prijavljeniCount >= maxKapacitet;
                const procenat = Math.min(100, (prijavljeniCount / maxKapacitet) * 100);
                const timNaziv = trening.terminObjekta?.zahtjeviZaRezervaciju?.[0]?.tim?.naziv;

                return (
                  <div
                    key={trening.treningId}
                    className="rounded-[2.5rem] border-2 border-amber-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      {/* Naziv objekta */}
                      <div className="text-xs font-black uppercase tracking-widest text-orange-600 mb-1">
                        {trening.terminObjekta?.sportskiObjekat?.naziv || 'Sportski objekat'}
                      </div>

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

                      {/* Trener */}
                      <div className="mt-4 flex items-center gap-3 bg-amber-50/30 rounded-2xl p-3 border border-amber-100/50">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-850 font-black text-sm border border-orange-200">
                          {trening.trener?.punoIme?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trener:</div>
                          <div className="text-xs font-bold text-slate-700">
                            {trening.trener?.punoIme || 'Trener'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Popunjenost i Akcija */}
                    <div className="mt-6 space-y-4 pt-3 border-t border-amber-50">
                      {/* Progres popunjenosti */}
                      <div>
                        <div className="flex justify-between text-xs font-black text-slate-700 mb-1.5">
                          <span>Popunjenost</span>
                          <span className="text-orange-600">
                            {prijavljeniCount} / {maxKapacitet} mjesta
                          </span>
                        </div>
                        <div className="w-full bg-amber-100/50 h-2 rounded-full overflow-hidden border border-amber-200/20">
                          <div
                            className="bg-orange-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${procenat}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Dugme za prijavu */}
                      {jePrijavljen ? (
                        <div className="space-y-2">
                          <div className="w-full rounded-2xl bg-green-50 text-green-700 border-2 border-green-200 py-3 text-xs font-black uppercase tracking-widest text-center">
                            Prijavljeni ste
                          </div>
                          <button
                            type="button"
                            disabled={submittingId === trening.treningId}
                            onClick={() => handleCancelRegistration(trening.treningId)}
                            className="w-full rounded-2xl bg-white text-red-600 border-2 border-red-100 hover:border-red-400 hover:bg-red-50/20 py-2.5 text-xs font-black uppercase tracking-widest text-center transition"
                          >
                            {submittingId === trening.treningId ? 'Odjavljivanje...' : 'Odjavi se'}
                          </button>
                        </div>
                      ) : jePopunjen ? (
                        <button
                          disabled
                          className="w-full rounded-2xl bg-slate-100 text-slate-400 border-2 border-slate-200 py-3 text-xs font-black uppercase tracking-widest cursor-not-allowed text-center"
                        >
                          Popunjeno
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={submittingId === trening.treningId}
                          onClick={() => handleRegister(trening.treningId)}
                          className="w-full rounded-2xl bg-orange-600 text-white hover:bg-orange-700 py-3 text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95 disabled:opacity-50 text-center transform"
                        >
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
      </main>

      {/* Custom Confirm Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border-2 border-amber-100 animate-scaleUp space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{confirmModal.title}</h3>
              <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
                {confirmModal.message}
              </p>
              
              {confirmModal.showInput && (
                <div className="mt-4">
                  <textarea
                    rows="3"
                    placeholder="Unesite razlog odjave (obavezno)..."
                    value={optOutReason}
                    onChange={(e) => setOptOutReason(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-amber-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-semibold text-xs shadow-sm resize-none"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, title: '', message: '', showInput: false, onConfirm: null })}
                className="flex-1 rounded-2xl bg-amber-50/50 border border-amber-150 py-3 text-xs font-black uppercase tracking-wider text-amber-900 transition hover:bg-amber-100 font-bold"
              >
                Odustani
              </button>
              <button
                type="button"
                disabled={confirmModal.showInput && !optOutReason.trim()}
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm(optOutReason);
                  setConfirmModal({ open: false, title: '', message: '', showInput: false, onConfirm: null });
                }}
                className="flex-1 rounded-2xl bg-red-650 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-red-750 active:scale-95 font-bold disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-subtle"
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
