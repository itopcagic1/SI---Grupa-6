const mockPrisma = {
  takmicenje: {
    findUnique: jest.fn(),
  },
  ucesceUTakmicenju: {
    findMany: jest.fn(),
  },
  utakmica: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  rezultatUtakmice: {
    deleteMany: jest.fn(),
  },
  aIPredikcija: {
    deleteMany: jest.fn(),
  },
  statistikaTimaNaUtakmici: {
    findMany: jest.fn().mockResolvedValue([]),
    deleteMany: jest.fn(),
  },
  statistikaIgracaNaUtakmici: {
    findMany: jest.fn().mockResolvedValue([]),
    deleteMany: jest.fn(),
  },
  vrijednostStatistikeTima: {
    deleteMany: jest.fn(),
  },
  vrijednostStatistikeIgraca: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(async (fn) => fn(mockPrisma)),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const matchService = require('../../../src/services/matchService');

// Pomoćni objekat koji simulira korisnika organizatora (korisnikId: 1)
const organizator = { korisnikId: 1, uloga: 'ORGANIZATOR' };
// Pomoćni objekat koji simulira administratora
const administrator = { korisnikId: 99, uloga: 'ADMINISTRATOR' };

describe('matchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetuj podrazumijevane vrijednosti nakon clearAllMocks
    mockPrisma.statistikaTimaNaUtakmici.findMany.mockResolvedValue([]);
    mockPrisma.statistikaIgracaNaUtakmici.findMany.mockResolvedValue([]);
    mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockPrisma));
  });

  describe('getPublicMatches', () => {
    test('dohvata utakmice bez filtera sa javnim relacijama', async () => {
      mockPrisma.utakmica.findMany.mockResolvedValue([{ utakmicaId: 1 }]);

      const result = await matchService.getPublicMatches();

      expect(result).toEqual([{ utakmicaId: 1 }]);
      expect(mockPrisma.utakmica.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {},
        orderBy: { vrijemePocetka: 'asc' },
        include: expect.objectContaining({
          domaciTim: expect.any(Object),
          gostujuciTim: expect.any(Object),
          takmicenje: expect.any(Object),
          sportskiObjekat: expect.any(Object),
          rezultatUtakmice: expect.any(Object),
        }),
      }));
    });

    test('kombinuje filtere u Prisma where uslove', async () => {
      const datumOd = new Date('2026-05-18T00:00:00.000Z');
      const datumDo = new Date('2026-05-19T00:00:00.000Z');
      mockPrisma.utakmica.findMany.mockResolvedValue([]);

      await matchService.getPublicMatches({
        sportId: 1,
        takmicenjeId: 2,
        timId: 5,
        datumOd,
        datumDo,
      });

      expect(mockPrisma.utakmica.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          takmicenjeId: 2,
          takmicenje: { sportId: 1 },
          OR: [
            { domaciTimId: 5 },
            { gostujuciTimId: 5 },
          ],
          vrijemePocetka: {
            gte: datumOd,
            lt: datumDo,
          },
        },
      }));
    });
  });

  describe('generisiRaspored', () => {
    test('uspješno generiše raspored za 2 tima', async () => {
      const takmicenje = {
        takmicenjeId: 1,
        naziv: 'Test liga',
        organizatorId: 1,
      };
      const timovi = [
        { timId: 1, naziv: 'Tim A' },
        { timId: 2, naziv: 'Tim B' },
      ];
      const ucesca = timovi.map((tim) => ({ tim }));

      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue(ucesca);
      mockPrisma.utakmica.findMany.mockResolvedValue([]);
      mockPrisma.utakmica.create.mockResolvedValue({
        utakmicaId: 1,
        domaciTim: { timId: 1, naziv: 'Tim A' },
        gostujuciTim: { timId: 2, naziv: 'Tim B' },
      });

      const result = await matchService.generisiRaspored(
        {
          takmicenjeId: 1,
          pocetniDatum: '2024-01-01',
          defaultnoVrijeme: '15:00',
          defaultnaLokacija: 'Stadion',
        },
        organizator
      );

      expect(result.brojKreiranihUtakmica).toBe(1);
      expect(result.utakmice).toHaveLength(1);
    });

    test('baca grešku ako takmičenje ne postoji', async () => {
      mockPrisma.takmicenje.findUnique.mockResolvedValue(null);

      await expect(
        matchService.generisiRaspored(
          {
            takmicenjeId: 999,
            pocetniDatum: '2024-01-01',
            defaultnoVrijeme: '15:00',
          },
          organizator
        )
      ).rejects.toThrow('Takmičenje sa zadanim ID-em ne postoji');
    });

    test('baca grešku ako korisnik nije organizator takmičenja', async () => {
      const takmicenje = {
        takmicenjeId: 1,
        organizatorId: 2, // drugi korisnik je organizator
      };

      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);

      // korisnikId: 1 nije organizator (organizatorId: 2) i nije admin
      await expect(
        matchService.generisiRaspored(
          {
            takmicenjeId: 1,
            pocetniDatum: '2024-01-01',
            defaultnoVrijeme: '15:00',
          },
          organizator
        )
      ).rejects.toThrow('Nemate pravo da generišete raspored za ovo takmičenje');
    });

    test('administrator može generisati raspored čak i ako nije organizator takmičenja', async () => {
      const takmicenje = {
        takmicenjeId: 1,
        organizatorId: 2, // drugi korisnik je organizator
      };
      const timovi = [
        { timId: 1, naziv: 'Tim A' },
        { timId: 2, naziv: 'Tim B' },
      ];
      const ucesca = timovi.map((tim) => ({ tim }));

      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue(ucesca);
      mockPrisma.utakmica.findMany.mockResolvedValue([]);
      mockPrisma.utakmica.create.mockResolvedValue({
        utakmicaId: 1,
        domaciTim: { timId: 1, naziv: 'Tim A' },
        gostujuciTim: { timId: 2, naziv: 'Tim B' },
      });

      // administrator (korisnikId: 99) smije, čak i ako organizatorId: 2
      const result = await matchService.generisiRaspored(
        {
          takmicenjeId: 1,
          pocetniDatum: '2024-01-01',
          defaultnoVrijeme: '15:00',
        },
        administrator
      );

      expect(result.brojKreiranihUtakmica).toBe(1);
    });

    test('baca grešku ako ima manje od 2 tima', async () => {
      const takmicenje = {
        takmicenjeId: 1,
        organizatorId: 1,
      };

      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue([]);

      await expect(
        matchService.generisiRaspored(
          {
            takmicenjeId: 1,
            pocetniDatum: '2024-01-01',
            defaultnoVrijeme: '15:00',
          },
          organizator
        )
      ).rejects.toThrow('Potrebno je najmanje 2 prijavljena tima za generisanje rasporeda');
    });

    test('koristi sve timove bez filtera po statusPrijave', async () => {
      const takmicenje = {
        takmicenjeId: 1,
        organizatorId: 1,
      };
      const timovi = [
        { timId: 1, naziv: 'Tim A' },
        { timId: 2, naziv: 'Tim B' },
        { timId: 3, naziv: 'Tim C' },
      ];
      const ucesca = timovi.map((tim) => ({ tim }));

      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue(ucesca);
      mockPrisma.utakmica.findMany.mockResolvedValue([]);
      mockPrisma.utakmica.create.mockImplementation(async (data) => ({
        ...data.data,
        utakmicaId: Math.floor(Math.random() * 1000),
        domaciTim: {
          timId: data.data.domaciTimId,
          naziv: `Tim ${String.fromCharCode(64 + data.data.domaciTimId)}`,
        },
        gostujuciTim: {
          timId: data.data.gostujuciTimId,
          naziv: `Tim ${String.fromCharCode(64 + data.data.gostujuciTimId)}`,
        },
      }));

      const result = await matchService.generisiRaspored(
        {
          takmicenjeId: 1,
          pocetniDatum: '2024-01-01',
          defaultnoVrijeme: '15:00',
          defaultnaLokacija: 'Stadion',
        },
        organizator
      );

      // 3 tima → round-robin = 3 utakmice
      expect(result.brojKreiranihUtakmica).toBe(3);
      expect(mockPrisma.ucesceUTakmicenju.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { takmicenjeId: 1 } })
      );
      // Provjera da se ne filtrira po statusPrijave
      expect(mockPrisma.ucesceUTakmicenju.findMany).not.toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ statusPrijave: expect.anything() }) })
      );
    });

    test('koristi podrazumijevanu lokaciju ako defaultnaLokacija nije proslijeđena', async () => {
      const takmicenje = { takmicenjeId: 1, organizatorId: 1 };
      const ucesca = [{ tim: { timId: 1, naziv: 'Tim A' } }, { tim: { timId: 2, naziv: 'Tim B' } }];

      mockPrisma.takmicenje.findUnique.mockResolvedValue(takmicenje);
      mockPrisma.ucesceUTakmicenju.findMany.mockResolvedValue(ucesca);
      mockPrisma.utakmica.findMany.mockResolvedValue([]);
      mockPrisma.utakmica.create.mockResolvedValue({
        utakmicaId: 1,
        lokacijaOpis: 'Stadion Grbavica',
        domaciTim: { timId: 1, naziv: 'Tim A' },
        gostujuciTim: { timId: 2, naziv: 'Tim B' },
      });

      await matchService.generisiRaspored(
        { takmicenjeId: 1, pocetniDatum: '2024-01-01', defaultnoVrijeme: '15:00' },
        organizator
      );

      // Provjera da je lokacijaOpis u create pozivu postavljen na podrazumijevanu vrijednost
      expect(mockPrisma.utakmica.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lokacijaOpis: 'Stadion Grbavica' }),
        })
      );
    });
  });
});