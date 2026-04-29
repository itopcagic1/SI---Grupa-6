import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/authApi';

function Dashboard() {
  const navigate = useNavigate();
  const korisnik = JSON.parse(localStorage.getItem('korisnik'));

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        await logoutUser(token);
      }

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
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>

      {korisnik && (
        <p>
          Prijavljeni korisnik: {korisnik.punoIme || korisnik.email}
        </p>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;