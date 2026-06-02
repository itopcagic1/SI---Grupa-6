import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getNotifikacije, oznaciKaoProcitano, oznaciSveKaoProcitane } from '../api/notifikacijaApi';

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Notifikacije() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await getNotifikacije();
      setNotifications(data.notifikacije || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await oznaciKaoProcitano(id);
      // Lokalno ažuriraj stanje bez ponovnog kompletnog povlačenja sa backenda
      setNotifications((prev) =>
        prev.map((n) => (n.notifikacijaId === id ? { ...n, status: 'PROCITANO' } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await oznaciSveKaoProcitane();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'PROCITANO' })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="space-y-6">
          
          {/* Naslovna sekcija */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-amber-100 pb-6 gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Moje <span className="text-orange-600">Obavijesti</span>
              </h1>
              <p className="mt-1 text-slate-500 text-sm font-medium">
                Pratite rezultate utakmica i dešavanja vezana za vaše omiljene timove.
              </p>
            </div>
            {notifications.some((n) => n.status === 'NEPROCITANO') && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="rounded-2xl border-2 border-amber-100 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Onači sve kao pročitano
              </button>
            )}
          </div>

          {/* Sadržaj / Lista */}
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-bold">Učitavanje obavijesti...</div>
          ) : notifications.length === 0 ? (
            <div className="rounded-[32px] border-2 border-dashed border-amber-100 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 font-black text-xl mb-4">
                🔔
              </div>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">Nemate obavijesti</h3>
              <p className="mt-1 text-xs text-slate-400 font-semibold">
                Sve važne informacije o utakmicama i rezultatima će se pojaviti ovdje.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => {
                const isUnread = notif.status === 'NEPROCITANO';
                return (
                  <div
                    key={notif.notifikacijaId}
                    onClick={() => isUnread && handleMarkAsRead(notif.notifikacijaId)}
                    className={`rounded-3xl border-2 p-5 shadow-sm transition-all flex items-start justify-between gap-4 ${
                      isUnread
                        ? 'bg-white border-orange-200 hover:border-orange-400 cursor-pointer'
                        : 'bg-white/60 border-amber-100/70 opacity-80'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                            isUnread
                              ? 'bg-orange-50 text-orange-700 border-orange-100'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          {notif.tipNotifikacije || 'Sistem'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">
                          {formatDateTime(notif.vrijemeSlanja)}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${isUnread ? 'font-bold text-slate-800' : 'text-slate-600 font-medium'}`}>
                        {notif.sadrzajPoruke}
                      </p>
                    </div>

                    {isUnread && (
                      <span className="h-2 w-2 rounded-full bg-orange-600 mt-2 shrink-0 animate-pulse" title="Novo" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}