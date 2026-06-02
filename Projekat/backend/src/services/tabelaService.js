const prisma = require('../config/db');

function napraviPrazanRed(tim) {
  return {
    timId: tim.timId,
    naziv: tim.naziv,
    logoUrl: tim.logoUrl,
    odigrane: 0,
    pobjede: 0,
    nerijeseno: 0,
    porazi: 0,
    golovi: 0,
    primljeniGolovi: 0,
    golRazlika: 0,
    bodovi: 0
  };
}

function primijeniRezultat(red, datiGolovi, primljeniGolovi) {
  red.odigrane += 1;
  red.golovi += datiGolovi;
  red.primljeniGolovi += primljeniGolovi;
  red.golRazlika = red.golovi - red.primljeniGolovi;

  if (datiGolovi > primljeniGolovi) {
    red.pobjede += 1;
    red.bodovi += 3;
  } else if (datiGolovi === primljeniGolovi) {
    red.nerijeseno += 1;
    red.bodovi += 1;
  } else {
    red.porazi += 1;
  }
}

const getTabelaZaTakmicenje = async (takmicenjeId, sortBy = 'ukupniBodovi', sezona = null) => {
  const takmicenjeIdNumber = Number(takmicenjeId);

  // Provjeri da li takmičenje postoji
  const takmicenje = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: takmicenjeIdNumber },
    select: { takmicenjeId: true, naziv: true, sezona: true }
  });

  if (!takmicenje) {
    throw new Error('Takmicenje nije pronađeno');
  }

  // Ako je proslijeđena sezona a ne poklapa se, vrati praznu tabelu
  if (sezona && takmicenje.sezona !== sezona) {
    return { takmicenje, tabela: [] };
  }

  // Dohvati sve timove koji učestvuju u takmičenju
  const ucesca = await prisma.ucesceUTakmicenju.findMany({
    where: { takmicenjeId: takmicenjeIdNumber },
    include: {
      tim: {
        select: {
          timId: true,
          naziv: true,
          logoUrl: true
        }
      }
    }
  });

  // Ako nema učešća, pokušaj fallback preko plasmana
  let timovi = ucesca.map((ucesce) => ucesce.tim);

  if (timovi.length === 0) {
    const plasmani = await prisma.plasmanNaTabeli.findMany({
      where: { takmicenjeId: takmicenjeIdNumber },
      include: {
        tim: {
          select: {
            timId: true,
            naziv: true,
            logoUrl: true
          }
        }
      }
    });

    timovi = plasmani.map((plasman) => plasman.tim);
  }

  if (timovi.length === 0) {
    return { takmicenje, tabela: [] };
  }

  // Napravi početnu tabelu sa nulama za sve timove
  const tabelaMap = new Map();

  timovi.forEach((tim) => {
    tabelaMap.set(tim.timId, napraviPrazanRed(tim));
  });

  // Dohvati sve rezultate utakmica za ovo takmičenje
  const rezultati = await prisma.rezultatUtakmice.findMany({
    where: {
      utakmica: {
        takmicenjeId: takmicenjeIdNumber
      }
    },
    include: {
      utakmica: {
        select: {
          domaciTimId: true,
          gostujuciTimId: true
        }
      }
    }
  });

  // Svaki uneseni rezultat odmah mijenja tabelu
  rezultati.forEach((rezultat) => {
    const domaciTimId = rezultat.utakmica.domaciTimId;
    const gostujuciTimId = rezultat.utakmica.gostujuciTimId;

    const domacin = tabelaMap.get(domaciTimId);
    const gost = tabelaMap.get(gostujuciTimId);

    if (!domacin || !gost) return;

    primijeniRezultat(
      domacin,
      rezultat.rezultatDomacin,
      rezultat.rezultatGost
    );

    primijeniRezultat(
      gost,
      rezultat.rezultatGost,
      rezultat.rezultatDomacin
    );
  });

  let tabela = Array.from(tabelaMap.values());

  // Sortiranje
  tabela.sort((a, b) => {
    if (sortBy === 'golRazlika') {
      if (b.golRazlika !== a.golRazlika) return b.golRazlika - a.golRazlika;
      if (b.bodovi !== a.bodovi) return b.bodovi - a.bodovi;
      return b.golovi - a.golovi;
    }

    // default: bodovi
    if (b.bodovi !== a.bodovi) return b.bodovi - a.bodovi;
    if (b.golRazlika !== a.golRazlika) return b.golRazlika - a.golRazlika;
    if (b.golovi !== a.golovi) return b.golovi - a.golovi;

    return a.naziv.localeCompare(b.naziv);
  });

  // Dodaj poziciju
  tabela = tabela.map((tim, index) => ({
    pozicija: index + 1,
    ...tim
  }));

  return { takmicenje, tabela };
};

module.exports = { getTabelaZaTakmicenje };