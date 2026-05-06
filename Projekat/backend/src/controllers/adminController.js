const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/korisnici?status=PENDING&pretraga=ime
const getKorisnici = async (req, res) => {
  try {
    const { status, pretraga } = req.query;

    const where = {};

    if (status) {
      where.statusUloge = status;
    }

    if (pretraga) {
      where.OR = [
        { punoIme: { contains: pretraga, mode: 'insensitive' } },
        { email: { contains: pretraga, mode: 'insensitive' } },
      ];
    }

    const korisnici = await prisma.korisnik.findMany({
      where,
      select: {
        korisnikId: true,
        punoIme: true,
        email: true,
        uloga: true,
        trazenaUloga: true,
        statusUloge: true,
        statusPouzdanosti: true,
        datumZahtjeva: true,
        datumObrade: true,
        razlogOdbijanja: true,
        datumKreiranja: true,
      },
      orderBy: { datumKreiranja: 'desc' },
    });

    return res.status(200).json({ korisnici });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      greska: 'GRESKA_SERVERA',
      poruka: 'Greška pri dohvatanju korisnika.',
    });
  }
};

// PATCH /api/admin/korisnici/:id/uloga
const obradiZahtjevUloge = async (req, res) => {
  try {
    const korisnikId = parseInt(req.params.id);
    const { akcija, razlog } = req.body;

    if (!['ODOBRI', 'ODBIJ'].includes(akcija)) {
      return res.status(400).json({
        greska: 'NEISPRAVNA_AKCIJA',
        poruka: 'Akcija mora biti ODOBRI ili ODBIJ.',
      });
    }

    const korisnik = await prisma.korisnik.findUnique({ where: { korisnikId } });

    if (!korisnik) {
      return res.status(404).json({
        greska: 'KORISNIK_NIJE_PRONADJEN',
        poruka: 'Korisnik sa tim ID-em ne postoji.',
      });
    }

    if (!korisnik.trazenaUloga || korisnik.statusUloge !== 'PENDING') {
      return res.status(400).json({
        greska: 'NEMA_AKTIVNOG_ZAHTJEVA',
        poruka: 'Ovaj korisnik nema aktivan zahtjev za promjenu uloge.',
      });
    }

    let updateData = { datumObrade: new Date() };

    if (akcija === 'ODOBRI') {
      updateData.uloga = korisnik.trazenaUloga;
      updateData.statusUloge = 'ODOBREN';
      updateData.razlogOdbijanja = null;
    } else {
      updateData.statusUloge = 'ODBIJEN';
      updateData.razlogOdbijanja = razlog || 'Zahtjev odbijen od strane administratora.';
    }

    const azuriran = await prisma.korisnik.update({
      where: { korisnikId },
      data: updateData,
      select: {
        korisnikId: true,
        punoIme: true,
        email: true,
        uloga: true,
        trazenaUloga: true,
        statusUloge: true,
        razlogOdbijanja: true,
        datumObrade: true,
      },
    });

    return res.status(200).json({
      poruka: akcija === 'ODOBRI' ? 'Uloga uspješno odobrena.' : 'Zahtjev odbijen.',
      korisnik: azuriran,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      greska: 'GRESKA_SERVERA',
      poruka: 'Greška pri obradi zahtjeva.',
    });
  }
};

// DELETE /api/admin/korisnici/:id
const obrisiKorisnika = async (req, res) => {
  try {
    const korisnikId = parseInt(req.params.id);

    const korisnik = await prisma.korisnik.findUnique({ where: { korisnikId } });

    if (!korisnik) {
      return res.status(404).json({
        greska: 'KORISNIK_NIJE_PRONADJEN',
        poruka: 'Korisnik sa tim ID-em ne postoji.',
      });
    }

    if (korisnik.uloga === 'ADMINISTRATOR') {
      return res.status(400).json({
        greska: 'NIJE_DOZVOLJENO',
        poruka: 'Ne možete obrisati administratora.',
      });
    }

    await prisma.korisnik.delete({ where: { korisnikId } });

    return res.status(200).json({ poruka: 'Korisnik uspješno obrisan.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      greska: 'GRESKA_SERVERA',
      poruka: 'Greška pri brisanju korisnika.',
    });
  }
};

// PATCH /api/admin/korisnici/:id/blokiranje
const blokirajKorisnika = async (req, res) => {
  try {
    const korisnikId = parseInt(req.params.id);
    const { akcija } = req.body; // "BLOKIRAJ" | "ODBLOKIRAJ"

    if (!['BLOKIRAJ', 'ODBLOKIRAJ'].includes(akcija)) {
      return res.status(400).json({
        greska: 'NEISPRAVNA_AKCIJA',
        poruka: 'Akcija mora biti BLOKIRAJ ili ODBLOKIRAJ.',
      });
    }

    const korisnik = await prisma.korisnik.findUnique({ where: { korisnikId } });

    if (!korisnik) {
      return res.status(404).json({
        greska: 'KORISNIK_NIJE_PRONADJEN',
        poruka: 'Korisnik sa tim ID-em ne postoji.',
      });
    }

    if (korisnik.uloga === 'ADMINISTRATOR') {
      return res.status(400).json({
        greska: 'NIJE_DOZVOLJENO',
        poruka: 'Ne možete blokirati administratora.',
      });
    }

    const noviStatus = akcija === 'BLOKIRAJ' ? 'BLOKIRAN' : 'AKTIVAN';

    const azuriran = await prisma.korisnik.update({
      where: { korisnikId },
      data: { statusPouzdanosti: noviStatus },
      select: {
        korisnikId: true,
        punoIme: true,
        email: true,
        uloga: true,
        statusPouzdanosti: true,
      },
    });

    return res.status(200).json({
      poruka: akcija === 'BLOKIRAJ' ? 'Korisnik blokiran.' : 'Korisnik odblokiran.',
      korisnik: azuriran,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      greska: 'GRESKA_SERVERA',
      poruka: 'Greška pri blokiranju korisnika.',
    });
  }
};

module.exports = { getKorisnici, obradiZahtjevUloge, obrisiKorisnika, blokirajKorisnika };