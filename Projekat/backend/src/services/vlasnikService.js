const prisma = require('../config/db');

const PENDING_STATUSES = ['NA_CEKANJU', 'CEKANJE'];
const SLOBODAN = 'SLOBODAN';
const ZAUZET = 'ZAUZET';

function serviceError(message, status = 400, code = 'GRESKA') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function parsePositiveId(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw serviceError(`${fieldName} mora biti pozitivan cijeli broj.`, 400, 'NEVALIDAN_ID');
  }
  return parsed;
}

function parseOptionalPositiveId(value, fieldName) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw serviceError(`${fieldName} mora biti pozitivan cijeli broj.`, 400, 'NEVALIDAN_ID');
  }
  return parsed;
}

function parsePage(value) {
  if (value === undefined || value === null || value === '') return 1;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw serviceError('page mora biti pozitivan cijeli broj.', 400, 'NEVALIDNA_STRANICA');
  }
  return parsed;
}

function parseLimit(value) {
  if (value === undefined || value === null || value === '') return 15;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw serviceError('limit mora biti pozitivan cijeli broj.', 400, 'NEVALIDAN_LIMIT');
  }
  return Math.min(parsed, 50);
}

function parseDateStart(value, fieldName) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw serviceError(`${fieldName} mora biti validan datum.`, 400, 'NEVALIDAN_DATUM');
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseDateEnd(value, fieldName) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw serviceError(`${fieldName} mora biti validan datum.`, 400, 'NEVALIDAN_DATUM');
  }
  date.setHours(23, 59, 59, 999);
  return date;
}

function normalizujStatus(status) {
  if (!status) return 'NA_CEKANJU';
  const statusUpper = status.toUpperCase();
  if (['POTVRDJENA', 'POTVRDJENO', 'ODOBRENO'].includes(statusUpper)) {
    return 'POTVRDJENO';
  }
  if (['CEKANJE', 'NA_CEKANJU'].includes(statusUpper)) {
    return 'NA_CEKANJU';
  }
  if (['OTKAZANA', 'OTKAZANO', 'ODBIJENO'].includes(statusUpper)) {
    return 'OTKAZANO';
  }
  return statusUpper;
}

function normalizujTipTermina(tipTermina, korisnik) {
  const tip = String(tipTermina || '').toUpperCase();
  if (tip.includes('GRUP')) return 'Grupni';
  if (tip.includes('INDIVID')) return 'Individualni';
  const uloga = String(korisnik?.uloga || korisnik?.trenutnaUloga || '').toUpperCase();
  if (uloga === 'TRENER') return 'Grupni';
  if (uloga === 'IGRAC') return 'Individualni';
  return 'Nepoznato';
}

function assertVlasnik(korisnik) {
  if (!korisnik || korisnik.uloga !== 'VLASNIK') {
    throw serviceError('Pristup dozvoljen samo vlasnicima.', 403, 'ZABRANJEN_PRISTUP');
  }
}

function assertZahtjevPripadaVlasniku(zahtjev, vlasnikId) {
  const zahtjevVlasnikId = zahtjev?.terminObjekta?.sportskiObjekat?.vlasnikId;
  if (zahtjevVlasnikId !== vlasnikId) {
    throw serviceError('Ne možete obraditi zahtjev za tuđi sportski objekat.', 403, 'ZABRANJEN_PRISTUP');
  }
}

function assertPendingZahtjev(zahtjev) {
  if (!PENDING_STATUSES.includes(zahtjev.status)) {
    throw serviceError('Zahtjev više nije na čekanju i ne može se ponovo obraditi.', 409, 'ZAHTJEV_NIJE_PENDING');
  }
}

function napraviNotifikaciju({ korisnikId, tipNotifikacije, sadrzajPoruke }) {
  return {
    korisnikId,
    tipNotifikacije,
    sadrzajPoruke,
    status: 'NEPROCITANO',
  };
}

function mapirajRezervaciju(rezervacija) {
  const zahtjev = rezervacija.zahtjev;
  const termin = rezervacija.terminObjekta;
  const objekat = termin?.sportskiObjekat;
  const korisnik = zahtjev?.korisnik;

  return {
    id: rezervacija.rezervacijaId,
    izvor: 'REZERVACIJA',
    korisnik: {
      id: korisnik?.korisnikId,
      punoIme: korisnik?.punoIme || korisnik?.email || 'Nepoznat korisnik',
      email: korisnik?.email,
      statusPouzdanosti: korisnik?.statusPouzdanosti || 'POUZDAN',
      brojPrekrsenihRezervacija: korisnik?.brojPreksrenihRezervacija || 0,
    },
    teren: {
      id: objekat?.objekatId,
      naziv: objekat?.naziv || 'Nepoznat teren',
    },
    datumVrijeme: termin?.vrijemePocetka,
    vrijemePocetka: termin?.vrijemePocetka,
    vrijemeZavrsetka: termin?.vrijemeZavrsetka,
    tipTermina: normalizujTipTermina(termin?.tipTermina, korisnik),
    status: normalizujStatus(rezervacija.status),
    datumKreiranja: rezervacija.datumKreiranja,
  };
}

