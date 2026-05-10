import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminKorisnici from './pages/AdminKorisnici';
import AdminRoute from './pages/AdminRoute';
import Blokiran from './pages/Blokiran';
import Timovi from './pages/Timovi';
import Sportovi from './pages/Sportovi';
import Lige from './pages/Lige';
import Profile from './pages/Profile';
import MojePrijave from './pages/MojePrijave';
import ProtectedRoute from './components/ProtectedRoute.jsx';
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
        <Route path="/teams" element={<Timovi />} />
        <Route path="/sports" element={<Sportovi />} />
        <Route path="/lige" element={<Lige />} />
        <Route path="/moje-prijave" element={<ProtectedRoute><MojePrijave /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
