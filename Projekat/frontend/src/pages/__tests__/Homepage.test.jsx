import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import Homepage from '../Homepage';

// Mock axios
vi.mock('axios');

describe('Homepage component', () => {
  it('renders correctly and fetches data', async () => {
    // Mock the backend response
    const mockData = {
      uspjeh: true,
      podaci: {
        nadolazeceUtakmice: [
          {
            utakmicaId: 1,
            vrijemePocetka: new Date(Date.now() + 86400000).toISOString(),
            takmicenje: { naziv: 'Premier Liga' },
            domaciTim: { naziv: 'FK Tempo' },
            gostujuciTim: { naziv: 'FC Arena' }
          }
        ],
        aktivneLige: [
          {
            takmicenjeId: 1,
            naziv: 'Premier Liga',
            _count: { ucesniciTakmicenja: 12, utakmice: 128 }
          }
        ],
        najnovijiRezultati: [
          {
            rezultatUtakmiceId: 1,
            rezultatDomacin: 3,
            rezultatGost: 1,
            datumUnosa: new Date().toISOString(),
            utakmica: {
              takmicenje: { naziv: 'Premier Liga' },
              domaciTim: { naziv: 'FK Tempo' },
              gostujuciTim: { naziv: 'FC Arena' }
            }
          }
        ]
      }
    };

    axios.get.mockResolvedValueOnce({ data: mockData });

    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    // Initial loading state
    expect(screen.getByText(/SVE LIGE\./i)).toBeInTheDocument();
  });
  
  it('displays empty state messages when no data is returned', async () => {
    const mockEmptyData = {
      uspjeh: true,
      podaci: {
        nadolazeceUtakmice: [],
        aktivneLige: [],
        najnovijiRezultati: []
      }
    };
    
    axios.get.mockResolvedValueOnce({ data: mockEmptyData });
    
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Trenutno nema nadolazećih utakmica.')).toBeInTheDocument();
      expect(screen.getByText('Trenutno nema aktivnih liga.')).toBeInTheDocument();
      expect(screen.getByText('Trenutno nema novih rezultata.')).toBeInTheDocument();
    });
  });
});
