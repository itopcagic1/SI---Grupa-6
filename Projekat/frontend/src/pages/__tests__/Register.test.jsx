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

    expect(screen.getByText('Napravi novi račun')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('npr. Edin Džeko')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ime@primjer.ba')).toBeInTheDocument();
    expect(document.querySelector('input[name="lozinka"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="potvrdalozinke"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registruj se/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderComponent();

    const submitBtn = screen.getByRole('button', { name: /Registruj se/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.registerUser).not.toHaveBeenCalled();
    });
  });

  it('calls registerUser on successful registration', async () => {
    const mockResponse = {
      poruka_uloge: { status: 'ODOBRENO' },
    };

    authApi.registerUser.mockResolvedValueOnce(mockResponse);

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('npr. Edin Džeko'), {
      target: { value: 'Edin Dzeko' },
    });
    fireEvent.change(screen.getByPlaceholderText('ime@primjer.ba'), {
      target: { value: 'edin@example.com' },
    });
    fireEvent.change(document.querySelector('input[name="lozinka"]'), {
      target: { value: 'password123' },
    });
    fireEvent.change(document.querySelector('input[name="potvrdalozinke"]'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registruj se/i }));

    await waitFor(() => {
      expect(authApi.registerUser).toHaveBeenCalledWith({
        punoIme: 'Edin Dzeko',
        email: 'edin@example.com',
        lozinka: 'password123',
        potvrdalozinke: 'password123',
        trazenaUloga: 'NAVIJAC',
      });
      // Komponenta prikazuje poruku u UI-u, ne kroz window.alert
      expect(screen.getByText('Uspješna registracija! Status: ODOBRENO')).toBeInTheDocument();
    });
  });

  it('shows alert on registration failure', async () => {
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
    fireEvent.change(document.querySelector('input[name="lozinka"]'), {
      target: { value: 'pass' },
    });
    fireEvent.change(document.querySelector('input[name="potvrdalozinke"]'), {
      target: { value: 'pass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registruj se/i }));

    await waitFor(() => {
      expect(screen.getByText('Greška: Email već postoji')).toBeInTheDocument();
    });
  });
});
