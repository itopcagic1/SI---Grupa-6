
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import FacilitiesPage from "../../src/pages/FacilitiesPage";
import { vi, beforeEach, afterEach, describe, test, expect } from 'vitest';
// ─── Mockovi ──────────────────────────────────────────────────────────────────
 
vi.mock('axios');
vi.mock('../components/Navbar', () => () => <nav data-testid="navbar" />);
 
// Simulira da je token u localStorage
beforeEach(() => {
  localStorage.setItem('token', 'test-token');
  vi.clearAllMocks();
});
 
afterEach(() => {
  localStorage.clear();
});
 
// ─── Pomoćna funkcija za renderovanje ─────────────────────────────────────────
 
const renderPage = () =>
  render(
    <MemoryRouter>
      <FacilitiesPage />
    </MemoryRouter>
  );
 
// ─── Pomoćni podaci ────────────────────────────────────────────────────────────
 
const mockObjekat = {
  objekatId: 1,
  naziv: 'Zetra Dvorana',
  adresa: 'Koševo 4, Sarajevo',
  opis: 'Košarkaška dvorana',
  kapacitet: 10,
  status: 'AKTIVAN',
};
 
// ══════════════════════════════════════════════════════════════════════════════
// Prikaz stranice
// ══════════════════════════════════════════════════════════════════════════════
 
describe('Prikaz stranice', () => {
  test('prikazuje naslov "Upravljanje Objektima"', async () => {
    axios.get.mockResolvedValue({ data: [] });
    renderPage();
    expect(screen.getByText(/Upravljanje/i)).toBeInTheDocument();
  });
 
  test('prikazuje formu za dodavanje novog objekta', async () => {
    axios.get.mockResolvedValue({ data: [] });
    renderPage();
    expect(screen.getByText(/Novi objekat/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Dvorana Mirza/i)).toBeInTheDocument();
  });
 
  test('prikazuje "Učitavanje podataka..." dok čeka odgovor', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // nikad ne resolva
    renderPage();
    expect(screen.getByText(/Učitavanje podataka/i)).toBeInTheDocument();
  });
 
  test('prikazuje poruku ako nema objekata', async () => {
    axios.get.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Nemate dodanih aktivnih/i)).toBeInTheDocument()
    );
  });
 
  test('prikazuje listu objekata koje API vrati', async () => {
    axios.get.mockResolvedValue({ data: [mockObjekat] });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('Zetra Dvorana')).toBeInTheDocument()
    );
    expect(screen.getByText('Koševo 4, Sarajevo')).toBeInTheDocument();
    expect(screen.getByText('10 igr.')).toBeInTheDocument();
  });
});
 
// ══════════════════════════════════════════════════════════════════════════════
// Validacija forme
// ══════════════════════════════════════════════════════════════════════════════
 
describe('Validacija forme', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [] });
  });
 
  test('prikazuje grešku ako naziv nije unesen', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Nemate dodanih/i));
 
    fireEvent.click(screen.getByRole('button', { name: /Kreiraj/i }));
 
    expect(screen.getByText(/Naziv objekta je obavezan/i)).toBeInTheDocument();
  });
 
  test('prikazuje grešku ako je naziv samo brojevi', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Nemate dodanih/i));
 
    await userEvent.type(screen.getByPlaceholderText(/Dvorana Mirza/i), '12345');
    fireEvent.click(screen.getByRole('button', { name: /Kreiraj/i }));
 
    expect(screen.getByText(/samo brojeve/i)).toBeInTheDocument();
  });
 
  test('prikazuje grešku ako je broj igrača izvan raspona', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Nemate dodanih/i));
 
    await userEvent.type(screen.getByPlaceholderText(/Dvorana Mirza/i), 'Test Teren');
    
    const kapacitetInput = screen.getByRole('spinbutton'); // input type="number"
    await userEvent.clear(kapacitetInput);
    await userEvent.type(kapacitetInput, '50');
 
    fireEvent.click(screen.getByRole('button', { name: /Kreiraj/i }));
 
    expect(screen.getByText(/između 1 i 30/i)).toBeInTheDocument();
  });
 
  test('prikazuje grešku ako je adresa samo brojevi', async () => {
    renderPage();
    await waitFor(() => screen.getByText(/Nemate dodanih/i));
 
    await userEvent.type(screen.getByPlaceholderText(/Dvorana Mirza/i), 'Test Teren');
    await userEvent.type(screen.getByPlaceholderText(/Skenderija/i), '12345');
 
    const kapacitetInput = screen.getByRole('spinbutton');
    await userEvent.clear(kapacitetInput);
    await userEvent.type(kapacitetInput, '10');
 
    fireEvent.click(screen.getByRole('button', { name: /Kreiraj/i }));
 
    expect(screen.getByText(/Adresa ne smije/i)).toBeInTheDocument();
  });
});
 
