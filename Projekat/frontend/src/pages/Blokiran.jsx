import { useNavigate } from 'react-router-dom';

export default function Blokiran() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '3rem 2.5rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #fee2e2',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>

        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 900,
          color: '#0f172a',
          margin: '0 0 0.75rem',
          letterSpacing: '-0.5px',
        }}>
          Nalog je blokiran
        </h1>

        <p style={{
          color: '#64748b',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          margin: '0 0 2rem',
        }}>
          Vaš nalog je privremeno blokiran zbog nepoštivanja pravila.
          Ukoliko smatrate da je ovo greška, kontaktirajte podršku.
        </p>

        <button
          onClick={handleLogout}
          style={{
            padding: '0.7rem 2rem',
            background: '#ea580c',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Nazad na prijavu
        </button>
      </div>
    </div>
  );
}
