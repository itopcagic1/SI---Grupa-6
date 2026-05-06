import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import * as authApi from '../../api/authApi';

vi.mock('../../api/authApi', () => ({
  registerUser: vi.fn(),
}));

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  it('renders register form correctly', () => {
    renderComponent();

    expect(screen.getByText('Kreirajte svoj račun')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('npr. Edin Džeko')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ime@primjer.ba')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Najmanje 8 znakova')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ponovo unesite lozinku')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registruj se/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Registruj se/i }));

    await waitFor(() => {
      expect(screen.getByText('Ime je obavezno')).toBeInTheDocument();
      expect(screen.getByText('Email je obavezan')).toBeInTheDocument();
      expect(screen.getByText('Lozinka je obavezna')).toBeInTheDocument();
      expect(screen.getByText('Potvrda lozinke je obavezna')).toBeInTheDocument();
      expect(authApi.registerUser).not.toHaveBeenCalled();
    });
  });

  it('calls registerUser on successful registration', async () => {
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mockResponse = {
      poruka_uloge: { status: 'ODOBRENO' },
    };

    authApi.registerUser.mockResolvedValueOnce(mockResponse);

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('npr. Edin Džeko'), {
      target: { value: 'Edin Džeko' },
    });
    fireEvent.change(screen.getByPlaceholderText('ime@primjer.ba'), {
      target: { value: 'edin@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Najmanje 8 znakova'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ponovo unesite lozinku'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registruj se/i }));

    await waitFor(() => {
      expect(authApi.registerUser).toHaveBeenCalledWith({
        punoIme: 'Edin Džeko',
        email: 'edin@example.com',
        lozinka: 'password123',
        potvrdalozinke: 'password123',
      });
      expect(mockAlert).toHaveBeenCalledWith('Uspješna registracija! Status: ODOBRENO');
    });

    mockAlert.mockRestore();
  });

  it('shows alert on registration failure', async () => {
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mockError = {
      response: { data: { poruka: 'Email već postoji' } },
    };

    authApi.registerUser.mockRejectedValueOnce(mockError);

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('npr. Edin Džeko'), {
      target: { value: 'Edin' },
    });
    fireEvent.change(screen.getByPlaceholderText('ime@primjer.ba'), {
      target: { value: 'postoji@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Najmanje 8 znakova'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ponovo unesite lozinku'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registruj se/i }));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Greška: Email već postoji');
    });

    mockAlert.mockRestore();
  });
});
