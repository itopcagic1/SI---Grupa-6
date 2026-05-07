import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from '../../src/pages/AdminRoute';

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin/korisnici']}>
      <Routes>
        <Route
          path="/admin/korisnici"
          element={
            <AdminRoute>
              <div>Admin sadrzaj</div>
            </AdminRoute>
          }
        />
        <Route path="/login" element={<div>Login stranica</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('korisnik bez tokena ili bez korisnika ne moze pristupiti admin ruti', () => {
    renderAdminRoute();

    expect(screen.getByText('Login stranica')).toBeInTheDocument();
  });

  it('korisnik koji nije administrator ne vidi admin sadrzaj', () => {
    localStorage.setItem('korisnik', JSON.stringify({ trenutnaUloga: 'TRENER' }));

    renderAdminRoute();

    expect(screen.getByText('Nemate pristup ovoj stranici')).toBeInTheDocument();
    expect(screen.queryByText('Admin sadrzaj')).not.toBeInTheDocument();
  });

  it('administrator moze pristupiti admin ruti', () => {
    localStorage.setItem('korisnik', JSON.stringify({ trenutnaUloga: 'ADMINISTRATOR' }));

    renderAdminRoute();

    expect(screen.getByText('Admin sadrzaj')).toBeInTheDocument();
  });

  it('blokirani ili nevalidni korisnik se ne blokira posebno ako ima admin ulogu', () => {
    localStorage.setItem(
      'korisnik',
      JSON.stringify({ trenutnaUloga: 'ADMINISTRATOR', statusPouzdanosti: 'BLOKIRAN' })
    );

    renderAdminRoute();

    expect(screen.getByText('Admin sadrzaj')).toBeInTheDocument();
  });
});
