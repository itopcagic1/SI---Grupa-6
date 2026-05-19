const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizeSportName(naziv) {
  return naziv
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function main() {
  const sportsToEnsure = [
    { naziv: 'Fudbal', opis: 'Fudbal', jeTimskiSport: true },
    { naziv: 'Kosarka', opis: 'Kosarka', jeTimskiSport: true },
    { naziv: 'Odbojka', opis: 'Odbojka', jeTimskiSport: true },
    { naziv: 'Tenis', opis: 'Tenis', jeTimskiSport: false },
    { naziv: 'Rukomet', opis: 'Rukomet', jeTimskiSport: true },
    { naziv: 'Hokej na ledu', opis: 'Hokej na ledu', jeTimskiSport: true },
    { naziv: 'Plivanje', opis: 'Plivanje', jeTimskiSport: false }
  ];

  for (const sport of sportsToEnsure) {
    const postoji = await prisma.sport.findFirst({
      where: { naziv: sport.naziv }
    });

    if (!postoji) {
      await prisma.sport.create({ data: sport });
    }
  }

  const sports = await prisma.sport.findMany();
  console.log('SPORTS:', sports);

  const defaultTipovi = {
    fudbal: [
      'Golovi',
      'Asistencije',
      'Zuti kartoni',
      'Crveni kartoni',
      'Golovi iz penala',
      'Sutevi u okvir',
      'Prekrsaji',
      'Posjed lopte',
      'Korneri'
    ],
    kosarka: [
      'Poeni',
      'Asistencije',
      'Skokovi',
      'Ukradene lopte',
      'Blokovi',
      'Prekrsaji',
      'Pogodjene trojke',
      'Izgubljene lopte'
    ],
    odbojka: [
      'Poeni',
      'Asevi',
      'Blokovi',
      'Digovi',
      'Greske'
    ],
    tenis: [
      'Asevi',
      'Dvostruke greske',
      'Winneri',
      'Neiznudjene greske'
    ],
    rukomet: [
      'Golovi',
      'Asistencije',
      'Odbrane',
      'Prekrsaji',
      'Zuti kartoni',
      'Crveni kartoni'
    ],
    'hokej na ledu': [
      'Golovi',
      'Asistencije',
      'Kazneni minuti',
      'Odbrane',
      'Sutevi na gol'
    ],
    plivanje: [
      'Vrijeme trke',
      'Pozicija',
      'Licni rekord',
      'Poeni',
      'Medalje'
    ]
  };

  const sviSportovi = await prisma.sport.findMany();

  for (const sport of sviSportovi) {
    const tipovi = defaultTipovi[normalizeSportName(sport.naziv)] || [];

    for (const nazivStatistike of tipovi) {
      const postoji = await prisma.tipStatistike.findFirst({
        where: {
          sportId: sport.sportId,
          nazivStatistike
        }
      });

      if (!postoji) {
        await prisma.tipStatistike.create({
          data: {
            sportId: sport.sportId,
            nazivStatistike
          }
        });
      }
    }
  }

  console.log('Seeded statistic types.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
