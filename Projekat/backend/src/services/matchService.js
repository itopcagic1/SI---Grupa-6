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

  // Provjeri da li već postoje utakmice za ovo takmičenje
  const postojeceUtakmice = await prisma.utakmica.findMany({
    where: { takmicenjeId: Number(takmicenjeId) }
  });

  if (postojeceUtakmice.length > 0) {
    const error = new Error('Raspored je već generisan za ovo takmičenje');
    error.status = 409;
    error.code = 'RASPORED_VEC_POSTOJI';
    throw error;
  }

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
  const n = timovi.length;
  const kola = n - 1; // Broj kola

  const datumPocetka = new Date(pocetniDatum);
  const [sati, minuti] = defaultnoVrijeme.split(':').map(Number);

  let timoviKopija = [...timovi];

  for (let kolo = 0; kolo < kola; kolo++) {
    const datumKola = new Date(datumPocetka);
    datumKola.setDate(datumPocetka.getDate() + kolo * 7); // Svako kolo nedjeljno

    // Parovi: tim[0] vs tim[n-1], tim[1] vs tim[n-2], itd.
    for (let i = 0; i < Math.floor(n / 2); i++) {
      const domaciTim = timoviKopija[i];
      const gostTim = timoviKopija[n - 1 - i];

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

    // Rotacija: pomjeri poslednji tim na poziciju 1
    const poslednji = timoviKopija.pop();
    timoviKopija.splice(1, 0, poslednji);
  }

  return utakmice;
}

module.exports = {
  getPublicMatches,
  generisiRaspored
};
