const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/admin/korisnici
// Vraca sve korisnike sa njihovim statusima uloga
const getKorisnici = async (req, res) => {
  try {
    const { status } = req.query; // opcioni filter: PENDING, ODOBREN, ODBIJEN

    const where = status ? { statusUloge: status } : {};

    const korisnici = await prisma.korisnik.findMany({
      where,
      select: {
        korisnikId: true,
        punoIme: true,
        email: true,
        uloga: true,
        trazenaUloga: true,
        statusUloge: true,
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
// Admin odobrava ili odbija zahtjev za ulogu
const obradiZahtjevUloge = async (req, res) => {
  try {
    const korisnikId = parseInt(req.params.id);
    const { akcija, razlog } = req.body; // akcija: "ODOBRI" | "ODBIJ"

    if (!['ODOBRI', 'ODBIJ'].includes(akcija)) {
      return res.status(400).json({
        greska: 'NEISPRAVNA_AKCIJA',
        poruka: 'Akcija mora biti ODOBRI ili ODBIJ.',
      });
    }

    const korisnik = await prisma.korisnik.findUnique({
      where: { korisnikId },
    });

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

    let updateData = {
      datumObrade: new Date(),
    };

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

module.exports = { getKorisnici, obradiZahtjevUloge };