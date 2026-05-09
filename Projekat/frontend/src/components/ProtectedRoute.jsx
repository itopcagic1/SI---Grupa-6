import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  
  const token = localStorage.getItem('token'); 

  if (!token) {
    // ako korisnik nije ulogovan, saljemo ga na login
    return <Navigate to="/login" replace />;
  }

  // sko jeste, dopustamo mu da vidi stranicu
  return children;
};

export default ProtectedRoute;