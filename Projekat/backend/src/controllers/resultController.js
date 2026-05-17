const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const calculatePoints = (goalsFor, goalsAgainst) => {
  if (goalsFor > goalsAgainst) return { points: 3, win: 1, draw: 0, loss: 0 };
  if (goalsFor === goalsAgainst) return { points: 1, win: 0, draw: 1, loss: 0 };
  return { points: 0, win: 0, draw: 0, loss: 1 };
};

const updatePlasman = async (takmicenjeId, timId, points, win, draw, loss) => {
  const plasman = await prisma.plasmanNaTabeli.findUnique({
    where: {
      timId_takmicenjeId: {
        timId: timId,
        takmicenjeId: takmicenjeId
      }
    }
  });

  if (plasman) {
    await prisma.plasmanNaTabeli.update({
      where: { plasmanNaTabeliId: plasman.plasmanNaTabeliId },
      data: {
        brojPobjeda: plasman.brojPobjeda + win,
        brojNerijesenih: plasman.brojNerijesenih + draw,
        brojPoraza: plasman.brojPoraza + loss,
        ukupniBodovi: plasman.ukupniBodovi + points
      }
    });
  } else {
    await prisma.plasmanNaTabeli.create({
      data: {
        timId: timId,
        takmicenjeId: takmicenjeId,
        brojPobjeda: win,
        brojNerijesenih: draw,
        brojPoraza: loss,
        ukupniBodovi: points
      }
    });
  }
};

exports.kreirajRezultat = async (req, res) => {
  try {
    const { id } = req.params;
    const utakmicaId = parseInt(id);
    const { rezultatDomacin, rezultatGost } = req.body;
    const unioKorisnikId = req.user.korisnikId;
    const uloga = req.user.uloga;

    if (rezultatDomacin < 0 || rezultatGost < 0) {
      return res.status(400).json({ poruka: 'Rezultat ne može biti negativan.' });
    }

    const utakmica = await prisma.utakmica.findUnique({
      where: { utakmicaId },
      include: { takmicenje: true, rezultatUtakmice: true }
    });

    if (!utakmica) {
      return res.status(404).json({ poruka: 'Utakmica nije pronađena.' });
    }

    if (utakmica.rezultatUtakmice) {
      return res.status(400).json({ poruka: 'Rezultat za ovu utakmicu je već unesen. Koristite opciju za korekciju.' });
    }

    if (new Date(utakmica.vrijemePocetka) > new Date()) {
      return res.status(400).json({ poruka: 'Utakmica još nije počela.' });
    }

    if (uloga !== 'ADMINISTRATOR' && (uloga !== 'ORGANIZATOR' || utakmica.takmicenje.organizatorId !== unioKorisnikId)) {
      return res.status(403).json({ poruka: 'Nemate ovlaštenje za unos rezultata za ovu utakmicu.' });
    }

    const rezultat = await prisma.$transaction(async (tx) => {
      const noviRezultat = await tx.rezultatUtakmice.create({
        data: {
          utakmicaId,
          rezultatDomacin: parseInt(rezultatDomacin),
          rezultatGost: parseInt(rezultatGost),
          unioKorisnikId
        }
      });

      await tx.utakmica.update({
        where: { utakmicaId },
        data: { status: 'Završeno' }
      });

      return noviRezultat;
    });

    // Update plasman for both teams (outside transaction to avoid complex deadlocks, or just inside it via prisma directly)
    const domacinStats = calculatePoints(rezultatDomacin, rezultatGost);
    const gostStats = calculatePoints(rezultatGost, rezultatDomacin);

    await updatePlasman(utakmica.takmicenjeId, utakmica.domaciTimId, domacinStats.points, domacinStats.win, domacinStats.draw, domacinStats.loss);
    await updatePlasman(utakmica.takmicenjeId, utakmica.gostujuciTimId, gostStats.points, gostStats.win, gostStats.draw, gostStats.loss);

    res.status(201).json({ poruka: 'Rezultat uspješno unesen.', rezultat });
  } catch (error) {
    console.error('Greška pri unosu rezultata:', error);
    res.status(500).json({ poruka: 'Greška pri unosu rezultata.' });
  }
};

