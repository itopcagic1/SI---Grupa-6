const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dohvatiPodatkeZaHomepage() {
  try {
    // Dohvati 3 aktivne lige
    const aktivneLige = await prisma.takmicenje.findMany({
      where: { status: 'AKTIVNA' },
      take: 3,
      include: {
        sport: { select: { naziv: true } },
        _count: { select: { ucesniciTakmicenja: true, utakmice: true } }
      },
      orderBy: { takmicenjeId: 'desc' }
    });

    // Dohvati 3 nadolazeće utakmice (koje još nisu počele)
    const nadolazeceUtakmice = await prisma.utakmica.findMany({
      where: { vrijemePocetka: { gt: new Date() } },
      take: 3,
      include: {
        domaciTim: { select: { naziv: true, logoUrl: true } },
        gostujuciTim: { select: { naziv: true, logoUrl: true } },
        takmicenje: { select: { naziv: true } }
      },
      orderBy: { vrijemePocetka: 'asc' }
    });

    // Dohvati 4 najnovija rezultata (završene utakmice sa rezultatima)
    const najnovijiRezultati = await prisma.rezultatUtakmice.findMany({
      take: 4,
      include: {
        utakmica: {
          include: {
            domaciTim: { select: { naziv: true, logoUrl: true } },
            gostujuciTim: { select: { naziv: true, logoUrl: true } },
            takmicenje: { select: { naziv: true } }
          }
        }
      },
      orderBy: { datumUnosa: 'desc' }
    });

    return {
      aktivneLige,
      nadolazeceUtakmice,
      najnovijiRezultati
    };
  } catch (error) {
    console.error('Greška u homepageService:', error);
    throw new Error('Greška pri dohvatanju podataka za početnu stranicu.');
  }
}

module.exports = {
  dohvatiPodatkeZaHomepage
};
