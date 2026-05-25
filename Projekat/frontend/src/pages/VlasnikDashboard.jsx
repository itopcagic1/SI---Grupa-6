import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { getVlasnikObjekti, getVlasnikRezervacije } from '../api/vlasnikApi';
import { differenceInHours } from 'date-fns';

function pad(value) {
  return String(value).padStart(2, '0');
}

function todayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status) {
  const normalized = status || 'NA_CEKANJU';

  const classes = {
    POTVRDJENO: 'bg-green-50 text-green-700 border-green-200',
    POTVRDJENA: 'bg-green-50 text-green-700 border-green-200',
    CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
    NA_CEKANJU: 'bg-amber-50 text-amber-800 border-amber-200',
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    OTKAZANO: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  };

  return classes[normalized] || 'bg-slate-50 text-slate-700 border-slate-200';
}

function getApiErrorMessage(error, fallback) {
  const code = error.response?.data?.greska || error.response?.data?.error;

  const messages = {
    TOKEN_ISTEKAO: 'Sesija je istekla. Prijavite se ponovo.',
    NEOVLASTEN: 'Morate biti prijavljeni kao vlasnik.',
    ZABRANJEN_PRISTUP: 'Ovaj pregled je dostupan samo vlasnicima.',
    NEVALIDAN_ID: 'Odabrani teren nije validan.',
    NEVALIDAN_DATUM: 'Odabrani datum nije validan.',
    NEVALIDNA_STRANICA: 'Broj stranice nije validan.',
    NEVALIDAN_LIMIT: 'Limit rezultata nije validan.',
    VALIDATION_ERROR: 'Razlog otkazivanja je obavezan.',
    FORBIDDEN: 'Zabranjeno. Otkazivanje je moguće najkasnije 24h prije termina.',
  };

  return messages[code] || error.response?.data?.message || error.response?.data?.poruka || fallback;
}

