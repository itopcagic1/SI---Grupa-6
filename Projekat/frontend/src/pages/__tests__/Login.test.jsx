import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import * as authApi from '../../api/authApi';

// Mock react-router-dom to track useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API call
vi.mock('../../api/authApi', () => ({
  loginUser: vi.fn(),
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders login form correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Dobrodošli nazad')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ime@primjer.ba')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prijavi se/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderComponent();
    
    const submitBtn = screen.getByRole('button', { name: /Prijavi se/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Email je obavezan')).toBeInTheDocument();
      expect(screen.getByText('Lozinka je obavezna')).toBeInTheDocument();
    });
  });

  it('calls loginUser and navigates on successful login', async () => {
    const mockResponse = {
      access_token: 'fake-token',
      korisnik: { id: 1, ime: 'Test User' },
    };
    
    authApi.loginUser.mockResolvedValueOnce(mockResponse);
    
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('ime@primjer.ba'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Prijavi se/i }));

    await waitFor(() => {
      expect(authApi.loginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        lozinka: 'password123',
      });
      expect(window.localStorage.getItem('token')).toBe('fake-token');
      expect(window.localStorage.getItem('korisnik')).toBe(JSON.stringify(mockResponse.korisnik));
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows alert on login failure', async () => {
    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const mockError = {
      response: { data: { poruka: 'Pogrešna lozinka' } },
    };
    
    authApi.loginUser.mockRejectedValueOnce(mockError);
    
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('ime@primjer.ba'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Prijavi se/i }));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Pogrešna lozinka');
    });

    mockAlert.mockRestore();
  });
});
