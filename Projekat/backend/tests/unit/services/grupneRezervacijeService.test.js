const mockPrisma = {
  terminObjekta: {
    findUnique: jest.fn(),
  },
  zahtjevZaRezervaciju: {
    findFirst: jest.fn(),
  },
  grupniTrening: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  prijavaGrupnogTreninga: {
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  korisnik: {
    findUnique: jest.fn(),
  },
  notifikacija: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../../../src/config/db', () => mockPrisma);

const {
  kreirajGrupniTreningService,
  prijaviSeNaGrupniTreningService,
  otkaziGrupniTreningService,
  odjaviSeSaGrupnogTreningaService,
  getTrenerNotifikacijeService,
} = require('../../../src/services/grupneRezervacijeService');

describe('Grupne Rezervacije Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('kreirajGrupniTreningService', () => {
    test('uspješno kreira grupni trening kada je termin slobodan i u budućnosti', async () => {
      const buduciDatum = new Date(Date.now() + 3600000); // +1 sat
      
      mockPrisma.terminObjekta.findUnique.mockResolvedValue({
        terminId: 10,
        status: 'SLOBODAN',
        vrijemePocetka: buduciDatum,
        sportskiObjekat: { objekatId: 1, naziv: 'Sala' },
      });
      mockPrisma.zahtjevZaRezervaciju.findFirst.mockResolvedValue(null);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          zahtjevZaRezervaciju: {
            create: jest.fn().mockResolvedValue({ zahtjevId: 1 }),
          },
          rezervacija: {
            create: jest.fn().mockResolvedValue({ rezervacijaId: 1 }),
          },
          terminObjekta: {
            update: jest.fn().mockResolvedValue({}),
          },
          grupniTrening: {
            create: jest.fn().mockResolvedValue({ treningId: 100, terminId: 10, trenerId: 5, maksimalanBrojIgraca: 15 }),
          },
        };
        return callback(tx);
      });

      const rezultat = await kreirajGrupniTreningService('10', 5, '15');

      expect(mockPrisma.terminObjekta.findUnique).toHaveBeenCalledWith({ where: { terminId: 10 }, include: { sportskiObjekat: true } });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(rezultat.maksimalanBrojIgraca).toBe(15);
      expect(rezultat.treningId).toBe(100);
    });

    test('baca grešku kada je maksimalan broj igrača manji od 2 ili veći od 30', async () => {
      await expect(
        kreirajGrupniTreningService('10', 5, '1')
      ).rejects.toThrow('Kapacitet grupe mora biti između 2 i 30.');

      await expect(
        kreirajGrupniTreningService('10', 5, '31')
      ).rejects.toThrow('Kapacitet grupe mora biti između 2 i 30.');
    });

    test('baca grešku kada termin nije slobodan', async () => {
      mockPrisma.terminObjekta.findUnique.mockResolvedValue({
        terminId: 10,
        status: 'ZAUZET',
        vrijemePocetka: new Date(Date.now() + 3600000),
      });

      await expect(
        kreirajGrupniTreningService('10', 5, '15')
      ).rejects.toThrow('Termin je već zauzet ili blokiran.');
    });
  });

  describe('prijaviSeNaGrupniTreningService', () => {
    test('uspješno prijavljuje igrača na grupni trening sa slobodnim mjestima', async () => {
      const buduciDatum = new Date(Date.now() + 3600000);
      mockPrisma.grupniTrening.findFirst.mockResolvedValue({
        treningId: 50,
        terminId: 22,
        maksimalanBrojIgraca: 10,
      });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          grupniTrening: {
            findUnique: jest.fn().mockResolvedValue({
              treningId: 50,
              maksimalanBrojIgraca: 10,
              terminObjekta: { vrijemePocetka: buduciDatum },
            }),
          },
          prijavaGrupnogTreninga: {
            count: jest.fn().mockResolvedValue(5), // 5 prijavljenih, kapacitet 10
            findUnique: jest.fn().mockResolvedValue(null), // nije se prijavio ranije
            create: jest.fn().mockResolvedValue({ prijavaId: 999, treningId: 50, korisnikId: 9 }),
          },
        };
        return callback(tx);
      });

      const rezultat = await prijaviSeNaGrupniTreningService('50', 9);

      expect(mockPrisma.grupniTrening.findFirst).toHaveBeenCalled();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(rezultat.prijavaId).toBe(999);
    });

    test('baca grešku ako je grupni trening popunjen (kapacitet dostignut)', async () => {
      const buduciDatum = new Date(Date.now() + 3600000);
      mockPrisma.grupniTrening.findFirst.mockResolvedValue({
        treningId: 50,
        maksimalanBrojIgraca: 10,
      });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          grupniTrening: {
            findUnique: jest.fn().mockResolvedValue({
              treningId: 50,
              maksimalanBrojIgraca: 10,
              terminObjekta: { vrijemePocetka: buduciDatum },
            }),
          },
          prijavaGrupnogTreninga: {
            count: jest.fn().mockResolvedValue(10), // popunjeno
            findUnique: jest.fn(),
            create: jest.fn(),
          },
        };
        return callback(tx);
      });

      await expect(
        prijaviSeNaGrupniTreningService('50', 9)
      ).rejects.toThrow('Nažalost, ovaj grupni trening je popunjen');
    });

    test('baca grešku ako je igrač već prijavljen na taj trening', async () => {
      const buduciDatum = new Date(Date.now() + 3600000);
      mockPrisma.grupniTrening.findFirst.mockResolvedValue({
        treningId: 50,
        maksimalanBrojIgraca: 10,
      });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          grupniTrening: {
            findUnique: jest.fn().mockResolvedValue({
              treningId: 50,
              maksimalanBrojIgraca: 10,
              terminObjekta: { vrijemePocetka: buduciDatum },
            }),
          },
          prijavaGrupnogTreninga: {
            count: jest.fn().mockResolvedValue(5),
            findUnique: jest.fn().mockResolvedValue({ prijavaId: 888 }), // već prijavljen
            create: jest.fn(),
          },
        };
        return callback(tx);
      });

      await expect(
        prijaviSeNaGrupniTreningService('50', 9)
      ).rejects.toThrow('Već ste prijavljeni na ovaj grupni trening.');
    });
  });

  describe('otkaziGrupniTreningService', () => {
    test('uspješno otkazuje grupni trening i oslobađa termin', async () => {
      const buduciDatum = new Date(Date.now() + 3600000);
      mockPrisma.grupniTrening.findUnique.mockResolvedValue({
        treningId: 100,
        terminId: 10,
        trenerId: 5,
        terminObjekta: {
          vrijemePocetka: buduciDatum,
          zahtjeviZaRezervaciju: [
            { zahtjevId: 55, status: 'ODOBRENO' }
          ]
        }
      });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          prijavaGrupnogTreninga: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          grupniTrening: {
            delete: jest.fn().mockResolvedValue({}),
          },
          rezervacija: {
            updateMany: jest.fn().mockResolvedValue({}),
          },
          zahtjevZaRezervaciju: {
            update: jest.fn().mockResolvedValue({}),
          },
          terminObjekta: {
            update: jest.fn().mockResolvedValue({}),
          }
        };
        return callback(tx);
      });

      const rezultat = await otkaziGrupniTreningService(100, 5);

      expect(mockPrisma.grupniTrening.findUnique).toHaveBeenCalledWith({
        where: { treningId: 100 },
        include: {
          terminObjekta: {
            include: {
              zahtjeviZaRezervaciju: {
                where: { status: 'ODOBRENO' }
              }
            }
          }
        }
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(rezultat.poruka).toBe('Grupni trening je uspješno otkazan.');
    });

    test('baca grešku ako trening ne postoji', async () => {
      mockPrisma.grupniTrening.findUnique.mockResolvedValue(null);

      await expect(
        otkaziGrupniTreningService(999, 5)
      ).rejects.toThrow('Grupni trening nije pronađen.');
    });

    test('baca grešku ako trener nije kreator tog treninga', async () => {
      mockPrisma.grupniTrening.findUnique.mockResolvedValue({
        treningId: 100,
        trenerId: 10, // drugi trener
        terminObjekta: {
          vrijemePocetka: new Date(Date.now() + 3600000),
          zahtjeviZaRezervaciju: []
        }
      });

      await expect(
        otkaziGrupniTreningService(100, 5)
      ).rejects.toThrow('Nemate pravo da otkažete ovaj trening.');
    });
  });

  describe('odjaviSeSaGrupnogTreningaService', () => {
    test('uspješno odjavljuje igrača i šalje notifikaciju treneru', async () => {
      const buduciDatum = new Date(Date.now() + 3600000);
      mockPrisma.grupniTrening.findUnique.mockResolvedValue({
        treningId: 100,
        trenerId: 5,
        terminObjekta: {
          vrijemePocetka: buduciDatum,
          sportskiObjekat: { naziv: 'Dvorana A' }
        }
      });

      mockPrisma.prijavaGrupnogTreninga.findUnique.mockResolvedValue({
        prijavaId: 1,
        treningId: 100,
        korisnikId: 9
      });

      mockPrisma.korisnik.findUnique.mockResolvedValue({
        korisnikId: 9,
        punoIme: 'Igrac Test',
        email: 'igrac@test.com'
      });

      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      const rezultat = await odjaviSeSaGrupnogTreningaService(100, 9, 'Povreda');

      expect(mockPrisma.grupniTrening.findUnique).toHaveBeenCalledWith({
        where: { treningId: 100 },
        include: {
          terminObjekta: {
            include: { sportskiObjekat: true }
          }
        }
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(rezultat.poruka).toBe('Uspješno ste se odjavili sa grupnog treninga.');
    });

    test('baca grešku ako igrač nije prijavljen', async () => {
      const buduciDatum = new Date(Date.now() + 3600000);
      mockPrisma.grupniTrening.findUnique.mockResolvedValue({
        treningId: 100,
        terminObjekta: { vrijemePocetka: buduciDatum }
      });
      mockPrisma.prijavaGrupnogTreninga.findUnique.mockResolvedValue(null);

      await expect(
        odjaviSeSaGrupnogTreningaService(100, 9)
      ).rejects.toThrow('Niste prijavljeni na ovaj trening.');
    });
  });

  describe('getTrenerNotifikacijeService', () => {
    test('dohvata notifikacije o odjavama za određenog trenera', async () => {
      const mockNotifs = [
        { notifikacijaId: 1, sadrzajPoruke: 'Odjava igrača A' }
      ];
      mockPrisma.notifikacija.findMany.mockResolvedValue(mockNotifs);

      const rezultat = await getTrenerNotifikacijeService(5);

      expect(mockPrisma.notifikacija.findMany).toHaveBeenCalledWith({
        where: {
          korisnikId: 5,
          tipNotifikacije: 'ODJAVA_TRENINGA'
        },
        orderBy: {
          vrijemeSlanja: 'desc'
        }
      });
      expect(rezultat).toEqual(mockNotifs);
    });
  });
});
