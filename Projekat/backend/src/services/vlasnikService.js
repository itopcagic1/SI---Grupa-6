const prisma = require('../config/db');

function serviceError(message, status = 400, code = 'GRESKA') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
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

function normalizujTipTermina(tipTermina) {
  if (!tipTermina) return 'Individualni';

  const tip = tipTermina.toUpperCase();

  if (tip.includes('GRUP')) return 'Grupni';
  if (tip.includes('INDIVID')) return 'Individualni';

  return tipTermina;
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
    tipTermina: normalizujTipTermina(termin?.tipTermina),
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
    tipTermina: normalizujTipTermina(termin?.tipTermina),
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

    if (datumOd) {
      where.vrijemePocetka.gte = datumOd;
    }

    if (datumDo) {
      where.vrijemePocetka.lte = datumDo;
    }
  }

  return where;
}

async function izracunajAnalitiku(vlasnikId) {
  const danasPocetak = new Date();
  danasPocetak.setHours(0, 0, 0, 0);

  const danasKraj = new Date();
  danasKraj.setHours(23, 59, 59, 999);

  const ukupnoRezervacijaDanas = await prisma.rezervacija.count({
    where: {
      terminObjekta: {
        sportskiObjekat: {
          vlasnikId,
        },
        vrijemePocetka: {
          gte: danasPocetak,
          lte: danasKraj,
        },
      },
    },
  });

  const zahtjeviNaCekanju = await prisma.zahtjevZaRezervaciju.count({
    where: {
      status: 'CEKANJE',
      terminObjekta: {
        sportskiObjekat: {
          vlasnikId,
        },
      },
    },
  });

  return {
    ukupnoRezervacijaDanas,
    zahtjeviNaCekanju,
  };
}

const dohvatiSveRezervacijeService = async (korisnik, query) => {
  if (!korisnik || korisnik.uloga !== 'VLASNIK') {
    throw serviceError('Pristup dozvoljen samo vlasnicima.', 403, 'ZABRANJEN_PRISTUP');
  }

  const vlasnikId = korisnik.korisnikId;
  const terenId = parseOptionalPositiveId(query.terenId, 'terenId');
  const page = parsePage(query.page);
  const limit = parseLimit(query.limit);

  const datumOd = parseDateStart(query.datumOd, 'datumOd');

  // Ako frontend šalje samo jedan datum iz DatePicker-a, tretiramo ga kao jedan dan.
  // Ako kasnije pošaljete datumDo, podržan je i opseg.
  const datumDo = query.datumDo
    ? parseDateEnd(query.datumDo, 'datumDo')
    : query.datumOd
      ? parseDateEnd(query.datumOd, 'datumOd')
      : undefined;

  const terminWhere = napraviWhereZaTermin({
    vlasnikId,
    terenId,
    datumOd,
    datumDo,
  });

  const rezervacije = await prisma.rezervacija.findMany({
    where: {
      terminObjekta: terminWhere,
    },
    include: {
      zahtjev: {
        include: {
          korisnik: {
            select: {
              korisnikId: true,
              punoIme: true,
              email: true,
              statusPouzdanosti: true,
              brojPreksrenihRezervacija: true,
            },
          },
        },
      },
      terminObjekta: {
        include: {
          sportskiObjekat: {
            select: {
              objekatId: true,
              naziv: true,
            },
          },
        },
      },
    },
  });

  const zahtjeviNaCekanju = await prisma.zahtjevZaRezervaciju.findMany({
    where: {
      status: 'CEKANJE',
      terminObjekta: terminWhere,
    },
    include: {
      korisnik: {
        select: {
          korisnikId: true,
          punoIme: true,
          email: true,
          statusPouzdanosti: true,
          brojPreksrenihRezervacija: true,
        },
      },
      terminObjekta: {
        include: {
          sportskiObjekat: {
            select: {
              objekatId: true,
              naziv: true,
            },
          },
        },
      },
    },
  });

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

  const analytics = await izracunajAnalitiku(vlasnikId);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    analytics,
  };
};

module.exports = {
  dohvatiSveRezervacijeService,
};