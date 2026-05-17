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
  const sports = await prisma.sport.findMany();
  console.log('SPORTS:', sports);

  if (sports.length === 0) {
    await prisma.sport.createMany({
      data: [
        { naziv: 'Fudbal', opis: 'Fudbal', jeTimskiSport: true },
        { naziv: 'Kosarka', opis: 'Kosarka', jeTimskiSport: true },
        { naziv: 'Tenis', opis: 'Tenis', jeTimskiSport: false }
      ]
    });
    console.log('Seeded sports.');
  } else {
    console.log('Sports already exist.');
  }

  const defaultTipovi = {
    fudbal: ['Golovi', 'Asistencije', 'Zuti kartoni', 'Crveni kartoni', 'Prekrsaji', 'Posjed lopte'],
    kosarka: ['Poeni', 'Asistencije', 'Skokovi', 'Prekrsaji', 'Blokade', 'Ukradene lopte'],
    odbojka: ['Poeni', 'Asistencije', 'Blokovi', 'Servis greske'],
    tenis: ['Asevi', 'Dvostruke greske', 'Winneri', 'Neiznudjene greske'],
    rukomet: ['Golovi', 'Asistencije', 'Iskljucenja', 'Zuti kartoni', 'Odbrane'],
    plivanje: ['Vrijeme', 'Pozicija', 'Bodovi'],
    'hokej na ledu': ['Golovi', 'Asistencije', 'Kazne', 'Sutevi']
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