function mapirajZahtjev(zahtjev) {
  const termin = zahtjev.terminObjekta;
  const objekat = termin?.sportskiObjekat;
  const korisnik = zahtjev.korisnik;

  return {
    id: zahtjev.zahtjevId,
    izvor: 'ZAHTJEV_ZA_REZERVACIJU',
    korisnik: {
      id: korisnik?.korisnikId,
      punoIme: korisnik?.punoIme || korisnik?.email || 'Nepoznat korisnik',
      email: korisnik?.email,
      statusPouzdanosti: korisnik?.statusPouzdanosti || 'POUZDAN',
      brojPrekrsenihRezervacija: korisnik?.brojPreksrenihRezervacija || 0,
    },
    teren: {
      id: objekat?.objekatId,
      naziv: objekat?.naziv || 'Nepoznat teren',
    },
    datumVrijeme: termin?.vrijemePocetka,
    vrijemePocetka: termin?.vrijemePocetka,
    vrijemeZavrsetka: termin?.vrijemeZavrsetka,
    tipTermina: normalizujTipTermina(termin?.tipTermina, korisnik),
    status: normalizujStatus(zahtjev.status),
    datumKreiranja: zahtjev.datumSlanja,
  };
}

function napraviWhereZaTermin({ vlasnikId, terenId, datumOd, datumDo }) {
  const where = {
    sportskiObjekat: {
      vlasnikId,
    },
  };

  if (terenId) {
    where.objekatId = terenId;
  }

  if (datumOd || datumDo) {
    where.vrijemePocetka = {};
    if (datumOd) where.vrijemePocetka.gte = datumOd;
    if (datumDo) where.vrijemePocetka.lte = datumDo;
  }

  return where;
}

async function izracunajAnalitiku(vlasnikId) {
  const danasPocetak = new Date();
  danasPocetak.setHours(0, 0, 0, 0);

  const danasKraj = new Date();
  danasKraj.setHours(23, 59, 59, 999);

  const [ukupnoRezervacijaDanas, zahtjeviNaCekanju] = await Promise.all([
    prisma.rezervacija.count({
      where: {
        terminObjekta: {
          sportskiObjekat: { vlasnikId },
          vrijemePocetka: { gte: danasPocetak, lte: danasKraj },
        },
      },
    }),
    prisma.zahtjevZaRezervaciju.count({
      where: {
        status: { in: ['NA_CEKANJU', 'CEKANJE'] },
        terminObjekta: { sportskiObjekat: { vlasnikId } },
      },
    }),
  ]);

  return { ukupnoRezervacijaDanas, zahtjeviNaCekanju };
}

const dohvatiSveRezervacijeService = async (korisnik, query) => {
  assertVlasnik(korisnik);

  const vlasnikId = korisnik.korisnikId;
  const terenId = parseOptionalPositiveId(query.terenId, 'terenId');
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);
  const datumOd = parseDateStart(query.datumOd, 'datumOd');

  const datumDo = query.datumDo
    ? parseDateEnd(query.datumDo, 'datumDo')
    : query.datumOd
      ? parseDateEnd(query.datumOd, 'datumOd')
      : undefined;

  const terminWhere = napraviWhereZaTermin({ vlasnikId, terenId, datumOd, datumDo });

  const [rezervacije, zahtjeviNaCekanju, analytics] = await Promise.all([
    prisma.rezervacija.findMany({
      where: { terminObjekta: terminWhere },
      include: {
        zahtjev: {
          include: {
            korisnik: {
              select: {
                korisnikId: true,
                punoIme: true,
                email: true,
                uloga: true,
                statusPouzdanosti: true,
                brojPreksrenihRezervacija: true,
              },
            },
          },
        },
        terminObjekta: {
          include: {
            sportskiObjekat: { select: { objekatId: true,  naziv: true } },
          },
        },
      },
    }),
    prisma.zahtjevZaRezervaciju.findMany({
      where: {
        status: { in: ['NA_CEKANJU', 'CEKANJE'] },
        terminObjekta: terminWhere,
      },
      include: {
        korisnik: {
          select: {
            korisnikId: true,
            punoIme: true,
            email: true,
            uloga: true,
            statusPouzdanosti: true,
            brojPreksrenihRezervacija: true,
          },
        },
        terminObjekta: {
          include: {
            sportskiObjekat: { select: { objekatId: true, naziv: true } },
          },
        },
      },
    }),
    izracunajAnalitiku(vlasnikId)
  ]);

  const objedinjeno = [
    ...rezervacije.map(mapirajRezervaciju),
    ...zahtjeviNaCekanju.map(mapirajZahtjev),
  ].sort((a, b) => {
    const datumA = new Date(a.datumVrijeme || a.datumKreiranja).getTime();
    const datumB = new Date(b.datumVrijeme || b.datumKreiranja).getTime();
    return datumB - datumA;
  });

  const total = objedinjeno.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const data = objedinjeno.slice(startIndex, startIndex + limit);

  return {
    data,
    pagination: { page, limit, total, totalPages },
    analytics,
  };
};

