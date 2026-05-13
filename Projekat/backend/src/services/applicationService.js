const { PrismaClient } = require('@prisma/client');
const { toMyApplicationDto } = require('../dto/applicationDto');

const prisma = new PrismaClient();

async function dohvatiMojePrijave(korisnikId) {
  const prijave = await prisma.ucesceUTakmicenju.findMany({
    where: {
      prijavioKorisnikId: Number(korisnikId),
      tim: {
        clanstvaUcesnika: {
          some: {
            korisnikId: Number(korisnikId),
            ulogaUTimu: 'TRENER',
            status: 'ACTIVE',
          },
        },
      },
    },
    include: {
      tim: {
        select: {
          timId: true,
          naziv: true,
        },
      },
      takmicenje: {
        select: {
          takmicenjeId: true,
          naziv: true,
          sport: {
            select: {
              sportId: true,
              naziv: true,
            },
          },
          utakmice: {
            select: {
              utakmicaId: true,
              vrijemePocetka: true,
              lokacijaOpis: true,
              sportskiObjekat: {
                select: {
                  objekatId: true,
                  naziv: true,
                  adresa: true,
                },
              },
            },
            orderBy: {
              vrijemePocetka: 'asc',
            },
          },
        },
      },
    },
    orderBy: {
      datumPrijave: 'desc',
    },
  });

  return prijave.map(toMyApplicationDto);
}

async function kreirajPrijavu({ timId, takmicenjeId }, korisnikId) {
  if (!timId || !takmicenjeId) {
    const error = new Error('Tim i takmičenje su obavezni.');
    error.status = 400;
    error.code = 'NEDOSTAJU_PODACI';
    throw error;
  }

  const [tim, takmicenje] = await Promise.all([
    prisma.tim.findUnique({
      where: { timId: Number(timId) },
    }),
    prisma.takmicenje.findUnique({
      where: { takmicenjeId: Number(takmicenjeId) },
    }),
  ]);

  if (!tim) {
    const error = new Error('Tim nije pronađen.');
    error.status = 404;
    error.code = 'TIM_NIJE_PRONADJEN';
    throw error;
  }

  if (!takmicenje) {
    const error = new Error('Liga/takmičenje nije pronađeno.');
    error.status = 404;
    error.code = 'TAKMICENJE_NIJE_PRONADJENO';
    throw error;
  }

  const trenerTima = await prisma.clanstvoTima.findFirst({
    where: {
      timId: Number(timId),
      korisnikId: Number(korisnikId),
      ulogaUTimu: 'TRENER',
      status: 'ACTIVE',
    },
  });

  if (!trenerTima) {
    const error = new Error('Nemate dozvolu za prijavu ovog tima.');
    error.status = 403;
    error.code = 'TRENER_NIJE_POVEZAN_S_TIMOM';
    throw error;
  }

  if (tim.sportId !== takmicenje.sportId) {
    const error = new Error('Sport tima se ne poklapa sa sportom takmičenja.');
    error.status = 400;
    error.code = 'SPORT_SE_NE_POKLAPA';
    throw error;
  }

  const postojecaPrijava = await prisma.ucesceUTakmicenju.findFirst({
    where: {
      timId: Number(timId),
      takmicenjeId: Number(takmicenjeId),
    },
  });

  if (postojecaPrijava) {
    const error = new Error('Tim je već prijavljen na ovo takmičenje.');
    error.status = 409;
    error.code = 'TIM_VEC_PRIJAVLJEN';
    throw error;
  }

  return await prisma.ucesceUTakmicenju.create({
    data: {
      timId: Number(timId),
      takmicenjeId: Number(takmicenjeId),
      prijavioKorisnikId: Number(korisnikId),
      statusPrijave: 'PENDING',
    },
    include: {
      tim: {
        select: {
          timId: true,
          naziv: true,
        },
      },
      takmicenje: {
        select: {
          takmicenjeId: true,
          naziv: true,
        },
      },
    },
  });
}

module.exports = {
  dohvatiMojePrijave,
  kreirajPrijavu,
};