import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const korisnik = JSON.parse(localStorage.getItem('korisnik'));

  if (!korisnik) {
    return <Navigate to="/login" replace />;
  }

  if (korisnik.trenutnaUloga !== 'ADMINISTRATOR') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa',
        gap: '1rem',
      }}>
        <span style={{ fontSize: '4rem' }}>🚫</span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
          Nemate pristup ovoj stranici
        </h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Ova stranica je dostupna samo administratorima.
        </p>
        <a
          href="/dashboard"
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1.2rem',
            background: '#ea580c',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          Nazad na Dashboard
        </a>
      </div>
    );
  }

  return children;
}
