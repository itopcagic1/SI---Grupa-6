const { Prisma } = require('@prisma/client');
const prisma = require('../config/db');

const SLOBODAN = 'SLOBODAN';
const ZAUZET = 'ZAUZET';
const WAITLIST_REQUEST_STATUS = 'LISTA_CEKANJA';
const WAITLIST_REMOVED_STATUS = 'UKLONJENO_SA_LISTE_CEKANJA';
const WAITLIST_ACTIVE_STATUS = 'AKTIVNA';
const WAITLIST_REMOVED_ITEM_STATUS = 'UKLONJENA';

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

function waitlistWhere(terminId, korisnikId) {
  return {
    zahtjev: {
      terminId,
      korisnikId,
    },
    OR: [
      { statusStavke: null },
      { statusStavke: WAITLIST_ACTIVE_STATUS },
      { statusStavke: 'ACTIVE' },
    ],
  };
}

function mapWaitlistItem(stavka) {
  const termin = stavka.zahtjev.terminObjekta;

  return {
    stavkaId: stavka.stavkaId,
    redniBroj: stavka.redniBroj,
    datumDodavanja: stavka.datumDodavanja,
    statusStavke: stavka.statusStavke,
    termin: {
      terminId: termin.terminId,
      vrijemePocetka: termin.vrijemePocetka,
      vrijemeZavrsetka: termin.vrijemeZavrsetka,
      status: termin.status,
      tipTermina: termin.tipTermina,
      sportskiObjekat: termin.sportskiObjekat,
    },
  };
}

async function prijaviNaListuCekanja(terminIdValue, korisnikIdValue) {
  const terminId = parsePositiveId(terminIdValue, 'terminId');
  const korisnikId = parsePositiveId(korisnikIdValue, 'korisnikId');

  try {
    return await prisma.$transaction(async (tx) => {
    const termin = await tx.terminObjekta.findUnique({
      where: { terminId },
      include: {
        sportskiObjekat: {
          select: { objekatId: true, naziv: true, adresa: true },
        },
      },
    });

    if (!termin) {
      throw serviceError('Termin nije pronadjen.', 404, 'TERMIN_NIJE_PRONADJEN');
    }

    if (termin.status === SLOBODAN) {
      throw serviceError(
        'Lista cekanja je dostupna samo za zauzete termine.',
        400,
        'TERMIN_JE_SLOBODAN'
      );
    }

    if (termin.status !== ZAUZET) {
      throw serviceError(
        'Lista cekanja je dostupna samo za zauzete termine.',
        400,
        'TERMIN_NIJE_ZAUZET'
      );
    }

    const postojecaStavka = await tx.stavkaListeCekanja.findFirst({
      where: waitlistWhere(terminId, korisnikId),
    });

    if (postojecaStavka) {
      throw serviceError(
        'Vec se nalazite na listi cekanja za ovaj termin.',
        409,
        'DUPLA_PRIJAVA'
      );
    }

    const zadnjaStavka = await tx.stavkaListeCekanja.findFirst({
      where: {
        zahtjev: { terminId },
        OR: [
          { statusStavke: null },
          { statusStavke: WAITLIST_ACTIVE_STATUS },
          { statusStavke: 'ACTIVE' },
        ],
      },
      orderBy: { redniBroj: 'desc' },
      select: { redniBroj: true },
    });

    const zahtjev = await tx.zahtjevZaRezervaciju.create({
      data: {
        terminId,
        korisnikId,
        status: WAITLIST_REQUEST_STATUS,
        datumSlanja: new Date(),
      },
    });

    const stavka = await tx.stavkaListeCekanja.create({
      data: {
        zahtjevId: zahtjev.zahtjevId,
        redniBroj: (zadnjaStavka?.redniBroj || 0) + 1,
        statusStavke: WAITLIST_ACTIVE_STATUS,
      },
    });

    return { stavka, termin };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  } catch (error) {
    if (error.code === 'P2034') {
      throw serviceError(
        'Prijava na listu cekanja je vec u obradi. Pokusajte ponovo.',
        409,
        'KONFLIKT_PRIJAVE'
      );
    }

    throw error;
  }
}

async function ukloniSaListeCekanja(terminIdValue, korisnikIdValue) {
  const terminId = parsePositiveId(terminIdValue, 'terminId');
  const korisnikId = parsePositiveId(korisnikIdValue, 'korisnikId');

  const stavka = await prisma.stavkaListeCekanja.findFirst({
    where: waitlistWhere(terminId, korisnikId),
    include: { zahtjev: true },
  });

  if (!stavka) {
    throw serviceError(
      'Niste na listi cekanja za ovaj termin.',
      404,
      'PRIJAVA_NIJE_PRONADJENA'
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.stavkaListeCekanja.update({
      where: { stavkaId: stavka.stavkaId },
      data: { statusStavke: WAITLIST_REMOVED_ITEM_STATUS },
    });

    await tx.zahtjevZaRezervaciju.update({
      where: { zahtjevId: stavka.zahtjevId },
      data: {
        status: WAITLIST_REMOVED_STATUS,
        datumObrade: new Date(),
      },
    });
  });

  return { poruka: 'Uspjesno ste uklonjeni sa liste cekanja.' };
}

async function getMojaListaCekanja(korisnikIdValue) {
  const korisnikId = parsePositiveId(korisnikIdValue, 'korisnikId');

  const stavke = await prisma.stavkaListeCekanja.findMany({
    where: {
      zahtjev: { korisnikId },
      OR: [
        { statusStavke: null },
        { statusStavke: WAITLIST_ACTIVE_STATUS },
        { statusStavke: 'ACTIVE' },
      ],
    },
    include: {
      zahtjev: {
        include: {
          terminObjekta: {
            include: {
              sportskiObjekat: {
                select: { objekatId: true, naziv: true, adresa: true },
              },
            },
          },
        },
      },
    },
    orderBy: { datumDodavanja: 'asc' },
  });

  return stavke.map(mapWaitlistItem);
}

module.exports = {
  prijaviNaListuCekanja,
  ukloniSaListeCekanja,
  getMojaListaCekanja,
  WAITLIST_ACTIVE_STATUS,
};
