const mockPrisma = {
  korisnik: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const {
  getKorisnici,
  obradiZahtjevUloge,
  obrisiKorisnika,
  blokirajKorisnika,
  getBlokiraniKorisnici,
  getKorisnikDetalji,
  promijeniUlogu,
} = require('../../../src/controllers/adminController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('adminController', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('getKorisnici vraca korisnike bez osjetljivih podataka', async () => {
    const korisnici = [
      {
        korisnikId: 1,
        punoIme: 'Test Korisnik',
        email: 'test@example.com',
        uloga: 'NAVIJAC',
        trazenaUloga: 'TRENER',
        statusUloge: 'PENDING',
        statusPouzdanosti: 'AKTIVAN',
        datumZahtjeva: null,
        datumObrade: null,
        razlogOdbijanja: null,
        datumKreiranja: new Date('2026-01-01'),
      },
    ];
    mockPrisma.korisnik.findMany.mockResolvedValue(korisnici);
    const req = { query: {} };
    const res = mockRes();

    await getKorisnici(req, res);

    expect(mockPrisma.korisnik.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({
          lozinka: true,
          password: true,
          lozinkaHash: true,
          refreshToken: true,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('lozinkaHash');
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain('password');
  });

  test('blokiranje korisnika poziva odgovarajucu logiku i vraca success response', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 2,
      email: 'user@example.com',
      uloga: 'NAVIJAC',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 2,
      punoIme: 'User',
      email: 'user@example.com',
      uloga: 'NAVIJAC',
      statusPouzdanosti: 'BLOKIRAN',
    });
    const req = { params: { id: '2' }, body: { akcija: 'BLOKIRAJ' } };
    const res = mockRes();

    await blokirajKorisnika(req, res);

    expect(mockPrisma.korisnik.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { korisnikId: 2 },
        data: expect.objectContaining({ statusPouzdanosti: 'BLOKIRAN' }), 
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ korisnik: expect.objectContaining({ statusPouzdanosti: 'BLOKIRAN' }) })
    );
  });

  test('brisanje korisnika poziva odgovarajucu logiku i vraca success response', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 3,
      email: 'delete@example.com',
      uloga: 'NAVIJAC',
    });
    mockPrisma.korisnik.delete.mockResolvedValue({ korisnikId: 3 });
    const req = { params: { id: '3' } };
    const res = mockRes();

    await obrisiKorisnika(req, res);

    expect(mockPrisma.korisnik.delete).toHaveBeenCalledWith({ where: { korisnikId: 3 } });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ poruka: expect.any(String) }));
  });

  test('odobravanje posebne uloge vraca odgovarajuci response', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 4,
      email: 'coach@example.com',
      uloga: 'NAVIJAC',
      trazenaUloga: 'TRENER',
      statusUloge: 'PENDING',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 4,
      email: 'coach@example.com',
      uloga: 'TRENER',
      trazenaUloga: 'TRENER',
      statusUloge: 'ODOBREN',
      razlogOdbijanja: null,
      datumObrade: new Date('2026-01-02'),
    });
    const req = { params: { id: '4' }, body: { akcija: 'ODOBRI' } };
    const res = mockRes();

    await obradiZahtjevUloge(req, res);

    expect(mockPrisma.korisnik.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          uloga: 'TRENER',
          statusUloge: 'ODOBREN',
          razlogOdbijanja: null,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ korisnik: expect.objectContaining({ statusUloge: 'ODOBREN' }) })
    );
  });

  test('odbijanje posebne uloge vraca odgovarajuci response', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 5,
      email: 'player@example.com',
      uloga: 'NAVIJAC',
      trazenaUloga: 'IGRAC',
      statusUloge: 'PENDING',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 5,
      email: 'player@example.com',
      uloga: 'NAVIJAC',
      trazenaUloga: 'IGRAC',
      statusUloge: 'ODBIJEN',
      razlogOdbijanja: 'Nedostaje dokumentacija.',
      datumObrade: new Date('2026-01-02'),
    });
    const req = {
      params: { id: '5' },
      body: { akcija: 'ODBIJ', razlog: 'Nedostaje dokumentacija.' },
    };
    const res = mockRes();

    await obradiZahtjevUloge(req, res);

    expect(mockPrisma.korisnik.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusUloge: 'ODBIJEN',
          razlogOdbijanja: 'Nedostaje dokumentacija.',
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ korisnik: expect.objectContaining({ statusUloge: 'ODBIJEN' }) })
    );
  });

  test('controller ispravno obradjuje gresku iz baze i vraca error response', async () => {
    mockPrisma.korisnik.findMany.mockRejectedValue(new Error('DB greska'));
    const req = { query: {} };
    const res = mockRes();

    await getKorisnici(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ greska: 'GRESKA_SERVERA' }));
  });

  test('controller ne vraca password/passwordHash/hash u body response-a', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 6,
      email: 'block@example.com',
      uloga: 'NAVIJAC',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 6,
      punoIme: 'Block User',
      email: 'block@example.com',
      uloga: 'NAVIJAC',
      statusPouzdanosti: 'BLOKIRAN',
    });
    const req = { params: { id: '6' }, body: { akcija: 'BLOKIRAJ' } };
    const res = mockRes();

    await blokirajKorisnika(req, res);

    const body = JSON.stringify(res.json.mock.calls[0][0]);
    expect(body).not.toContain('lozinka');
    expect(body).not.toContain('password');
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });

  test('pokusaj rada nad nepostojecim korisnikom vraca 404', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue(null);
    const req = { params: { id: '999' } };
    const res = mockRes();

    await obrisiKorisnika(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'KORISNIK_NIJE_PRONADJEN' })
    );
  });

  test('nevalidni podaci za obradu uloge vracaju validacijsku gresku iz controllera', async () => {
    const req = { params: { id: '7' }, body: { akcija: 'NEVALIDNO' } };
    const res = mockRes();

    await obradiZahtjevUloge(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ greska: 'NEISPRAVNA_AKCIJA' }));
    expect(mockPrisma.korisnik.findUnique).not.toHaveBeenCalled();
  });
});

