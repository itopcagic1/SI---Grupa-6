const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { applyMatchResultToTabela } = require('../services/plasmanService');
const { validateStatistikaKonzistentnost } = require('../services/statistikaConsistencyService');

function rezultatJeNeispravan(rezultatDomacin, rezultatGost) {
  return (
    rezultatDomacin === undefined ||
    rezultatGost === undefined ||
    !Number.isInteger(Number(rezultatDomacin)) ||
    !Number.isInteger(Number(rezultatGost)) ||
    Number(rezultatDomacin) < 0 ||
    Number(rezultatGost) < 0
  );
}

function nemaPravoZaRezultat(utakmica, korisnikId, uloga) {
  return uloga !== 'ADMINISTRATOR' && (uloga !== 'ORGANIZATOR' || utakmica.takmicenje.organizatorId !== korisnikId);
}

exports.kreirajRezultat = async (req, res) => {
  try {
    const utakmicaId = parseInt(req.params.id);
    const { rezultatDomacin, rezultatGost } = req.body;
    const unioKorisnikId = req.user.korisnikId;
    const uloga = req.user.uloga;

    if (rezultatJeNeispravan(rezultatDomacin, rezultatGost)) {
      return res.status(400).json({ poruka: 'Rezultat ne moze biti negativan.' });
    }

    const utakmica = await prisma.utakmica.findUnique({
      where: { utakmicaId },
      include: { takmicenje: true, rezultatUtakmice: true }
    });

    if (!utakmica) {
      return res.status(404).json({ poruka: 'Utakmica nije pronadjena.' });
    }

    if (utakmica.rezultatUtakmice) {
      return res.status(400).json({ poruka: 'Rezultat za ovu utakmicu je vec unesen. Koristite opciju za korekciju.' });
    }

    if (new Date(utakmica.vrijemePocetka) > new Date()) {
      return res.status(400).json({ poruka: 'Utakmica jos nije pocela.' });
    }

    if (nemaPravoZaRezultat(utakmica, unioKorisnikId, uloga)) {
      return res.status(403).json({ poruka: 'Nemate ovlastenje za unos rezultata za ovu utakmicu.' });
    }

    const parsedDomacin = Number(rezultatDomacin);
    const parsedGost = Number(rezultatGost);

    const rezultat = await prisma.$transaction(async (tx) => {
      const noviRezultat = await tx.rezultatUtakmice.create({
        data: {
          utakmicaId,
          rezultatDomacin: parsedDomacin,
          rezultatGost: parsedGost,
          unioKorisnikId
        }
      });

      await tx.utakmica.update({
        where: { utakmicaId },
        data: { status: 'Zavrseno' }
      });

      await validateStatistikaKonzistentnost(tx, utakmicaId, {
        rezultatDomacin: parsedDomacin,
        rezultatGost: parsedGost
      });

      await applyMatchResultToTabela(tx, utakmica, parsedDomacin, parsedGost);

      return noviRezultat;
    });

    res.status(201).json({ poruka: 'Rezultat uspjesno unesen.', rezultat });
  } catch (error) {
    console.error('Greska pri unosu rezultata:', error);
    res.status(error.status || 500).json({ poruka: error.status ? error.message : 'Greska pri unosu rezultata.' });
  }
};

exports.azurirajRezultat = async (req, res) => {
  try {
    const utakmicaId = parseInt(req.params.id);
    const { rezultatDomacin, rezultatGost } = req.body;
    const unioKorisnikId = req.user.korisnikId;
    const uloga = req.user.uloga;

    if (rezultatJeNeispravan(rezultatDomacin, rezultatGost)) {
      return res.status(400).json({ poruka: 'Rezultat ne moze biti negativan.' });
    }

    const utakmica = await prisma.utakmica.findUnique({
      where: { utakmicaId },
      include: { takmicenje: true, rezultatUtakmice: true }
    });

    if (!utakmica) {
      return res.status(404).json({ poruka: 'Utakmica nije pronadjena.' });
    }

    if (!utakmica.rezultatUtakmice) {
      return res.status(404).json({ poruka: 'Rezultat za ovu utakmicu jos nije unesen.' });
    }

    if (nemaPravoZaRezultat(utakmica, unioKorisnikId, uloga)) {
      return res.status(403).json({ poruka: 'Nemate ovlastenje za korekciju rezultata za ovu utakmicu.' });
    }

    const parsedDomacin = Number(rezultatDomacin);
    const parsedGost = Number(rezultatGost);

    const rezultat = await prisma.$transaction(async (tx) => {
      await applyMatchResultToTabela(
        tx,
        utakmica,
        utakmica.rezultatUtakmice.rezultatDomacin,
        utakmica.rezultatUtakmice.rezultatGost,
        -1
      );

      const azuriraniRezultat = await tx.rezultatUtakmice.update({
        where: { utakmicaId },
        data: {
          rezultatDomacin: parsedDomacin,
          rezultatGost: parsedGost,
          unioKorisnikId,
          datumUnosa: new Date()
        }
      });

      await validateStatistikaKonzistentnost(tx, utakmicaId, {
        rezultatDomacin: parsedDomacin,
        rezultatGost: parsedGost
      });

      await applyMatchResultToTabela(tx, utakmica, parsedDomacin, parsedGost);

      return azuriraniRezultat;
    });

    res.json({ poruka: 'Rezultat uspjesno korigovan.', rezultat });
  } catch (error) {
    console.error('Greska pri korekciji rezultata:', error);
    res.status(error.status || 500).json({ poruka: error.status ? error.message : 'Greska pri korekciji rezultata.' });
  }
};

exports.dohvatiRezultat = async (req, res) => {
  try {
    const rezultat = await prisma.rezultatUtakmice.findUnique({
      where: { utakmicaId: parseInt(req.params.id) }
    });

    if (!rezultat) {
      return res.status(404).json({ poruka: 'Rezultat nije pronadjen.' });
    }

    res.json(rezultat);
  } catch (error) {
    console.error('Greska pri dohvatu rezultata:', error);
    res.status(500).json({ poruka: 'Greska pri dohvatu rezultata.' });
  }
};
