const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getPublicMatches({ sportId, takmicenjeId, timId, datumOd, datumDo } = {}) {
  const where = {};

  if (takmicenjeId) {
    where.takmicenjeId = takmicenjeId;
  }

  if (sportId) {
    where.takmicenje = {
      sportId
    };
  }

  if (timId) {
    where.OR = [
      { domaciTimId: timId },
      { gostujuciTimId: timId }
    ];
  }

  if (datumOd && datumDo) {
    where.vrijemePocetka = {
      gte: datumOd,
      lt: datumDo
    };
  }

  return prisma.utakmica.findMany({
    where,
    include: {
      domaciTim: { select: { timId: true, naziv: true, logoUrl: true } },
      gostujuciTim: { select: { timId: true, naziv: true, logoUrl: true } },
      takmicenje: {
        select: {
          takmicenjeId: true,
          naziv: true,
          sportId: true,
          sport: { select: { sportId: true, naziv: true } }
        }
      },
      sportskiObjekat: {
        select: {
          objekatId: true,
          naziv: true,
          adresa: true
        }
      },
      rezultatUtakmice: {
        select: {
          rezultatUtakmiceId: true,
          rezultatDomacin: true,
          rezultatGost: true,
          datumUnosa: true
        }
      }
    },
    orderBy: { vrijemePocetka: 'asc' }
  });
}

async function generisiRaspored({ takmicenjeId, pocetniDatum, defaultnoVrijeme, defaultnaLokacija }, korisnik) {
  // Provjeri da li takmičenje postoji i da li je korisnik organizator ili administrator
  const takmicenje = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: Number(takmicenjeId) },
    include: { organizator: true }
  });

  if (!takmicenje) {
    const error = new Error('Takmičenje sa zadanim ID-em ne postoji');
    error.status = 404;
    error.code = 'TAKMICENJE_NIJE_PRONADJENO';
    throw error;
  }

  const jeOrganizator = takmicenje.organizatorId === korisnik.korisnikId;
  const jeAdmin = korisnik.uloga === 'ADMINISTRATOR';

  if (!jeOrganizator && !jeAdmin) {
    const error = new Error('Nemate pravo da generišete raspored za ovo takmičenje');
    error.status = 403;
    error.code = 'NEDOVOLJNA_PRAVA';
    throw error;
  }

  // Dohvati sve prijavljene timove za takmičenje
  const ucesca = await prisma.ucesceUTakmicenju.findMany({
    where: { takmicenjeId: Number(takmicenjeId) },
    include: { tim: true }
  });

  const timovi = ucesca.map(u => u.tim);

  if (timovi.length < 2) {
    const error = new Error('Potrebno je najmanje 2 prijavljena tima za generisanje rasporeda');
    error.status = 400;
    error.code = 'NEDOVOLJNO_TIMOVA';
    throw error;
  }


  await prisma.$transaction(async (tx) => {
    // 1. Dohvati ID-eve svih utakmica koje treba obrisati
    const utakmiceZaBrisanje = await tx.utakmica.findMany({
      where: { takmicenjeId: Number(takmicenjeId) },
      select: { utakmicaId: true }
    });

    if (utakmiceZaBrisanje.length === 0) return;

    const utakmicaIds = utakmiceZaBrisanje.map(u => u.utakmicaId);

    // 2. Dohvati ID-eve StatistikaTimaNaUtakmici za ove utakmice
    const statistikeTimova = await tx.statistikaTimaNaUtakmici.findMany({
      where: { utakmicaId: { in: utakmicaIds } },
      select: { statistikaTimaId: true }
    });
    const statistikaTimaIds = statistikeTimova.map(s => s.statistikaTimaId);

    // 3. Dohvati ID-eve StatistikaIgracaNaUtakmici za ove utakmice
    const statistikeIgraca = await tx.statistikaIgracaNaUtakmici.findMany({
      where: { utakmicaId: { in: utakmicaIds } },
      select: { statistikaIgracaId: true }
    });
    const statistikaIgracaIds = statistikeIgraca.map(s => s.statistikaIgracaId);

    // 4. Briši leaf tabele — moraju biti prve
    if (statistikaTimaIds.length > 0) {
      await tx.vrijednostStatistikeTima.deleteMany({
        where: { statistikaTimaId: { in: statistikaTimaIds } }
      });
    }
    if (statistikaIgracaIds.length > 0) {
      await tx.vrijednostStatistikeIgraca.deleteMany({
        where: { statistikaIgracaId: { in: statistikaIgracaIds } }
      });
    }

    // 5. Briši parent statistike
    await tx.statistikaTimaNaUtakmici.deleteMany({
      where: { utakmicaId: { in: utakmicaIds } }
    });
    await tx.statistikaIgracaNaUtakmici.deleteMany({
      where: { utakmicaId: { in: utakmicaIds } }
    });

    // 6. Briši rezultate 
    await tx.rezultatUtakmice.deleteMany({
      where: { utakmicaId: { in: utakmicaIds } }
    });
    await tx.aIPredikcija.deleteMany({
      where: { utakmicaId: { in: utakmicaIds } }
    });

    // 7. Na kraju briši same utakmice
    await tx.utakmica.deleteMany({
      where: { utakmicaId: { in: utakmicaIds } }
    });
  });

  // Lokacija: koristi uneseni tekst, ili podrazumijevanu vrijednost
  const lokacija = defaultnaLokacija?.trim() || 'Stadion Grbavica';

  // Generiši round-robin raspored
  const utakmice = generisiRoundRobinUtakmice(timovi, pocetniDatum, defaultnoVrijeme, takmicenjeId, lokacija);

  // Sačuvaj utakmice u bazi
  const kreiraneUtakmice = [];
  for (const utakmica of utakmice) {
    const novaUtakmica = await prisma.utakmica.create({
      data: utakmica,
      include: {
        domaciTim: { select: { timId: true, naziv: true } },
        gostujuciTim: { select: { timId: true, naziv: true } }
        // sportskiObjekat se ne uključuje jer objekatId nije postavljen
      }
    });
    kreiraneUtakmice.push(novaUtakmica);
  }

  return {
    brojKreiranihUtakmica: kreiraneUtakmice.length,
    utakmice: kreiraneUtakmice
  };
}

