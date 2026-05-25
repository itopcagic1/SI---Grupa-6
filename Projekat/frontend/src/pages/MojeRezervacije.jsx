import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getMojeRezervacije, cancelIndividualTerm, odjaviSeSaGrupnogTreninga } from '../api/reservationApi';

function pad(v) { return String(v).padStart(2, '0'); }
function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}.`;
}
function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
}

function jeUnutar24Sata(datumTerminaString) {
  if (!datumTerminaString) return false;
  const sada = new Date();
  const pocetakTermina = new Date(datumTerminaString);
  const razlikaUMilisekundama = pocetakTermina.getTime() - sada.getTime();
  const preostaloSati = razlikaUMilisekundama / (1000 * 60 * 60);
  return preostaloSati > 0 && preostaloSati < 24;
}

export default function MojeRezervacije() {
  const [rezervacije, setRezervacije] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, item: null });
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMojeRezervacije();
      setRezervacije(Array.isArray(data) ? data : data.rezervacije || []);
    } catch (err) {
      showNotification('error', err.response?.data?.poruka || 'Greška pri učitavanju.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async () => {
    if (!confirmModal.item) return;
    setSubmitting(true);
    
    const terminId = confirmModal.item.terminId || confirmModal.item.terminObjekta?.terminId;

    try {
      const isIndividual = confirmModal.item.tip === 'INDIVIDUALNI' || confirmModal.item.terminObjekta?.tip === 'INDIVIDUALNI' || !confirmModal.item.treningId;

      if (isIndividual) {
        if (!terminId) throw new Error("ID termina nije pronađen.");
        const response = await cancelIndividualTerm(terminId);
        showNotification('success', response?.poruka || 'Uspješno procesuiran zahtjev.');
      } else {
        const idZaSlanje = confirmModal.item.treningId || confirmModal.item.id;
        if (!idZaSlanje) throw new Error("ID grupnog treninga nije pronađen.");
        const response = await odjaviSeSaGrupnogTreninga(idZaSlanje, cancelReason);
        showNotification('success', response?.poruka || 'Uspješno poslat zahtjev za odjavu.');
      }
      
      setConfirmModal({ open: false, item: null });
      setCancelReason('');
      load();
    } catch (err) {
      showNotification('error', err.response?.data?.poruka || err.message || 'Greška pri otkazivanju.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900 mb-2">Moje Rezervacije</h1>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-8">Pregled i upravljanje vašim terminima</p>

        {notification && (
          <div className={`mb-6 p-4 rounded-2xl border-2 text-xs font-bold ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
            {notification.message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Učitavanje...</div>
        ) : rezervacije.length === 0 ? (
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nemate predstojećih rezervacija.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rezervacije.map((item) => {
              const isIndividual = item.tip === 'INDIVIDUALNI' || item.terminObjekta?.tip === 'INDIVIDUALNI' || !item.treningId;
              const vrijemePocetka = item.vrijemePocetka || item.terminObjekta?.vrijemePocetka;
              
              return (
                <div key={item.rezervacijaId || item.id} className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl font-black text-center min-w-[64px] ${isIndividual ? 'bg-orange-50 text-orange-600' : 'bg-sky-50 text-sky-600'}`}>
                      <span className="block text-xs uppercase tracking-widest font-bold">{isIndividual ? 'Indiv' : 'Grupni'}</span>
                      <span className="block text-lg mt-0.5">{formatTime(vrijemePocetka)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {isIndividual ? 'Individualni trening' : (item.naziv || 'Grupni trening')}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">{formatDate(vrijemePocetka)}</p>
                      <span className="inline-block mt-2 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl bg-slate-100 text-slate-600">
                        Status: {item.status}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setConfirmModal({ open: true, item })} className="px-5 py-3 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-center">
                    Otkaži termin
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmModal.open && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-2">Otkazivanje termina</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Potvrdite vašu akciju:</p>

            {jeUnutar24Sata(confirmModal.item.vrijemePocetka || confirmModal.item.terminObjekta?.vrijemePocetka) && (
              <div className="mb-5 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-xs text-red-800 font-black uppercase tracking-wide">
                Pažnja: Otkazujete unutar 24 sata prije početka. Zahtjev ide na odobrenje vlasniku.
              </div>
            )}

            {!(confirmModal.item.tip === 'INDIVIDUALNI' || confirmModal.item.terminObjekta?.tip === 'INDIVIDUALNI') && (
              <div className="mb-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Razlog odjave *</label>
                <textarea rows="3" placeholder="Unesite razlog..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-amber-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none text-xs resize-none font-semibold" />
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => { setConfirmModal({ open: false, item: null }); setCancelReason(''); }} className="flex-1 rounded-2xl bg-amber-50 border border-amber-200 py-3 text-xs font-black uppercase tracking-wider text-amber-900 transition hover:bg-amber-100">Odustani</button>
              <button type="button" disabled={submitting || (!(confirmModal.item.tip === 'INDIVIDUALNI' || confirmModal.item.terminObjekta?.tip === 'INDIVIDUALNI') && !cancelReason.trim())} onClick={handleCancel} className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Otkazivanje...' : 'Potvrdi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}