import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getMojeRezervacije, cancelIndividualTerm, odjaviSeSaGrupnogTreninga } from '../api/reservationApi';

function pad(v) { return String(v).padStart(2, '0'); }
function formatDate(d) {
  const date = new Date(d);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}.`;
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
}

// --- TASK-6.6: Pomoćna JavaScript funkcija za provjeru preostalog vremena ---
function jeUnutar24Sata(datumTerminaString) {
  if (!datumTerminaString) return false;
  const sada = new Date();
  const pocetakTermina = new Date(datumTerminaString);
  
  // Razlika u milisekundama
  const razlikaUMilisekundama = pocetakTermina.getTime() - sada.getTime();
  
  // Pretvaramo milisekunde u sate (1 sat = 1000ms * 60s * 60m)
  const preostaloSati = razlikaUMilisekundama / (1000 * 60 * 60);
  
  // Vraća true ako je termin u budućnosti, ali je ostalo manje od 24 sata do njega
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
      setRezervacije(data.rezervacije || data);
    } catch (err) {
      showNotification('error', err.message || 'Greška pri učitavanju.');
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
    try {
      if (confirmModal.item.tip === 'INDIVIDUALNI') {
        // Za individualni termin prosjeđujemo ID termina (ili rezervacije zavisno od tvog API-ja)
        await cancelIndividualTerm(confirmModal.item.id);
        showNotification('success', 'Uspješno otkazan individualni termin.');
      } else {
        await odjaviSeSaGrupnogTreninga(confirmModal.item.id, cancelReason);
        showNotification('success', 'Uspješno ste se odjavili sa grupnog treninga.');
      }
      setConfirmModal({ open: false, item: null });
      setCancelReason('');
      load();
    } catch (err) {
      showNotification('error', err.message || 'Greška pri otkazivanju.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900 mb-2">
          Moje Rezervacije
        </h1>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-8">
          Pregled svih tvojih predstojećih termina i treninga
        </p>

        {notification && (
          <div className={`mb-6 p-4 rounded-2xl border-2 text-xs font-bold ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Učitavanje rezervacija...
          </div>
        ) : rezervacije.length === 0 ? (
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Nemate predstojećih rezervacija.
            </p>
          </div>
        ) : (
          /* TASK-6.4: Korisnički ekran "Moje rezervacije" u obliku liste/kartica */
          <div className="grid gap-4">
            {rezervacije.map((item) => {
              const isIndividual = item.tip === 'INDIVIDUALNI';
              return (
                <div key={item.id} className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl font-black text-center min-w-[64px] ${
                      isIndividual ? 'bg-orange-50 text-orange-600' : 'bg-sky-50 text-sky-600'
                    }`}>
                      <span className="block text-xs uppercase tracking-widest font-bold">
                        {isIndividual ? 'Indiv' : 'Grupni'}
                      </span>
                      <span className="block text-lg mt-0.5">
                        {formatTime(item.start || item.datum)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {isIndividual ? 'Individualni trening' : (item.naziv || 'Grupni trening')}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {formatDate(item.start || item.datum)}
                      </p>
                      {item.vlasnikRazlog && (
                        <p className="text-xs text-red-600 font-bold mt-1 bg-red-50 border border-red-100 px-2 py-1 rounded-xl inline-block">
                          Otkazano od strane vlasnika: {item.vlasnikRazlog}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TASK-6.5: Crveno dugme "Otkaži termin" pored svake rezervacije */}
                  <button
                    type="button"
                    onClick={() => setConfirmModal({ open: true, item })}
                    className="sm:self-center px-5 py-3 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 text-center"
                  >
                    Otkaži termin
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POTVRDNI MODALNI PROZOR */}
      {confirmModal.open && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 max-w-md w-full shadow-xl animate-scale-up">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-2">
              Otkazivanje termina
            </h2>
            
            {/* Osnovno pitanje iz TASK-6.5 */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Da li ste sigurni da želite otkazati ovaj termin?
            </p>

            {/* --- TASK-6.6: Dinamičko crveno upozorenje ako je ostalo manje od 24 sata --- */}
            {confirmModal.item.tip === 'INDIVIDUALNI' && jeUnutar24Sata(confirmModal.item.start) && (
              <div className="mb-5 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-xs text-red-800 font-black uppercase tracking-wide leading-relaxed shadow-sm animate-pulse">
                Pažnja: Otkazujete termin unutar 24 sata prije njegovog početka. 
                Ova akcija će Vam dodijeliti 1 prekršajni poen. 
                Ukoliko sakupite 3 prekršaja, Vaš profil će biti označen kao nepouzdan.
              </div>
            )}

            {confirmModal.item.tip === 'GRUPNI' && (
              <div className="mb-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                  Razlog odjave (Obavezno za grupne treninge)
                </label>
                <textarea
                  rows="3"
                  placeholder="Unesite razlog odjave..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-amber-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-semibold text-xs shadow-sm resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmModal({ open: false, item: null });
                  setCancelReason('');
                }}
                className="flex-1 rounded-2xl bg-amber-50 border border-amber-200 py-3 text-xs font-black uppercase tracking-wider text-amber-900 transition hover:bg-amber-100 font-bold"
              >
                Odustani
              </button>
              <button
                type="button"
                disabled={submitting || (confirmModal.item.tip === 'GRUPNI' && !cancelReason.trim())}
                onClick={handleCancel}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                {submitting ? 'Otkazivanje...' : 'Potvrdi otkazivanje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}