function generisiRoundRobinUtakmice(timovi, pocetniDatum, defaultnoVrijeme, takmicenjeId, lokacija) {
  const utakmice = [];
  const [sati, minuti] = defaultnoVrijeme.split(':').map(Number);
  const datumPocetka = new Date(pocetniDatum);


  let slots = [...timovi];
  const neparanBroj = slots.length % 2 !== 0;
  if (neparanBroj) {
    slots.push(null); // bye slot
  }

  const n = slots.length;         // uvijek paran
  const kola = n - 1;             // svaki tim igra n-1 kola
  const fiksni = slots[0];        // slot[0] je fiksan, rotiraju slot[1..n-1]
  let rotirajuci = slots.slice(1);

  for (let kolo = 0; kolo < kola; kolo++) {
    const trenutniSlots = [fiksni, ...rotirajuci];

    const datumKola = new Date(datumPocetka);
    datumKola.setDate(datumPocetka.getDate() + kolo * 7);

    for (let i = 0; i < n / 2; i++) {
      const domaciTim = trenutniSlots[i];
      const gostTim = trenutniSlots[n - 1 - i];

      // Preskoči utakmice gdje je jedan od timova "bye" (null)
      if (!domaciTim || !gostTim) continue;

      // Sigurnosna provjera — tim ne smije igrati protiv sebe
      if (domaciTim.timId === gostTim.timId) continue;

      const vrijemePocetka = new Date(datumKola);
      vrijemePocetka.setHours(sati, minuti, 0, 0);

      utakmice.push({
        takmicenjeId: Number(takmicenjeId),
        domaciTimId: domaciTim.timId,
        gostujuciTimId: gostTim.timId,
        vrijemePocetka,
        status: 'ZAKAZANA',
        lokacijaOpis: lokacija
      });
    }

    // Rotacija: zadnji element rotirajućeg niza ide na početak
    rotirajuci = [rotirajuci[rotirajuci.length - 1], ...rotirajuci.slice(0, rotirajuci.length - 1)];
  }

  return utakmice;
}

module.exports = {
  getPublicMatches,
  generisiRaspored
};