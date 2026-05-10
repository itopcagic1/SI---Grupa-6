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
          lokacija: true,
          lokacijaOpis: true,
          sport: {
            select: {
              sportId: true,
              naziv: true,
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

module.exports = {
  dohvatiMojePrijave,
};