async function dohvatiZahtjevZaObradu(tx, zahtjevId) {
  const zahtjev = await tx.zahtjevZaRezervaciju.findUnique({
    where: { zahtjevId },
    include: {
      korisnik: {
        select: {
          korisnikId: true,
          punoIme: true,
          email: true,
        },
      },
      terminObjekta: {
        include: {
          sportskiObjekat: {
            select: {
              objekatId: true,
              naziv: true,
              vlasnikId: true,
            },
          },
        },
      },
    },
  });

  if (!zahtjev) {
    throw serviceError('Zahtjev nije pronađen.', 404, 'ZAHTJEV_NIJE_PRONADJEN');
  }

  return zahtjev;
}

async function odobriZahtjev(tx, zahtjev, vlasnikId) {
  if (zahtjev.terminObjekta.status !== SLOBODAN) {
    throw serviceError('Termin više nije slobodan.', 409, 'TERMIN_NIJE_SLOBODAN');
  }

  const postojecaRezervacija = await tx.rezervacija.findFirst({
    where: {
      terminId: zahtjev.terminId,
      status: 'POTVRDJENA',
    },
  });

  if (postojecaRezervacija) {
    throw serviceError('Termin već ima potvrđenu rezervaciju.', 409, 'TERMIN_NIJE_SLOBODAN');
  }

  const datumObrade = new Date();

  const azuriranZahtjev = await tx.zahtjevZaRezervaciju.update({
    where: { zahtjevId: zahtjev.zahtjevId },
    data: {
      status: 'ODOBRENO',
      datumObrade,
      razlogOdbijanja: null,
      obradioKorisnikId: vlasnikId,
    },
    include: {
      korisnik: { select: { korisnikId: true, punoIme: true, email: true } },
      terminObjekta: {
        include: {
          sportskiObjekat: { select: { objekatId: true, naziv: true, vlasnikId: true } },
        },
      },
    },
  });

  const rezervacija = await tx.rezervacija.create({
    data: {
      zahtjevId: zahtjev.zahtjevId,
      terminId: zahtjev.terminId,
      status: 'POTVRDJENA',
      datumPotvrde: datumObrade,
    },
  });

  await tx.terminObjekta.update({
    where: { terminId: zahtjev.terminId },
    data: { status: ZAUZET },
  });

  await tx.notifikacija.create({
    data: napraviNotifikaciju({
      korisnikId: zahtjev.korisnikId,
      tipNotifikacije: 'ZAHTJEV_REZERVACIJE_ODOBREN',
      sadrzajPoruke: `Vaš zahtjev za rezervaciju termina je odobren.`,
    }),
  });

  return {
    message: 'Zahtjev je odobren.',
    zahtjev: azuriranZahtjev,
    rezervacija,
  };
}

async function odbijZahtjev(tx, zahtjev, vlasnikId, razlogOdbijanja) {
  const razlog = String(razlogOdbijanja || '').trim();

  if (razlog.length < 10) {
    throw serviceError('Razlog odbijanja mora imati najmanje 10 karaktera.', 400, 'NEVALIDAN_RAZLOG_ODBIJANJA');
  }

  const datumObrade = new Date();

  const azuriranZahtjev = await tx.zahtjevZaRezervaciju.update({
    where: { zahtjevId: zahtjev.zahtjevId },
    data: {
      status: 'ODBIJENO',
      datumObrade,
      razlogOdbijanja: razlog,
      obradioKorisnikId: vlasnikId,
    },
    include: {
      korisnik: { select: { korisnikId: true, punoIme: true, email: true } },
      terminObjekta: {
        include: {
          sportskiObjekat: { select: { objekatId: true,  naziv: true, vlasnikId: true } },
        },
      },
    },
  });

  if (zahtjev.terminObjekta.status === 'ZAKLJUCAN') {
    await tx.terminObjekta.update({
      where: { terminId: zahtjev.terminId },
      data: { status: SLOBODAN },
    });
  }

  await tx.notifikacija.create({
    data: napraviNotifikaciju({
      korisnikId: zahtjev.korisnikId,
      tipNotifikacije: 'ZAHTJEV_REZERVACIJE_ODBIJEN',
      sadrzajPoruke: `Vaš zahtjev za rezervaciju termina je odbijen. Razlog: ${razlog}`,
    }),
  });

  return {
    message: 'Zahtjev je odbijen.',
    zahtjev: azuriranZahtjev,
  };
}

