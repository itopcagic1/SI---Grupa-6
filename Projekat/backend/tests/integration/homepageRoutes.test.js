const express = require('express');
const request = require('supertest');

// Mock the homepageService
jest.mock('../../src/services/homepageService', () => ({
  dohvatiPodatkeZaHomepage: jest.fn()
}));

const homepageService = require('../../src/services/homepageService');
const homepageRoutes = require('../../src/routes/homepageRoutes');

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/homepage', homepageRoutes);
  return app;
}

describe('Guest Homepage Routes (PB-28)', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildTestApp();
  });

  test('treba vratiti podatke za homepage uspješno bez tokena (Javni API)', async () => {
    const mockData = {
      nadolazeceUtakmice: [{ utakmicaId: 1, domaciTim: { naziv: 'Tim A' }, gostujuciTim: { naziv: 'Tim B' } }],
      aktivneLige: [{ takmicenjeId: 1, naziv: 'Liga 1' }],
      najnovijiRezultati: [{ rezultatUtakmiceId: 1, rezultatDomacin: 2, rezultatGost: 1 }]
    };

    homepageService.dohvatiPodatkeZaHomepage.mockResolvedValue(mockData);

    const res = await request(app).get('/api/homepage');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({
      uspjeh: true,
      podaci: expect.objectContaining({
        nadolazeceUtakmice: expect.any(Array),
        aktivneLige: expect.any(Array),
        najnovijiRezultati: expect.any(Array)
      })
    }));
    
    // Test da smo stvarno pozvali servis
    expect(homepageService.dohvatiPodatkeZaHomepage).toHaveBeenCalledTimes(1);
  });

  test('treba vratiti 500 error kada servis baci izuzetak', async () => {
    homepageService.dohvatiPodatkeZaHomepage.mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/api/homepage');

    expect(res.status).toBe(500);
    expect(res.body).toEqual(expect.objectContaining({
      uspjeh: false,
      poruka: 'Database error'
    }));
  });
});
