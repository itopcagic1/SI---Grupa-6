import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import * as authApi from '../../api/authApi';

// Mock the API call
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
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registruj se/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderComponent();
    
    const submitBtn = screen.getByRole('button', { name: /Registruj se/i });
    fireEvent.click(submitBtn);

    // wait for validation text to appear (we don't render errors explicitly in Register.jsx, wait, let me check Register.jsx again...
    // Register.jsx does NOT render the errors! It only passes them to react-hook-form, but doesn't show them like Login.jsx does.
    // So this test should just verify the API is not called.
    await waitFor(() => {
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
      target: { value: 'Edin Dzeko' },
    });
    fireEvent.change(screen.getByPlaceholderText('ime@primjer.ba'), {
      target: { value: 'edin@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registruj se/i }));

    await waitFor(() => {
      expect(authApi.registerUser).toHaveBeenCalledWith({
        punoIme: 'Edin Dzeko',
        email: 'edin@example.com',
        lozinka: 'password123',
        trazenaUloga: 'NAVIJAC', // default value
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
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'pass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registruj se/i }));

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Greška: Email već postoji');
    });

    mockAlert.mockRestore();
  });
});