const obradiZahtjevVerifikacijeService = async (korisnik, zahtjevIdValue, body = {}) => {
  assertVlasnik(korisnik);

  const zahtjevId = parsePositiveId(zahtjevIdValue, 'zahtjevId');
  const akcija = String(body.akcija || '').toUpperCase();

  if (!['ODOBRI', 'ODBIJ'].includes(akcija)) {
    throw serviceError('Akcija mora biti ODOBRI ili ODBIJ.', 400, 'NEISPRAVNA_AKCIJA');
  }

  // DODAN TIMEOUT: Proslijeđen konfiguracijski objekat sa postavkama timeout-a na 15000 ms
  return prisma.$transaction(async (tx) => {
    const zahtjev = await dohvatiZahtjevZaObradu(tx, zahtjevId);

    assertZahtjevPripadaVlasniku(zahtjev, korisnik.korisnikId);
    assertPendingZahtjev(zahtjev);

    if (akcija === 'ODOBRI') {
      return odobriZahtjev(tx, zahtjev, korisnik.korisnikId);
    }

    return odbijZahtjev(tx, zahtjev, korisnik.korisnikId, body.razlogOdbijanja);
  }, {
    timeout: 15000 // 15 sekundi tolerancije za izvršavanje transakcije
  });
};

const otkaziRezervacijuVlasnikService = async (rezervacijaId, vlasnikId, razlog) => {
  if (!razlog || razlog.trim().length < 10) {
    throw serviceError(
      'Razlog otkazivanja mora imati najmanje 10 karaktera.',
      400,
      'RAZLOG_OBAVEZAN'
    );
  }
  
  const rezervacija = await prisma.rezervacija.findUnique({
    where: { rezervacijaId: parseInt(rezervacijaId, 10) },
    include: {
      terminObjekta: {
        include: { sportskiObjekat: true }
      }
    }
  });

  if (!rezervacija) {
    throw serviceError('Rezervacija nije pronađena.', 404, 'NIJE_PRONADJENA');
  }

  if (rezervacija.terminObjekta.sportskiObjekat.vlasnikId !== vlasnikId) {
    throw serviceError('Nemate pravo otkazati ovu rezervaciju.', 403, 'ZABRANJEN_PRISTUP');
  }

  if (rezervacija.status !== 'POTVRDJENA') {
    throw serviceError('Samo potvrđene rezervacije se mogu otkazati.', 400, 'NEVALIDAN_STATUS');
  }

  const terminPocetakMs = new Date(rezervacija.terminObjekta.vrijemePocetka).getTime();
  const saatMs = new Date().getTime();
  const saatiDoTermina = (terminPocetakMs - saatMs) / (1000 * 60 * 60);

  if (saatiDoTermina < 24) {
    throw serviceError(
      'Nije moguće otkazati rezervaciju unutar 24 sata prije termina.',
      403,
      'ISTEKLO_VRIJEME_OTKAZIVANJA'
    );
  }

  // DODAN TIMEOUT I OPTIMIZOVANA TRANSAKCIJA: Spojena dva update-a nad istim modelom u jedan korak
  await prisma.$transaction(async (tx) => {
    await tx.rezervacija.update({
      where: { rezervacijaId: rezervacija.rezervacijaId },
      data: { 
        status: 'OTKAZANA',
        razlogOtkazivanja: razlog,
        datumOtkazivanja: new Date()
      }
    });

    await tx.zahtjevZaRezervaciju.updateMany({
      where: { zahtjevId: rezervacija.zahtjevId },
      data: { status: 'OTKAZANO' }
    });

    await tx.terminObjekta.update({
      where: { terminId: rezervacija.terminId },
      data: { status: 'SLOBODAN' }
    });
  }, {
    timeout: 15000
  });

  return { poruka: 'Rezervacija je uspješno otkazana.' };
};

module.exports = {
  dohvatiSveRezervacijeService,
  obradiZahtjevVerifikacijeService,
  otkaziRezervacijuVlasnikService,
};
