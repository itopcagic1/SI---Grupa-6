const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTabelaZaTakmicenje = async (takmicenjeId, sortBy = 'ukupniBodovi', sezona = null) => {

  // Provjeri da li takmicenje postoji
  const takmicenje = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: parseInt(takmicenjeId) },
    select: { takmicenjeId: true, naziv: true, sezona: true }
  });

  if (!takmicenje) throw new Error('Takmicenje nije pronađeno');

  // Ako je proslijeđena sezona a ne poklapa se, vrati praznu tabelu
  if (sezona && takmicenje.sezona !== sezona) {
    return { takmicenje, tabela: [] };
  }

  // Dohvati sve plasmane za ovo takmicenje, sa podacima o timu
  const plasmani = await prisma.plasmanNaTabeli.findMany({
    where: { takmicenjeId: parseInt(takmicenjeId) },
    include: {
      tim: {
        select: { timId: true, naziv: true, logoUrl: true }
      }
    }
  });

  if (plasmani.length === 0) return { takmicenje, tabela: [] };

  // Za svaki tim izracunaj golove iz RezultatUtakmice
  const tabela = await Promise.all(plasmani.map(async (plasman) => {
    const timId = plasman.timId;

    const rezultati = await prisma.rezultatUtakmice.findMany({
      where: {
        utakmica: {
          takmicenjeId: parseInt(takmicenjeId),
          OR: [{ domaciTimId: timId }, { gostujuciTimId: timId }]
        }
      },
      include: {
        utakmica: { select: { domaciTimId: true, gostujuciTimId: true } }
      }
    });

    // Saberi golove za i protiv
    let golovi = 0;
    let primljeniGolovi = 0;

    rezultati.forEach(r => {
      if (r.utakmica.domaciTimId === timId) {
        golovi += r.rezultatDomacin;
        primljeniGolovi += r.rezultatGost;
      } else {
        golovi += r.rezultatGost;
        primljeniGolovi += r.rezultatDomacin;
      }
    });

    return {
      timId: plasman.timId,
      naziv: plasman.tim.naziv,
      logoUrl: plasman.tim.logoUrl,
      odigrane: plasman.brojPobjeda + plasman.brojNerijesenih + plasman.brojPoraza,
      pobjede: plasman.brojPobjeda,
      nerijeseno: plasman.brojNerijesenih,
      porazi: plasman.brojPoraza,
      golovi,
      primljeniGolovi,
      golRazlika: golovi - primljeniGolovi,
      bodovi: plasman.ukupniBodovi
    };
  }));

  // Sortiraj – bodovi primarno, gol razlika kao tiebreaker
  const sortirano = tabela.sort((a, b) => {
    if (sortBy === 'pobjede') return b.pobjede - a.pobjede;
    if (sortBy === 'golRazlika') return b.golRazlika - a.golRazlika;
    if (b.bodovi !== a.bodovi) return b.bodovi - a.bodovi;
    return b.golRazlika - a.golRazlika;
  });

  // Dodaj poziciju (1, 2, 3...) na osnovu sortiranja
  const saPozicijom = sortirano.map((tim, index) => ({
    pozicija: index + 1,
    ...tim
  }));

  return { takmicenje, tabela: saPozicijom };
};

module.exports = { getTabelaZaTakmicenje };