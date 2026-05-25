const prisma = require('../config/db');
const { emitToUsers } = require('../websocket');

const WAITLIST_ACTIVE_STATUSES = ['AKTIVNA', 'ACTIVE'];

function buildTerminPayload(termin) {
  return {
    terminId: termin.terminId,
    vrijemePocetka: termin.vrijemePocetka,
    vrijemeZavrsetka: termin.vrijemeZavrsetka,
    status: termin.status,
    sportskiObjekat: termin.sportskiObjekat
      ? {
          objekatId: termin.sportskiObjekat.objekatId,
          naziv: termin.sportskiObjekat.naziv,
          adresa: termin.sportskiObjekat.adresa,
        }
      : null,
  };
}

async function notifyTerminOslobodjen(terminId) {
  const termin = await prisma.terminObjekta.findUnique({
    where: { terminId: Number(terminId) },
    include: {
      sportskiObjekat: {
        select: { objekatId: true, naziv: true, adresa: true },
      },
      zahtjeviZaRezervaciju: {
        include: {
          stavkeListeCekanja: true,
        },
      },
    },
  });

  if (!termin) {
    return { poslano: 0, korisnikIds: [] };
  }

  const korisnikIds = (termin.zahtjeviZaRezervaciju || [])
    .filter((zahtjev) => (
      zahtjev.stavkeListeCekanja?.some((stavka) => (
        !stavka.statusStavke || WAITLIST_ACTIVE_STATUSES.includes(stavka.statusStavke)
      ))
    ))
    .map((zahtjev) => zahtjev.korisnikId);

  const payload = {
    termin: buildTerminPayload(termin),
    terminId: termin.terminId,
    poruka: 'Termin za koji ste bili na listi cekanja je upravo oslobodjen.',
  };

  const poslano = emitToUsers(korisnikIds, 'termin-oslobodjen', payload);

  return { poslano, korisnikIds: [...new Set(korisnikIds)], payload };
}

module.exports = {
  notifyTerminOslobodjen,
};
