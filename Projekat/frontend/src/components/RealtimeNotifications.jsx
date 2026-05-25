import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { disconnectSocket, getSocket } from '../realtime/socket';

export default function RealtimeNotifications() {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const handleTerminOslobodjen = (payload) => {
      setNotification({
        message: payload?.poruka || 'Termin za koji ste bili na listi cekanja je upravo oslobodjen.',
        terminId: payload?.terminId || payload?.termin?.terminId,
      });
    };

    socket.on('termin-oslobodjen', handleTerminOslobodjen);

    return () => {
      socket.off('termin-oslobodjen', handleTerminOslobodjen);
      disconnectSocket();
    };
  }, [location.key]);

  useEffect(() => {
    if (!notification) return undefined;

    const timeoutId = setTimeout(() => setNotification(null), 7000);
    return () => clearTimeout(timeoutId);
  }, [notification]);

  if (!notification) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setNotification(null);
        navigate('/rezervacije/individualne');
      }}
      className="fixed bottom-5 right-5 z-[60] max-w-sm rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-left text-sm font-semibold text-emerald-900 shadow-xl shadow-slate-900/10 transition hover:bg-emerald-50"
    >
      {notification.message}
    </button>
  );
}
