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
      setRezervacije(data.rezervacije || []);
    } catch {
      showNotification('error', 'Greška pri učitavanju rezervacija.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCancel = (item) => {
    setCancelReason('');
    setConfirmModal({ open: true, item });
  };

  const handleCancel = async () => {
    const { item } = confirmModal;
    setSubmitting(true);
    try {
      if (item.tip === 'INDIVIDUALNI') {
        await cancelIndividualTerm(item.terminId);
      } else {
        await odjaviSeSaGrupnogTreninga(item.treningId, cancelReason);
      }
      showNotification('success', 'Rezervacija je uspješno otkazana.');
      setConfirmModal({ open: false, item: null });
      load();
    } catch (err) {
      showNotification('error', err.response?.data?.poruka || 'Otkazivanje nije uspjelo.');
    } finally {
      setSubmitting(false);
    }
  };

  const under24h = (vrijemePocetka) =>
    new Date(vrijemePocetka) - new Date() < 24 * 60 * 60 * 1000;

  const statusBadge = (status) => {
    const map = {
      POTVRDJENA: 'bg-green-50 text-green-700 border-green-200',
      NA_CEKANJU: 'bg-amber-50 text-amber-700 border-amber-200',
      OTKAZANA: 'bg-red-50 text-red-700 border-red-200',
    };
    const label = {
      POTVRDJENA: 'Potvrđena',
      NA_CEKANJU: 'Na čekanju',
      OTKAZANA: 'Otkazana',
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${map[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
        {label[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="space-y-8">

          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b-2 border-amber-100 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Moje <span className="text-orange-600">rezervacije</span>
              </h1>
              <p className="mt-1 text-slate-500 text-sm font-medium">
                Pregled svih nadolazećih termina
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 px-5 py-3 text-orange-950 shadow-sm text-sm border-2 border-orange-100/50 font-bold">
              Nadolazećih termina: <span className="text-orange-600 ml-1">{rezervacije.length}</span>
            </div>
          </div>

          {/* Notifikacija */}
          {notification && (
            <div className={`rounded-2xl border-2 px-4 py-3.5 text-sm font-bold shadow-sm ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {notification.message}
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : rezervacije.length === 0 ? (
            <div className="rounded-[2.5rem] border border-dashed border-amber-200 bg-amber-50/10 p-12 text-center text-slate-400 font-medium">
              Nemate nadolazećih rezervacija.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rezervacije.map((r, i) => (
                <div key={i} className="rounded-[2.5rem] border-2 border-amber-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                  <div className="space-y-3">

                    {/* Tip + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                        r.tip === 'INDIVIDUALNI'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {r.tip === 'INDIVIDUALNI' ? '👤 Individualni' : '👥 Grupni'}
                      </span>
                      {statusBadge(r.status)}
                    </div>

                    {/* Objekat */}
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-orange-600">
                        {r.objekat || 'Sportski objekat'}
                      </div>
                      {r.adresa && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{r.adresa}</div>
                      )}
                    </div>

                    {/* Datum i Vrijeme */}
                    <div className="rounded-2xl bg-amber-50/40 border border-amber-100 p-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-semibold uppercase tracking-wide">Datum</span>
                        <span className="font-black text-slate-800">{formatDate(r.vrijemePocetka)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-semibold uppercase tracking-wide">Vrijeme</span>
                        <span className="font-black text-slate-800">
                          {formatTime(r.vrijemePocetka)} – {formatTime(r.vrijemeZavrsetka)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-semibold uppercase tracking-wide">Rezervisano</span>
                        <span className="font-bold text-slate-500">{formatDate(r.datumKreiranja)}</span>
                      </div>
                    </div>

                    {/* Trener (samo grupni) */}
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

                    {/* Upozorenje 24h */}
                    {under24h(r.vrijemePocetka) && (
                      <div className="rounded-2xl bg-red-50 border-2 border-red-100 px-3 py-2 text-[10px] font-black text-red-700 leading-relaxed">
                        ⚠️ Otkazivanje unutar 24h dodjeljuje 1 prekršajni poen!
                      </div>
                    )}
                  </div>

                  {/* Dugme za otkazivanje */}
                  <button
                    type="button"
                    onClick={() => openCancel(r)}
                    className="mt-5 w-full rounded-2xl border-2 border-red-100 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50/20"
                  >
                    Otkaži termin
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Confirm Modal */}
      {confirmModal.open && confirmModal.item && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl border-2 border-amber-100 space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-800">Otkaži rezervaciju</h3>
              <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
                Da li ste sigurni da želite otkazati ovaj termin?
              </p>
              {under24h(confirmModal.item.vrijemePocetka) && (
                <div className="mt-3 rounded-2xl bg-red-50 border-2 border-red-100 p-3 text-xs font-black text-red-700 leading-relaxed">
                  ⚠️ Pažnja: Otkazujete termin unutar 24 sata prije početka. Ova akcija će Vam dodijeliti 1 prekršajni poen. Ukoliko sakupite 3 prekršaja, Vaš profil će biti označen kao nepouzdan.
                </div>
              )}
            </div>

            {/* Razlog za grupni */}
            {confirmModal.item.tip === 'GRUPNI' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2">
                  Razlog odjave (obavezno)
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
                onClick={() => setConfirmModal({ open: false, item: null })}
                className="flex-1 rounded-2xl bg-amber-50 border border-amber-200 py-3 text-xs font-black uppercase tracking-wider text-amber-900 transition hover:bg-amber-100"
              >
                Odustani
              </button>
              <button
                type="button"
                disabled={submitting || (confirmModal.item.tip === 'GRUPNI' && !cancelReason.trim())}
                onClick={handleCancel}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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