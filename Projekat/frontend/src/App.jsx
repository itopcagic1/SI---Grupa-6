import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminKorisnici from './pages/AdminKorisnici';
import AdminRoute from './pages/AdminRoute';
import Blokiran from './pages/Blokiran';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/blokiran" element={<Blokiran />} />
        <Route path="/admin/korisnici" element={
    <AdminRoute>
      <AdminKorisnici />
    </AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;