// ══════════════════════════════════════════════════════════════════════════════
// Kreiranje objekta
// ══════════════════════════════════════════════════════════════════════════════
 
describe('Kreiranje objekta', () => {
  test('poziva API i prikazuje uspješnu poruku', async () => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: mockObjekat });
 
    renderPage();
    await waitFor(() => screen.getByText(/Nemate dodanih/i));
 
    await userEvent.type(screen.getByPlaceholderText(/Dvorana Mirza/i), 'Zetra Dvorana');
    const kapacitetInput = screen.getByRole('spinbutton');
    await userEvent.clear(kapacitetInput);
    await userEvent.type(kapacitetInput, '10');
 
    axios.get.mockResolvedValue({ data: [mockObjekat] });
    fireEvent.click(screen.getByRole('button', { name: /Kreiraj/i }));
 
    await waitFor(() =>
      expect(screen.getByText(/uspješno kreiran/i)).toBeInTheDocument()
    );
  });
 
  test('prikazuje grešku ako API vrati error', async () => {
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockRejectedValue({
      response: { data: { error: 'Naziv već postoji.' } },
    });
 
    renderPage();
    await waitFor(() => screen.getByText(/Nemate dodanih/i));
 
    await userEvent.type(screen.getByPlaceholderText(/Dvorana Mirza/i), 'Zetra Dvorana');
    const kapacitetInput = screen.getByRole('spinbutton');
    await userEvent.clear(kapacitetInput);
    await userEvent.type(kapacitetInput, '10');
 
    fireEvent.click(screen.getByRole('button', { name: /Kreiraj/i }));
 
    await waitFor(() =>
      expect(screen.getByText(/Naziv već postoji/i)).toBeInTheDocument()
    );
  });
});
 
// ══════════════════════════════════════════════════════════════════════════════
// Uređivanje objekta
// ══════════════════════════════════════════════════════════════════════════════
 
describe('Uređivanje objekta', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [mockObjekat] });
  });
 
  test('klik na "Uredi" popunjava formu s podacima objekta', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Zetra Dvorana'));
 
    fireEvent.click(screen.getByRole('button', { name: /Uredi/i }));
 
    expect(screen.getByDisplayValue('Zetra Dvorana')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Koševo 4, Sarajevo')).toBeInTheDocument();
  });
 
  test('prikazuje "Uredi objekat" u naslovu forme pri uređivanju', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Zetra Dvorana'));
 
    fireEvent.click(screen.getByRole('button', { name: /Uredi/i }));
 
    expect(screen.getByText(/Uredi objekat/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Spasi/i })).toBeInTheDocument();
  });
 
  test('"Otkaži" resetuje formu i vraća na Novi objekat', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Zetra Dvorana'));
 
    fireEvent.click(screen.getByRole('button', { name: /Uredi/i }));
    expect(screen.getByText(/Uredi objekat/i)).toBeInTheDocument();
 
    fireEvent.click(screen.getByRole('button', { name: /Otkaži/i }));
    expect(screen.getByText(/Novi objekat/i)).toBeInTheDocument();
  });
});
 
// ══════════════════════════════════════════════════════════════════════════════
// Brisanje (soft-delete) objekta
// ══════════════════════════════════════════════════════════════════════════════
 
describe('Brisanje objekta', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: [mockObjekat] });
  });
 
  test('klik na "Ukloni" prikazuje potvrdu', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Zetra Dvorana'));
 
    fireEvent.click(screen.getByRole('button', { name: /Ukloni/i }));
 
    expect(screen.getByText(/Sigurni ste/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Da$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Ne$/i })).toBeInTheDocument();
  });
 
  test('"Ne" otkazuje brisanje i skriva potvrdu', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Zetra Dvorana'));
 
    fireEvent.click(screen.getByRole('button', { name: /Ukloni/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Ne$/i }));
 
    expect(screen.queryByText(/Sigurni ste/i)).not.toBeInTheDocument();
  });
 
  test('"Da" poziva API za brisanje i prikazuje uspješnu poruku', async () => {
    axios.delete.mockResolvedValue({});
    axios.get
      .mockResolvedValueOnce({ data: [mockObjekat] })
      .mockResolvedValueOnce({ data: [] });
 
    renderPage();
    await waitFor(() => screen.getByText('Zetra Dvorana'));
 
    fireEvent.click(screen.getByRole('button', { name: /Ukloni/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Da$/i }));
 
    await waitFor(() =>
      expect(screen.getByText(/deaktiviran/i)).toBeInTheDocument()
    );
    expect(axios.delete).toHaveBeenCalledTimes(1);
  });
});
 