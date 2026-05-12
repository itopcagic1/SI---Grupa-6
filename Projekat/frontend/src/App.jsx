import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Register from './pages/Register';
import Login from './pages/Login';

import AdminKorisnici from './pages/AdminKorisnici';
import AdminKorisnikDetalji from './pages/AdminKorisnikDetalji';
import AdminRoute from './pages/AdminRoute';
import Blokiran from './pages/Blokiran';
import Timovi from './pages/Timovi';
import Sportovi from './pages/Sportovi';
import Lige from './pages/Lige';
import GenerateSchedule from './pages/GenerateSchedule';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Rezultati from './pages/Rezultati';
import Raspored from './pages/Raspored';

import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/blokiran" element={<Blokiran />} />
        <Route path="/admin/korisnici" element={
          <AdminRoute>
            <AdminKorisnici />
          </AdminRoute>} />
        <Route path="/admin/korisnici/:id" element={
          <AdminRoute>
            <AdminKorisnikDetalji />
          </AdminRoute>} />
        <Route path="/teams" element={<Timovi />} />
        <Route path="/sports" element={<Sportovi />} />
        <Route path="/lige" element={<Lige />} />
        <Route path="/raspored" element={<Raspored />} />
        <Route path="/rezultati" element={<Rezultati />} />
        <Route path="/generate-schedule" element={<GenerateSchedule />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
