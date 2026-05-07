const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
}

main().catch(console.error).finally(() => prisma.$disconnect());
