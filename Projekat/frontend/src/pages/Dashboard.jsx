import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/authApi';

function Dashboard() {
  const navigate = useNavigate();
  const korisnik = JSON.parse(localStorage.getItem('korisnik'));

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) await logoutUser(token);
      localStorage.removeItem('token');
      localStorage.removeItem('korisnik');
      navigate('/login');
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('korisnik');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
            {korisnik && (
              <p className="mt-3 text-sm text-slate-600">
                Prijavljeni korisnik: <span className="font-bold text-slate-900">{korisnik.punoIme || korisnik.email}</span>
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              to="/teams"
              className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-orange-700"
            >
              Timovi
            </Link>

            <Link
              to="/lige"
              className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-orange-700"
            >
              Lige
            </Link>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-orange-700"
            >
              Moj Profil
            </Link>

            {korisnik?.trenutnaUloga === 'TRENER' && (
              <>
                <Link
                  to="/prijava-ekipe"
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-orange-700"
                >
                  Prijava ekipe
                </Link>

                <Link
                  to="/moje-prijave"
                  className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-orange-700"
                >
                  Moje prijave
                </Link>
              </>
            )}

            {korisnik?.trenutnaUloga === 'ADMINISTRATOR' && (
              <Link
                to="/admin/korisnici"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-800 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-slate-900"
              >
                Korisnici
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-orange-700"
            >
              Odjava
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;