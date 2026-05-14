import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from "../../src/pages/Profile";
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { describe, it, expect, vi, test } from 'vitest';
vi.mock('axios');

describe('FRONTEND TEST: Profile Komponenta (Maida)', () => {

  test('Treba prikazati ime korisnika nakon učitavanja', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: { 
        uspjeh: true, 
        korisnik: { punoIme: 'Maida Biber', email: 'maida@test.com', uloga: 'TRENER' } 
      }
    });

    render(<BrowserRouter><Profile /></BrowserRouter>);
    const imeElement = await waitFor(() => screen.getByText('Maida Biber'));
    expect(imeElement).toBeInTheDocument();
  });

  test('Prikazuje grešku na ekranu ako se lozinke ne podudaraju', async () => {
    // Ponovo renderujemo formu
    render(<BrowserRouter><Profile /></BrowserRouter>);

    // Čekamo da loading prođe
    await waitFor(() => screen.getByText(/Moj Profil/i));

    // Simuliramo kucanje u polja
    fireEvent.change(screen.getByPlaceholderText(/Nova lozinka/i), { target: { value: 'sifra1' } });
    fireEvent.change(screen.getByPlaceholderText(/Potvrdite lozinku/i), { target: { value: 'sifra2' } });

    // Kliknemo dugme
    fireEvent.click(screen.getByText(/Ažuriraj lozinku/i));

    //  Provjeravamo da li se pojavila tvoja poruka o grešci
    await waitFor(() => {
      expect(screen.getByText(/Lozinke se ne podudaraju!/i)).toBeInTheDocument();
    });
  });
});