export default function VlasnikDashboard() {
  const [rezervacije, setRezervacije] = useState([]);
  const [objekti, setObjekti] = useState([]);
  const [selectedTerenId, setSelectedTerenId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  const [analytics, setAnalytics] = useState({
    ukupnoRezervacijaDanas: 0,
    zahtjeviNaCekanju: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [loadingObjekti, setLoadingObjekti] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  const [, setTimerTrigger] = useState(new Date());

  const selectedTerenName = useMemo(() => {
    if (!selectedTerenId) return 'Svi tereni';
    const found = objekti.find((objekat) => String(objekat.objekatId) === String(selectedTerenId));
    return found?.naziv || 'Odabrani teren';
  }, [selectedTerenId, objekti]);

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const loadObjekti = async () => {
    setLoadingObjekti(true);

    try {
      const response = await getVlasnikObjekti();
      setObjekti(Array.isArray(response) ? response : []);
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Nije moguće učitati sportske objekte.'));
      setObjekti([]);
    } finally {
      setLoadingObjekti(false);
    }
  };

  const loadRezervacije = async (page = 1) => {
    setLoading(true);

    try {
      const response = await getVlasnikRezervacije({
        terenId: selectedTerenId,
        datumOd: selectedDate,
        page,
        limit: 15,
      });

      setRezervacije(Array.isArray(response.data) ? response.data : []);
      setPagination(response.pagination || {
        page,
        limit: 15,
        total: 0,
        totalPages: 1,
      });
      setAnalytics(response.analytics || {
        ukupnoRezervacijaDanas: 0,
        zahtjeviNaCekanju: 0,
      });
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Nije moguće učitati rezervacije.'));
      setRezervacije([]);
      setPagination({
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObjekti();
  }, []);

  useEffect(() => {
    loadRezervacije(1);
  }, [selectedTerenId, selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTrigger(new Date());
    }, 60000); 

    return () => clearInterval(interval);
  }, []);

  const isCancellationDisabled = (termStartTime, status) => {
    const activeStatus = status || '';
    if (activeStatus !== 'POTVRDJENO' && activeStatus !== 'POTVRDJENA' && activeStatus !== 'CONFIRMED') {
      return true; 
    }

    const now = new Date();
    const termDate = new Date(termStartTime);
    const hoursLeft = differenceInHours(termDate, now);

    return hoursLeft < 24; 
  };

  const handleCancelReservation = async (reservationId) => {
    const reason = prompt("Please enter the mandatory reason for cancellation:");
    
    if (!reason || reason.trim() === "") {
      alert("Cancellation aborted. A reason is required!");
      return;
    }

    try {
      const response = await fetch(`/api/vlasnik/rezervacije/${reservationId}/otkazivanje`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw { response: { data } }; 
      }

      showNotification('success', 'Rezervacija je uspješno otkazana.');
      loadRezervacije(pagination.page || 1); 
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Nije moguće otkazati rezervaciju.'));
    }
  };

  const handleTerenChange = (event) => {
    setSelectedTerenId(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      loadRezervacije(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      loadRezervacije(pagination.page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Vlasnički <span className="text-orange-600">Dashboard</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Pregled rezervacija, zahtjeva i popunjenosti za Vaše sportske objekte.
            </p>
          </div>

          <div className="bg-white border-2 border-amber-100 rounded-2xl px-4 py-3 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-900/60">
              Trenutni filter
            </div>
            <div className="text-sm font-black text-slate-800 mt-1">
              {selectedTerenName} · {selectedDate || 'Svi datumi'}
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className={`mb-6 p-4 rounded-2xl border-2 font-bold text-sm shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[28px] border-2 border-amber-100 shadow-sm p-6">
            <div className="text-xs font-black uppercase tracking-widest text-amber-900/60">
              Ukupno rezervacija danas
            </div>
            <div className="text-4xl font-black text-slate-800 mt-3">
              {analytics.ukupnoRezervacijaDanas ?? 0}
            </div>
            <p className="text-sm font-medium text-slate-400 mt-2">
              Potvrđene i evidentirane rezervacije za današnji dan.
            </p>
          </div>

          <div className="bg-white rounded-[28px] border-2 border-amber-100 shadow-sm p-6">
            <div className="text-xs font-black uppercase tracking-widest text-amber-900/60">
              Zahtjevi na čekanju
            </div>
            <div className="text-4xl font-black text-orange-600 mt-3">
              {analytics.zahtjeviNaCekanju ?? 0}
            </div>
            <p className="text-sm font-medium text-slate-400 mt-2">
              Rezervacije koje još čekaju obradu ili potvrdu.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-amber-950 uppercase tracking-wide">
                Filteri
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Promjena terena ili datuma automatski osvježava tabelu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                  Teren
                </label>
                <select
                  value={selectedTerenId}
                  onChange={handleTerenChange}
                  disabled={loadingObjekti}
                  className="w-full lg:w-72 px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                >
                  <option value="">Svi tereni</option>
                  {objekti.map((objekat) => (
                    <option key={objekat.objekatId} value={objekat.objekatId}>
                      {objekat.naziv}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                  Datum
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full lg:w-56 px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 w-full overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-black text-amber-950 uppercase tracking-wide">
                Monitoring rezervacija
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Ukupno pronađeno: {pagination.total ?? 0}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadRezervacije(pagination.page || 1)}
              className="h-11 px-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20 active:scale-95"
            >
              Osvježi
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm font-bold text-slate-400">
              Učitavanje rezervacija...
            </div>
          ) : rezervacije.length === 0 ? (
            <div className="py-12 text-center text-sm font-bold text-slate-400">
              Nema rezervacija za odabrane filtere.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-amber-100 bg-amber-50/40 text-xs font-black uppercase tracking-widest text-amber-900/60">
                    <th className="pb-4 pt-2 px-6">Korisnik</th>
                    <th className="pb-4 pt-2 px-6">Teren</th>
                    <th className="pb-4 pt-2 px-6">Datum i vrijeme</th>
                    <th className="pb-4 pt-2 px-6">Tip termina</th>
                    <th className="pb-4 pt-2 px-6">Status</th>
                    <th className="pb-4 pt-2 px-6">Akcije</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-amber-50 text-sm">
                  {rezervacije.map((rezervacija) => {
                    // provjera da li dugme otkazivanja treba biti onemoguceno
                    const termStart = rezervacija.datumVrijeme || rezervacija.vrijemePocetka;
                    const isDisabled = isCancellationDisabled(termStart, rezervacija.status);

                    return (
                      <tr key={`${rezervacija.izvor}-${rezervacija.id}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {rezervacija.korisnik?.punoIme || 'Nepoznat korisnik'}
                          </div>
                          <div className="text-xs text-slate-400 font-medium mt-1">
                            {rezervacija.korisnik?.statusPouzdanosti || 'POUZDAN'} · Prekršeno: {rezervacija.korisnik?.brojPrekrsenihRezervacija ?? 0}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-600">
                          {rezervacija.teren?.naziv || 'Nepoznat teren'}
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-700">
                          {formatDateTime(termStart)}
                        </td>

                        <td className="py-4 px-6 font-semibold text-slate-600">
                          {rezervacija.tipTermina || '-'}
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusClass(rezervacija.status)}`}>
                            {rezervacija.status || 'NA_CEKANJU'}
                          </span>
                        </td>

                        {/*dugme otkazivanja*/}
                        <td className="py-4 px-6">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleCancelReservation(rezervacija.id)}
                            className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              isDisabled
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 active:scale-95 shadow-sm'
                            }`}
                          >
                            Cancel Term
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-5 border-t border-amber-100">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">
              Stranica {pagination.page || 1} od {pagination.totalPages || 1}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={loading || pagination.page <= 1}
                className="px-4 py-2.5 bg-white border-2 border-amber-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                Prethodna
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={loading || pagination.page >= pagination.totalPages}
                className="px-4 py-2.5 bg-white border-2 border-amber-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                Sljedeća
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}