describe('adminController - novi endpointi (Sprint 6)', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // ─── getBlokiraniKorisnici ───────────────────────────────────────

  test('getBlokiraniKorisnici vraca samo blokirane korisnike', async () => {
    const blokirani = [
      {
        korisnikId: 10,
        punoIme: 'Blokirani Korisnik',
        email: 'blokiran@example.com',
        uloga: 'NAVIJAC',
        statusPouzdanosti: 'BLOKIRAN',
        razlogBlokiranja: 'Kršenje pravila.',
        brojPreksrenihRezervacija: 3,
        datumKreiranja: new Date('2026-01-01'),
      },
    ];
    mockPrisma.korisnik.findMany.mockResolvedValue(blokirani);
    const req = { query: {} };
    const res = mockRes();

    await getBlokiraniKorisnici(req, res);

    expect(mockPrisma.korisnik.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ statusPouzdanosti: 'BLOKIRAN' }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        korisnici: expect.arrayContaining([
          expect.objectContaining({ statusPouzdanosti: 'BLOKIRAN' }),
        ]),
      })
    );
  });

  test('getBlokiraniKorisnici podrzava pretragu po imenu ili emailu', async () => {
    mockPrisma.korisnik.findMany.mockResolvedValue([]);
    const req = { query: { pretraga: 'test' } };
    const res = mockRes();

    await getBlokiraniKorisnici(req, res);

    expect(mockPrisma.korisnik.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          statusPouzdanosti: 'BLOKIRAN',
          OR: expect.any(Array),
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getBlokiraniKorisnici ne vraca osjetljive podatke', async () => {
    mockPrisma.korisnik.findMany.mockResolvedValue([]);
    const req = { query: {} };
    const res = mockRes();

    await getBlokiraniKorisnici(req, res);

    expect(mockPrisma.korisnik.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({
          lozinkaHash: true,
          refreshToken: true,
        }),
      })
    );
  });

  test('getBlokiraniKorisnici obradjuje gresku iz baze i vraca 500', async () => {
    mockPrisma.korisnik.findMany.mockRejectedValue(new Error('DB greska'));
    const req = { query: {} };
    const res = mockRes();

    await getBlokiraniKorisnici(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'GRESKA_SERVERA' })
    );
  });

  // ─── getKorisnikDetalji ──────────────────────────────────────────

  test('getKorisnikDetalji vraca detalje korisnika po ID-u', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 11,
      punoIme: 'Detalji Korisnik',
      email: 'detalji@example.com',
      uloga: 'IGRAC',
      trazenaUloga: null,
      statusUloge: 'ODOBREN',
      statusPouzdanosti: 'AKTIVAN',
      razlogOdbijanja: null,
      razlogBlokiranja: null,
      brojPreksrenihRezervacija: 0,
      datumZahtjeva: null,
      datumObrade: null,
      datumKreiranja: new Date('2026-01-01'),
    });
    const req = { params: { id: '11' } };
    const res = mockRes();

    await getKorisnikDetalji(req, res);

    expect(mockPrisma.korisnik.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { korisnikId: 11 } })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        korisnik: expect.objectContaining({ korisnikId: 11 }),
      })
    );
  });

  test('getKorisnikDetalji vraca 404 za nepostojeci ID', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue(null);
    const req = { params: { id: '999' } };
    const res = mockRes();

    await getKorisnikDetalji(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'KORISNIK_NIJE_PRONADJEN' })
    );
  });

  test('getKorisnikDetalji ne vraca osjetljive podatke', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 12,
      email: 'test@example.com',
      uloga: 'NAVIJAC',
    });
    const req = { params: { id: '12' } };
    const res = mockRes();

    await getKorisnikDetalji(req, res);

    expect(mockPrisma.korisnik.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({
          lozinkaHash: true,
          refreshToken: true,
        }),
      })
    );
    const body = JSON.stringify(res.json.mock.calls[0][0]);
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });

  test('getKorisnikDetalji vraca razlogBlokiranja i brojPreksrenihRezervacija', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 13,
      email: 'blokiran@example.com',
      uloga: 'NAVIJAC',
      statusPouzdanosti: 'BLOKIRAN',
      razlogBlokiranja: 'Neprimjereno ponašanje.',
      brojPreksrenihRezervacija: 2,
    });
    const req = { params: { id: '13' } };
    const res = mockRes();

    await getKorisnikDetalji(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        korisnik: expect.objectContaining({
          razlogBlokiranja: 'Neprimjereno ponašanje.',
          brojPreksrenihRezervacija: 2,
        }),
      })
    );
  });

  test('getKorisnikDetalji obradjuje gresku iz baze i vraca 500', async () => {
    mockPrisma.korisnik.findUnique.mockRejectedValue(new Error('DB greska'));
    const req = { params: { id: '1' } };
    const res = mockRes();

    await getKorisnikDetalji(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'GRESKA_SERVERA' })
    );
  });

  // ─── blokirajKorisnika - razlog ──────────────────────────────────

  test('blokirajKorisnika sprema razlog blokiranja', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 14,
      email: 'test@example.com',
      uloga: 'NAVIJAC',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 14,
      email: 'test@example.com',
      uloga: 'NAVIJAC',
      statusPouzdanosti: 'BLOKIRAN',
      razlogBlokiranja: 'Kršenje pravila.',
    });
    const req = {
      params: { id: '14' },
      body: { akcija: 'BLOKIRAJ', razlog: 'Kršenje pravila.' },
    };
    const res = mockRes();

    await blokirajKorisnika(req, res);

    expect(mockPrisma.korisnik.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusPouzdanosti: 'BLOKIRAN',
          razlogBlokiranja: 'Kršenje pravila.',
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('odblokiravanje korisnika brise razlog blokiranja', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 15,
      email: 'test@example.com',
      uloga: 'NAVIJAC',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 15,
      email: 'test@example.com',
      uloga: 'NAVIJAC',
      statusPouzdanosti: 'AKTIVAN',
      razlogBlokiranja: null,
    });
    const req = { params: { id: '15' }, body: { akcija: 'ODBLOKIRAJ' } };
    const res = mockRes();

    await blokirajKorisnika(req, res);

    expect(mockPrisma.korisnik.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusPouzdanosti: 'AKTIVAN',
          razlogBlokiranja: null,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('blokirajKorisnika bez razloga postavlja razlogBlokiranja na null', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 16,
      email: 'test@example.com',
      uloga: 'NAVIJAC',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 16,
      statusPouzdanosti: 'BLOKIRAN',
      razlogBlokiranja: null,
    });
    const req = { params: { id: '16' }, body: { akcija: 'BLOKIRAJ' } };
    const res = mockRes();

    await blokirajKorisnika(req, res);

    expect(mockPrisma.korisnik.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          razlogBlokiranja: null,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ─── promijeniUlogu ──────────────────────────────────────────────

  test('promijeniUlogu mijenja ulogu i postavlja statusUloge na ODOBREN', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 17,
      email: 'test@example.com',
      uloga: 'NAVIJAC',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 17,
      email: 'test@example.com',
      uloga: 'TRENER',
      statusUloge: 'ODOBREN',
    });
    const req = { params: { id: '17' }, body: { novaUloga: 'TRENER' } };
    const res = mockRes();

    await promijeniUlogu(req, res);

    expect(mockPrisma.korisnik.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          uloga: 'TRENER',
          statusUloge: 'ODOBREN',
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        korisnik: expect.objectContaining({ uloga: 'TRENER', statusUloge: 'ODOBREN' }),
      })
    );
  });

  test('promijeniUlogu vraca 400 za neispravnu ulogu', async () => {
    const req = { params: { id: '18' }, body: { novaUloga: 'NEPOSTOJI' } };
    const res = mockRes();

    await promijeniUlogu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'NEISPRAVNA_ULOGA' })
    );
    expect(mockPrisma.korisnik.findUnique).not.toHaveBeenCalled();
  });

  test('promijeniUlogu vraca 404 za nepostojeci korisnik', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue(null);
    const req = { params: { id: '999' }, body: { novaUloga: 'TRENER' } };
    const res = mockRes();

    await promijeniUlogu(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'KORISNIK_NIJE_PRONADJEN' })
    );
  });

  test('promijeniUlogu ne dozvoljava promjenu uloge administratora', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 19,
      email: 'admin@example.com',
      uloga: 'ADMINISTRATOR',
    });
    const req = { params: { id: '19' }, body: { novaUloga: 'NAVIJAC' } };
    const res = mockRes();

    await promijeniUlogu(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'NIJE_DOZVOLJENO' })
    );
    expect(mockPrisma.korisnik.update).not.toHaveBeenCalled();
  });

  test('promijeniUlogu obradjuje gresku iz baze i vraca 500', async () => {
    mockPrisma.korisnik.findUnique.mockRejectedValue(new Error('DB greska'));
    const req = { params: { id: '20' }, body: { novaUloga: 'TRENER' } };
    const res = mockRes();

    await promijeniUlogu(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ greska: 'GRESKA_SERVERA' })
    );
  });

  test('promijeniUlogu ne vraca osjetljive podatke', async () => {
    mockPrisma.korisnik.findUnique.mockResolvedValue({
      korisnikId: 21,
      email: 'test@example.com',
      uloga: 'NAVIJAC',
    });
    mockPrisma.korisnik.update.mockResolvedValue({
      korisnikId: 21,
      email: 'test@example.com',
      uloga: 'TRENER',
      statusUloge: 'ODOBREN',
    });
    const req = { params: { id: '21' }, body: { novaUloga: 'TRENER' } };
    const res = mockRes();

    await promijeniUlogu(req, res);

    const body = JSON.stringify(res.json.mock.calls[0][0]);
    expect(body).not.toContain('lozinkaHash');
    expect(body).not.toContain('refreshToken');
  });
});