exports.azurirajRezultat = async (req, res) => {
  try {
    const { id } = req.params;
    const utakmicaId = parseInt(id);
    const { rezultatDomacin, rezultatGost } = req.body;
    const unioKorisnikId = req.user.korisnikId;
    const uloga = req.user.uloga;

    if (rezultatDomacin < 0 || rezultatGost < 0) {
      return res.status(400).json({ poruka: 'Rezultat ne može biti negativan.' });
    }

    const utakmica = await prisma.utakmica.findUnique({
      where: { utakmicaId },
      include: { takmicenje: true, rezultatUtakmice: true }
    });

    if (!utakmica) {
      return res.status(404).json({ poruka: 'Utakmica nije pronađena.' });
    }

    if (!utakmica.rezultatUtakmice) {
      return res.status(404).json({ poruka: 'Rezultat za ovu utakmicu još nije unesen.' });
    }

    if (uloga !== 'ADMINISTRATOR' && (uloga !== 'ORGANIZATOR' || utakmica.takmicenje.organizatorId !== unioKorisnikId)) {
      return res.status(403).json({ poruka: 'Nemate ovlaštenje za korekciju rezultata za ovu utakmicu.' });
    }

    const stariDomacin = utakmica.rezultatUtakmice.rezultatDomacin;
    const stariGost = utakmica.rezultatUtakmice.rezultatGost;

    const stariDomacinStats = calculatePoints(stariDomacin, stariGost);
    const stariGostStats = calculatePoints(stariGost, stariDomacin);

    // Revert old stats
    await updatePlasman(utakmica.takmicenjeId, utakmica.domaciTimId, -stariDomacinStats.points, -stariDomacinStats.win, -stariDomacinStats.draw, -stariDomacinStats.loss);
    await updatePlasman(utakmica.takmicenjeId, utakmica.gostujuciTimId, -stariGostStats.points, -stariGostStats.win, -stariGostStats.draw, -stariGostStats.loss);

    const rezultat = await prisma.rezultatUtakmice.update({
      where: { utakmicaId },
      data: {
        rezultatDomacin: parseInt(rezultatDomacin),
        rezultatGost: parseInt(rezultatGost),
        unioKorisnikId,
        datumUnosa: new Date()
      }
    });

    const noviDomacinStats = calculatePoints(rezultatDomacin, rezultatGost);
    const noviGostStats = calculatePoints(rezultatGost, rezultatDomacin);

    // Apply new stats
    await updatePlasman(utakmica.takmicenjeId, utakmica.domaciTimId, noviDomacinStats.points, noviDomacinStats.win, noviDomacinStats.draw, noviDomacinStats.loss);
    await updatePlasman(utakmica.takmicenjeId, utakmica.gostujuciTimId, noviGostStats.points, noviGostStats.win, noviGostStats.draw, noviGostStats.loss);

    res.json({ poruka: 'Rezultat uspješno korigovan.', rezultat });
  } catch (error) {
    console.error('Greška pri korekciji rezultata:', error);
    res.status(500).json({ poruka: 'Greška pri korekciji rezultata.' });
  }
};

exports.dohvatiRezultat = async (req, res) => {
  try {
    const { id } = req.params;
    const rezultat = await prisma.rezultatUtakmice.findUnique({
      where: { utakmicaId: parseInt(id) }
    });

    if (!rezultat) {
      return res.status(404).json({ poruka: 'Rezultat nije pronađen.' });
    }

    res.json(rezultat);
  } catch (error) {
    console.error('Greška pri dohvatu rezultata:', error);
    res.status(500).json({ poruka: 'Greška pri dohvatu rezultata.' });
  }
};
