import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import {
  getFreeIndividualTerms,
  reserveIndividualTerm,
  cancelIndividualTerm,
  kreirajGrupniTrening,
  prijaviSeNaGrupniTrening,
  getTrenerGrupniTreninzi,
  getGrupniTreninzi,
  getAllTeams,
  otkaziGrupniTrening,
  odjaviSeSaGrupnogTreninga,
  getTrenerNotifikacije
} from '../reservationApi';


const mockApiInstance = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApiInstance),
  },
}));

describe('reservationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'token-123');
  });


  it('dohvati slobodne individualne termine', async () => {
    const responseData = { termini: [{ terminId: 1 }] };
    mockApiInstance.get.mockResolvedValue({ data: responseData });

    const result = await getFreeIndividualTerms();

    expect(mockApiInstance.get).toHaveBeenCalledWith(
      '/rezervacije/slobodni/individualni',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('baca grešku kada getFreeIndividualTerms ne uspije', async () => {
    mockApiInstance.get.mockRejectedValue(new Error('Network Error'));

    await expect(getFreeIndividualTerms()).rejects.toThrow('Network Error');
  });



  it('rezerviše individualni termin sa autorizacijom', async () => {
    const responseData = { status: 'POTVRDJENA' };
    mockApiInstance.post.mockResolvedValue({ data: responseData });

    const result = await reserveIndividualTerm(13);

    expect(mockApiInstance.post).toHaveBeenCalledWith(
      '/rezervacije/individualne/13',
      {},
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('reserveIndividualTerm šalje ispravan terminId u URL', async () => {
    mockApiInstance.post.mockResolvedValue({ data: { status: 'POTVRDJENA' } });

    await reserveIndividualTerm(99);

    expect(mockApiInstance.post).toHaveBeenCalledWith(
      '/rezervacije/individualne/99',
      {},
      expect.anything()
    );
  });

  it('baca grešku kada reserveIndividualTerm ne uspije', async () => {
    mockApiInstance.post.mockRejectedValue(new Error('Termin nije dostupan.'));

    await expect(reserveIndividualTerm(13)).rejects.toThrow('Termin nije dostupan.');
  });



  it('otkazuje individualni termin sa autorizacijom', async () => {
    const responseData = { poruka: 'Rezervacija je uspješno otkazana.' };
    mockApiInstance.delete.mockResolvedValue({ data: responseData });

    const result = await cancelIndividualTerm(42);

    expect(mockApiInstance.delete).toHaveBeenCalledWith(
      '/rezervacije/individualne/42',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('baca grešku kada cancelIndividualTerm ne uspije', async () => {
    mockApiInstance.delete.mockRejectedValue(new Error('Rezervacija nije pronađena.'));

    await expect(cancelIndividualTerm(42)).rejects.toThrow('Rezervacija nije pronađena.');
  });



  it('koristi token iz localStorage za Authorization header', async () => {
    localStorage.setItem('token', 'drugi-token-456');
    mockApiInstance.get.mockResolvedValue({ data: {} });

    await getFreeIndividualTerms();

    expect(mockApiInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: { Authorization: 'Bearer drugi-token-456' } })
    );
  });

  it('šalje Authorization: Bearer null kada token nije u localStorage', async () => {
    localStorage.removeItem('token');
    mockApiInstance.get.mockResolvedValue({ data: {} });

    await getFreeIndividualTerms();

    expect(mockApiInstance.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ headers: { Authorization: 'Bearer null' } })
    );
  });

  // --- Grupne rezervacije ---

  it('kreira grupni trening sa ispravnim parametrima i autorizacijom', async () => {
    const responseData = { poruka: 'Grupni trening je uspješno kreiran.' };
    mockApiInstance.post.mockResolvedValue({ data: responseData });

    const result = await kreirajGrupniTrening(10, 15, 3);

    expect(mockApiInstance.post).toHaveBeenCalledWith(
      '/rezervacije/grupne/10',
      { maksimalanBrojIgraca: 15, timId: 3 },
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('prijavljuje igrača na grupni trening sa ispravnim parametrima i autorizacijom', async () => {
    const responseData = { poruka: 'Uspješno ste se prijavili na grupni trening.' };
    mockApiInstance.post.mockResolvedValue({ data: responseData });

    const result = await prijaviSeNaGrupniTrening(5);

    expect(mockApiInstance.post).toHaveBeenCalledWith(
      '/rezervacije/grupne/5/prijave',
      {},
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('dohvata grupne treninge trenera', async () => {
    const responseData = { treninzi: [] };
    mockApiInstance.get.mockResolvedValue({ data: responseData });

    const result = await getTrenerGrupniTreninzi();

    expect(mockApiInstance.get).toHaveBeenCalledWith(
      '/rezervacije/grupne/moje',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('dohvata sve grupne treninge za igračku pretragu', async () => {
    const responseData = { treninzi: [] };
    mockApiInstance.get.mockResolvedValue({ data: responseData });

    const result = await getGrupniTreninzi();

    expect(mockApiInstance.get).toHaveBeenCalledWith(
      '/rezervacije/grupne/sve',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('dohvata sve timove', async () => {
    const responseData = [{ timId: 3, naziv: 'Tim A' }];
    mockApiInstance.get.mockResolvedValue({ data: responseData });

    const result = await getAllTeams();

    expect(mockApiInstance.get).toHaveBeenCalledWith(
      '/teams',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('otkazuje grupni trening', async () => {
    const responseData = { poruka: 'Uspješno otkazano' };
    mockApiInstance.delete.mockResolvedValue({ data: responseData });

    const result = await otkaziGrupniTrening(100);

    expect(mockApiInstance.delete).toHaveBeenCalledWith(
      '/rezervacije/grupne/100',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });

  it('odjavljuje se sa grupnog treninga', async () => {
    const responseData = { poruka: 'Uspješno odjavljeno' };
    mockApiInstance.delete.mockResolvedValue({ data: responseData });

    const result = await odjaviSeSaGrupnogTreninga(100, 'Povreda');

    expect(mockApiInstance.delete).toHaveBeenCalledWith(
      '/rezervacije/grupne/100/prijave',
      expect.objectContaining({
        data: { razlog: 'Povreda' },
        headers: { Authorization: 'Bearer token-123' }
      })
    );
    expect(result).toEqual(responseData);
  });

  it('dohvata notifikacije trenera o odjavama', async () => {
    const responseData = { notifikacije: [] };
    mockApiInstance.get.mockResolvedValue({ data: responseData });

    const result = await getTrenerNotifikacije();

    expect(mockApiInstance.get).toHaveBeenCalledWith(
      '/rezervacije/grupne/notifikacije',
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toEqual(responseData);
  });
});