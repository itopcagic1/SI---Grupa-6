import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';

import {
  getVlasnikObjekti,
  getVlasnikRezervacije,
  verifikujZahtjevRezervacije,
  otkaziRezervacijuVlasnik,
} from '../api/vlasnikApi';

const PENDING_STATUSES = ['NA_CEKANJU', 'CEKANJE'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function todayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function addDaysInputValue(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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

function normalizeStatus(status) {
  return String(status || '').toUpperCase();
}

function statusClass(status) {
  const normalized = PENDING_STATUSES.includes(normalizeStatus(status))
    ? 'NA_CEKANJU'
    : normalizeStatus(status || 'NA_CEKANJU');

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
    ISTEKLO_VRIJEME_OTKAZIVANJA: 'Nije moguće otkazati rezervaciju unutar 24h prije termina.',
    RAZLOG_OBAVEZAN: 'Razlog otkazivanja mora imati najmanje 10 karaktera.',
  };
  return messages[code] || error.response?.data?.poruka || fallback;
}

function isZahtjevZaRezervaciju(zapis) {
  return zapis?.izvor === 'ZAHTJEV_ZA_REZERVACIJU';
}

function isPendingZahtjev(zapis) {
  return isZahtjevZaRezervaciju(zapis) && PENDING_STATUSES.includes(normalizeStatus(zapis.status));
}

function getDisplayStatus(status) {
  return PENDING_STATUSES.includes(normalizeStatus(status))
    ? 'NA_CEKANJU'
    : status || 'NA_CEKANJU';
}

function getKorisnikIme(zapis) {
  return zapis?.korisnik?.punoIme || zapis?.korisnik?.email || 'Nepoznat korisnik';
}

function getStatusPouzdanosti(zapis) {
  return normalizeStatus(zapis?.korisnik?.statusPouzdanosti || 'POUZDAN');
}

function getBrojPrekrsaja(zapis) {
  return zapis?.korisnik?.brojPrekrsenihRezervacija
    ?? zapis?.korisnik?.brojPreksrenihRezervacija
    ?? 0;
}

function getTerenNaziv(zapis) {
  return zapis?.teren?.naziv || 'Nepoznat teren';
}

function getDatumVrijeme(zapis) {
  return zapis?.datumVrijeme || zapis?.vrijemePocetka;
}

// TASK-3.5: Provjeri da li je manje od 24h do termina
function jeIstekloVrijeme(vrijemePocetkaTermina) {
  if (!vrijemePocetkaTermina) return true;
  const saatiDo = (new Date(vrijemePocetkaTermina) - new Date()) / (1000 * 60 * 60);
  return saatiDo < 24;
}

function UserName({ zapis }) {
  const nepouzdan = getStatusPouzdanosti(zapis) === 'NEPOUZDAN';
  const brojPrekrsaja = getBrojPrekrsaja(zapis);
  return (
    <span>
      {getKorisnikIme(zapis)}
      {nepouzdan && (
        <span className="ml-2 text-red-600" title="Nepouzdan korisnik">
          ⚠️ ({brojPrekrsaja} prekršaja)
        </span>
      )}
    </span>
  );
}

export default function VlasnikDashboard() {
  const [rezervacije, setRezervacije] = useState([]);
  const [objekti, setObjekti] = useState([]);
  const [selectedTerenId, setSelectedTerenId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [loadingObjekti, setLoadingObjekti] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // POPRAVLJENO: Dodana je podvlaka (_) kako destructuring niza ne bi bacao sintaksnu gresku
  const [_, setTimerTrigger] = useState(new Date());

  // Kolegicini statevi – odobravanje/odbijanje zahtjeva
  const [activeAction, setActiveAction] = useState(null);
  const [rejectModalZahtjev, setRejectModalZahtjev] = useState(null);
  const [razlogOdbijanja, setRazlogOdbijanja] = useState('');

  // TASK-3.4/3.5 – otkazivanje potvrđene rezervacije
  const [otkazivanjeId, setOtkazivanjeId] = useState(null);
  const [modalOtkazivanje, setModalOtkazivanje] = useState(null);

  const selectedTerenName = useMemo(() => {
    if (!selectedTerenId) return 'Svi tereni';
    const found = objekti.find((o) => String(o.objekatId) === String(selectedTerenId));
    return found?.naziv || 'Odabrani teren';
  }, [selectedTerenId, objekti]);

  const pendingZahtjevi = useMemo(
    () => rezervacije.filter(isPendingZahtjev),
    [rezervacije]
  );

  const isActionRunning = Boolean(activeAction);

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
      const defaultDatumOd = todayInputValue();
      const defaultDatumDo = addDaysInputValue(6);

      const response = await getVlasnikRezervacije({
        terenId: selectedTerenId,
        datumOd: selectedDate || defaultDatumOd,
        datumDo: selectedDate || defaultDatumDo,
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
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Nije moguće učitati rezervacije.'));
      setRezervacije([]);
      setPagination({ page: 1, limit: 15, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadObjekti(); }, []);
  useEffect(() => { loadRezervacije(1); }, [selectedTerenId, selectedDate]);

  const refreshCurrentPage = async () => {
    await loadRezervacije(pagination.page || 1);
  };

  // --- Handleri kolegice ---
  const handleOdobriZahtjev = async (zahtjev) => {
    setActiveAction({ id: zahtjev.id, akcija: 'ODOBRI' });
    try {
      const response = await verifikujZahtjevRezervacije(zahtjev.id, { akcija: 'ODOBRI' });
      showNotification('success', response.message || 'Zahtjev je odobren.');
      await refreshCurrentPage();
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Nije moguće odobriti zahtjev.'));
    } finally {
      setActiveAction(null);
    }
  };

  const openRejectModal = (zahtjev) => {
    setRejectModalZahtjev(zahtjev);
    setRazlogOdbijanja('');
  };

  const closeRejectModal = () => {
    if (isActionRunning) return;
    setRejectModalZahtjev(null);
    setRazlogOdbijanja('');
  };

  const handlePotvrdiOdbijanje = async () => {
    if (!rejectModalZahtjev || razlogOdbijanja.trim().length < 10) return;
    setActiveAction({ id: rejectModalZahtjev.id, akcija: 'ODBIJ' });
    try {
      const response = await verifikujZahtjevRezervacije(rejectModalZahtjev.id, {
        akcija: 'ODBIJ',
        razlogOdbijanja: razlogOdbijanja.trim(),
      });
      showNotification('success', response.message || 'Zahtjev je odbijen.');
      setRejectModalZahtjev(null);
      setRazlogOdbijanja('');
      await refreshCurrentPage();
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Nije moguće odbiti zahtjev.'));
    } finally {
      setActiveAction(null);
    }
  };

  // --- TASK-3.4/3.5 handleri ---
  const handleOtkazivanje = async () => {
    if (!modalOtkazivanje) return;
    setOtkazivanjeId(modalOtkazivanje.id);
    try {
      await otkaziRezervacijuVlasnik(modalOtkazivanje.id, modalOtkazivanje.razlog);
      showNotification('success', 'Rezervacija je uspješno otkazana.');
      setModalOtkazivanje(null);
      await refreshCurrentPage();
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Greška pri otkazivanju.'));
    } finally {
      setOtkazivanjeId(null);
    }
  };

  // --- Ovdje su dodate 3 funkcije koje su nedostajale podacima iz tabele ---
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleCancelReservation = (id) => {
    setModalOtkazivanje({
      id: id,
      razlog: ''
    });
  };

  const isCancellationDisabled = (vrijemePocetkaTermina, status) => {
    if (normalizeStatus(status) === 'OTKAZANO' || normalizeStatus(status) === 'CANCELLED') {
      return true;
    }
    return jeIstekloVrijeme(vrijemePocetkaTermina);
  };

  return (
    <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-8">

        {/* Naslov */}
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
              {selectedTerenName} · {selectedDate || 'Narednih 7 dana'}
            </div>
          </div>
        </div>

        {/* Notifikacija */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-2xl border-2 font-bold text-sm shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Analytics kartice */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[28px] border-2 border-amber-100 shadow-sm p-6">
            <div className="text-xs font-black uppercase tracking-widest text-amber-900/60">
              Ukupno pronađenih rezervacija
            </div>

            <div className="text-4xl font-black text-slate-800 mt-3">
              {pagination.total ?? rezervacije.length}
            </div>

            <p className="text-sm font-medium text-slate-400 mt-2">
              Rezervacije koje odgovaraju trenutno odabranom terenu i datumu/opsegu.
            </p>
          </div>
          <div className="bg-white rounded-[28px] border-2 border-amber-100 shadow-sm p-6">
            <div className="text-xs font-black uppercase tracking-widest text-amber-900/60">
              Zahtjevi na čekanju
            </div>

            <div className="text-4xl font-black text-orange-600 mt-3">
              {pendingZahtjevi.length}
            </div>

            <p className="text-sm font-medium text-slate-400 mt-2">
              Zahtjevi iz trenutnog pregleda koji čekaju obradu ili potvrdu.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:items-end">
            <div>
              <h2 className="text-lg font-black text-amber-950 uppercase tracking-wide">
                Filteri
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1 max-w-xl">
                Početni prikaz obuhvata sve Vaše objekte u narednih 7 dana. Promjena terena ili datuma automatski osvježava tabelu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[280px_220px_auto] gap-3 items-end">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                  Teren
                </label>

                <select
                  value={selectedTerenId}
                  onChange={(e) => setSelectedTerenId(e.target.value)}
                  disabled={loadingObjekti}
                  className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
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
                  className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="h-10 mb-1 px-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-amber-100 transition-colors whitespace-nowrap"
              >
                7 dana
              </button>
            </div>
          </div>
        </section>

        {/* Sekcija – zahtjevi nepouzdanih (kolegica TASK-2.4) */}
        <section className="bg-white rounded-[32px] border-2 border-red-100 shadow-sm p-6 mb-8 w-full overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-black text-red-700 uppercase tracking-wide">
                Zahtjevi nepouzdanih korisnika na čekanju
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Ručna potvrda termina za korisnike koji zahtijevaju provjeru.
              </p>
            </div>

            <span className="inline-flex w-fit px-3 py-1 rounded-xl border border-red-100 bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest">
              {pendingZahtjevi.length} na čekanju
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm font-bold text-slate-400">Učitavanje zahtjeva...</div>
          ) : pendingZahtjevi.length === 0 ? (
            <div className="py-8 text-center text-sm font-bold text-slate-400">
              Trenutno nema zahtjeva na čekanju.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-red-100 bg-red-50/40 text-xs font-black uppercase tracking-widest text-red-900/60">
                    <th className="pb-4 pt-2 px-6">Korisnik</th>
                    <th className="pb-4 pt-2 px-6">Teren</th>
                    <th className="pb-4 pt-2 px-6">Datum i vrijeme</th>
                    <th className="pb-4 pt-2 px-6">Tip termina</th>
                    <th className="pb-4 pt-2 px-6 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50 text-sm">
                  {pendingZahtjevi.map((zahtjev) => {
                    const odobriLoading = activeAction?.id === zahtjev.id && activeAction?.akcija === 'ODOBRI';
                    const odbijLoading = activeAction?.id === zahtjev.id && activeAction?.akcija === 'ODBIJ';
                    return (
                      <tr key={`pending-${zahtjev.id}`} className="hover:bg-red-50/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800"><UserName zapis={zahtjev} /></div>
                          <div className="text-xs text-slate-400 font-medium mt-1">
                            {getStatusPouzdanosti(zahtjev)} · Prekršeno: {getBrojPrekrsaja(zahtjev)}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-600">{getTerenNaziv(zahtjev)}</td>
                        <td className="py-4 px-6 font-semibold text-slate-700">{formatDateTime(getDatumVrijeme(zahtjev))}</td>
                        <td className="py-4 px-6 font-semibold text-slate-600">{zahtjev.tipTermina || '-'}</td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOdobriZahtjev(zahtjev)}
                              disabled={isActionRunning}
                              className="px-4 py-2 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {odobriLoading ? 'Odobravanje...' : 'Odobri'}
                            </button>

                            <button
                              type="button"
                              onClick={() => openRejectModal(zahtjev)}
                              disabled={isActionRunning}
                              className="px-4 py-2 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {odbijLoading ? 'Odbijanje...' : 'Odbij'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Sekcija – monitoring svih rezervacija */}
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

          {/* Paginacija */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-5 border-t border-amber-100">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">
              Stranica {pagination.page || 1} od {pagination.totalPages || 1}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => pagination.page > 1 && loadRezervacije(pagination.page - 1)}
                disabled={loading || pagination.page <= 1}
                className="px-4 py-2.5 bg-white border-2 border-amber-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                Prethodna
              </button>
              <button
                type="button"
                onClick={() => pagination.page < pagination.totalPages && loadRezervacije(pagination.page + 1)}
                disabled={loading || pagination.page >= pagination.totalPages}
                className="px-4 py-2.5 bg-white border-2 border-amber-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                Sljedeća
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal – odbijanje zahtjeva (kolegica TASK-2.5) */}
      {rejectModalZahtjev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Odbij zahtjev</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Unesite razlog odbijanja termina
                </p>
              </div>

              <button
                type="button"
                onClick={closeRejectModal}
                disabled={isActionRunning}
                className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Zatvori
              </button>
            </div>
            <div className="mt-6 rounded-3xl border border-red-100 bg-red-50/50 p-4">
              <div className="text-sm font-bold text-slate-800">
                <UserName zapis={rejectModalZahtjev} />
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-500">
                {getTerenNaziv(rejectModalZahtjev)} · {formatDateTime(getDatumVrijeme(rejectModalZahtjev))}
              </div>
            </div>
            <label className="mt-5 block text-xs font-black uppercase tracking-widest text-slate-500">
              Razlog odbijanja
            </label>

            <textarea
              value={razlogOdbijanja}
              onChange={(e) => setRazlogOdbijanja(e.target.value)}
              disabled={isActionRunning}
              rows={5}
              className="mt-2 w-full resize-none rounded-3xl border-2 border-slate-100 bg-white p-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-red-400 disabled:opacity-60"
              placeholder="Unesite najmanje 10 karaktera..."
            />

            <div className="mt-2 text-xs font-bold text-slate-400">
              {razlogOdbijanja.trim().length}/10 karaktera
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={isActionRunning}
                className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-widest text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Odustani
              </button>

              <button
                type="button"
                onClick={handlePotvrdiOdbijanje}
                disabled={isActionRunning || razlogOdbijanja.trim().length < 10}
                className="rounded-3xl bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-widest text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeAction?.akcija === 'ODBIJ' ? 'Slanje...' : 'Potvrdi odbijanje'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASK-3.4 – Modal za otkazivanje potvrđene rezervacije */}
      {modalOtkazivanje && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-black text-slate-800 mb-2">Otkazivanje rezervacije</h2>
            <p className="text-sm text-slate-500 mb-6">
              Unesite razlog otkazivanja. Korisnik će biti obaviješten.
            </p>
            <textarea
              rows={4}
              placeholder="Unesite razlog otkazivanja (min. 10 karaktera)..."
              value={modalOtkazivanje.razlog}
              onChange={(e) => setModalOtkazivanje((prev) => ({ ...prev, razlog: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-amber-100 rounded-2xl outline-none focus:border-orange-500 text-sm font-medium text-slate-700 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 mb-6">
              {modalOtkazivanje.razlog.length}/10 karaktera minimum
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalOtkazivanje(null)}
                disabled={otkazivanjeId === modalOtkazivanje.id}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={handleOtkazivanje}
                disabled={
                  modalOtkazivanje.razlog.trim().length < 10 ||
                  otkazivanjeId === modalOtkazivanje.id
                }
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otkazivanjeId === modalOtkazivanje.id ? 'Otkazivanje...' : 'Potvrdi otkazivanje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}