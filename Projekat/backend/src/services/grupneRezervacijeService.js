const prisma = require('../config/db');

function serviceError(message, status = 400, code = 'BAD_REQUEST') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

const kreirajGrupniTreningService = async (terminIdValue, trenerId, maksimalanBrojIgraca, timIdValue = null) => {
  const terminId = parseInt(terminIdValue);
  const maxIgraca = parseInt(maksimalanBrojIgraca);
  const timId = timIdValue ? parseInt(timIdValue) : null;

  if (isNaN(terminId) || terminId <= 0) {
    throw serviceError('Neispravan ID termina.', 400, 'NEVALIDAN_ID');
  }

  if (isNaN(maxIgraca) || maxIgraca < 2 || maxIgraca > 30) {
    throw serviceError('Kapacitet grupe mora biti između 2 i 30.', 400, 'NEVALIDAN_KAPACITET');
  }

  const termin = await prisma.terminObjekta.findUnique({
    where: { terminId },
    include: {
      sportskiObjekat: true,
    },
  });

  if (!termin) {
    throw serviceError('Termin nije pronađen.', 404, 'TERMIN_NIJE_PRONADJEN');
  }

  if (termin.status !== 'SLOBODAN') {
    throw serviceError('Termin je već zauzet ili blokiran.', 400, 'TERMIN_ZAUZET');
  }

  if (new Date(termin.vrijemePocetka) <= new Date()) {
    throw serviceError('Nije moguće rezervisati termin u prošlosti.', 400, 'TERMIN_PROSAO');
  }

  // Provjera da li trener već ima zahtjev za ovaj termin
  const postojeciZahtjev = await prisma.zahtjevZaRezervaciju.findFirst({
    where: {
      terminId,
      korisnikId: trenerId,
      status: { in: ['NA_CEKANJU', 'CEKANJE', 'ODOBRENO'] },
    },
  });

  if (postojeciZahtjev) {
    throw serviceError('Već imate aktivan zahtjev za ovaj termin.', 409, 'DUPLI_TERMIN');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Kreiraj zahtjev za rezervaciju
    const zahtjev = await tx.zahtjevZaRezervaciju.create({
      data: {
        terminId,
        korisnikId: trenerId,
        timId: timId,
        status: 'ODOBRENO',
        datumSlanja: new Date(),
        datumObrade: new Date(),
      },
    });

    // 2. Kreiraj rezervaciju
    await tx.rezervacija.create({
      data: {
        zahtjevId: zahtjev.zahtjevId,
        terminId,
        status: 'POTVRDJENA',
        datumPotvrde: new Date(),
      },
    });

    // 3. Ažuriraj status termina
    await tx.terminObjekta.update({
      where: { terminId },
      data: {
        status: 'ZAUZET',
        tipTermina: 'GRUPNI',
      },
    });

    // 4. Kreiraj grupni trening
    const grupniTrening = await tx.grupniTrening.create({
      data: {
        terminId,
        trenerId,
        maksimalanBrojIgraca: maxIgraca,
      },
    });

    return grupniTrening;
  });
};

const prijaviSeNaGrupniTreningService = async (idParam, korisnikId) => {
  const id = parseInt(idParam);
  if (isNaN(id) || id <= 0) {
    throw serviceError('Neispravan ID.', 400, 'NEVALIDAN_ID');
  }

  // Pronađi grupni trening po treningId ili terminId
  const grupniTrening = await prisma.grupniTrening.findFirst({
    where: {
      OR: [
        { treningId: id },
        { terminId: id },
      ],
    },
  });

  if (!grupniTrening) {
    throw serviceError('Grupni trening nije pronađen.', 404, 'TRENING_NIJE_PRONADJEN');
  }

  return prisma.$transaction(async (tx) => {
    // Dohvati najsvježije podatke o treningu unutar transakcije
    const trening = await tx.grupniTrening.findUnique({
      where: { treningId: grupniTrening.treningId },
      include: {
        terminObjekta: true,
      },
    });

    if (!trening) {
      throw serviceError('Grupni trening nije pronađen.', 404, 'TRENING_NIJE_PRONADJEN');
    }

    if (new Date(trening.terminObjekta.vrijemePocetka) <= new Date()) {
      throw serviceError('Nije moguće prijaviti se na trening koji je već počeo ili prošao.', 400, 'TRENING_PROSAO');
    }

    // Prebroji trenutni broj prijavljenih igrača
    const brojPrijava = await tx.prijavaGrupnogTreninga.count({
      where: { treningId: trening.treningId },
    });

    if (brojPrijava >= trening.maksimalanBrojIgraca) {
      throw serviceError('Nažalost, ovaj grupni trening je popunjen', 400, 'POPUNJEN_TRENING');
    }

    // Provjeri da li je igrač već prijavljen
    const vecPrijavljen = await tx.prijavaGrupnogTreninga.findUnique({
      where: {
        treningId_korisnikId: {
          treningId: trening.treningId,
          korisnikId,
        },
      },
    });

    if (vecPrijavljen) {
      throw serviceError('Već ste prijavljeni na ovaj grupni trening.', 400, 'VEC_PRIJAVLJEN');
    }

    // Kreiraj prijavu
    const prijava = await tx.prijavaGrupnogTreninga.create({
      data: {
        treningId: trening.treningId,
        korisnikId,
      },
    });

    return prijava;
  });
};

const getTrenerGrupniTreninziService = async (trenerId) => {
  return prisma.grupniTrening.findMany({
    where: {
      trenerId,
    },
    include: {
      terminObjekta: {
        include: {
          sportskiObjekat: true,
          zahtjeviZaRezervaciju: {
            where: { status: 'ODOBRENO' },
            include: {
              tim: {
                select: {
                  timId: true,
                  naziv: true,
                }
              }
            }
          }
        },
      },
      prijave: {
        include: {
          korisnik: {
            select: {
              korisnikId: true,
              punoIme: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      terminObjekta: {
        vrijemePocetka: 'asc',
      },
    },
  });
};

const getGrupniTreninziService = async (korisnikId) => {
  if (!korisnikId) {
    return [];
  }

  // 1. Get the player's teams
  const playerClanstva = await prisma.clanstvoTima.findMany({
    where: {
      korisnikId: parseInt(korisnikId, 10),
      ulogaUTimu: 'IGRAC',
      status: 'ACTIVE'
    },
    select: {
      timId: true
    }
  });

  const teamIds = playerClanstva.map(c => c.timId);

  // 2. Get the coaches of those teams
  const coachClanstva = await prisma.clanstvoTima.findMany({
    where: {
      timId: { in: teamIds },
      ulogaUTimu: 'TRENER',
      status: 'ACTIVE'
    },
    select: {
      korisnikId: true
    }
  });

  const coachIds = coachClanstva.map(c => c.korisnikId);

  // 3. Find group trainings that are:
  // - Either scheduled for one of the player's teams (zahtjevZaRezervaciju.timId is in teamIds)
  // - OR scheduled without a team (zahtjevZaRezervaciju.timId is null) but created by one of the player's team's coaches (trenerId is in coachIds)
  return prisma.grupniTrening.findMany({
    where: {
      terminObjekta: {
        vrijemePocetka: {
          gt: new Date(),
        },
      },
      OR: [
        {
          terminObjekta: {
            zahtjeviZaRezervaciju: {
              some: {
                status: 'ODOBRENO',
                timId: { in: teamIds }
              }
            }
          }
        },
        {
          terminObjekta: {
            zahtjeviZaRezervaciju: {
              some: {
                status: 'ODOBRENO',
                timId: null
              }
            }
          },
          trenerId: { in: coachIds }
        }
      ]
    },
    include: {
      terminObjekta: {
        include: {
          sportskiObjekat: true,
          zahtjeviZaRezervaciju: {
            where: { status: 'ODOBRENO' },
            include: {
              tim: {
                select: {
                  timId: true,
                  naziv: true,
                }
              }
            }
          }
        },
      },
      trener: {
        select: {
          korisnikId: true,
          punoIme: true,
          email: true,
        },
      },
      prijave: {
        select: {
          korisnikId: true,
        },
      },
    },
    orderBy: {
      terminObjekta: {
        vrijemePocetka: 'asc',
      },
    },
  });
};

const otkaziGrupniTreningService = async (treningIdValue, trenerId) => {
  const treningId = parseInt(treningIdValue);
  if (isNaN(treningId) || treningId <= 0) {
    throw serviceError('Neispravan ID treninga.', 400, 'NEVALIDAN_ID');
  }

  const training = await prisma.grupniTrening.findUnique({
    where: { treningId },
    include: {
      terminObjekta: {
        include: {
          zahtjeviZaRezervaciju: {
            where: { status: 'ODOBRENO' }
          }
        }
      }
    }
  });

  if (!training) {
    throw serviceError('Grupni trening nije pronađen.', 404, 'TRENING_NIJE_PRONADJEN');
  }

  if (training.trenerId !== trenerId) {
    throw serviceError('Nemate pravo da otkažete ovaj trening.', 403, 'NEOVLASTEN');
  }

  if (new Date(training.terminObjekta.vrijemePocetka) <= new Date()) {
    throw serviceError('Nije moguće otkazati trening koji je već počeo ili prošao.', 400, 'TRENING_PROSAO');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Obriši prijave za trening
    await tx.prijavaGrupnogTreninga.deleteMany({
      where: { treningId }
    });

    // 2. Obriši sam grupni trening
    await tx.grupniTrening.delete({
      where: { treningId }
    });

    // 3. Otkaži rezervaciju i zahtjev
    const odobreniZahtjev = training.terminObjekta.zahtjeviZaRezervaciju[0];
    if (odobreniZahtjev) {
      await tx.rezervacija.updateMany({
        where: { zahtjevId: odobreniZahtjev.zahtjevId },
        data: { status: 'OTKAZANA' }
      });

      await tx.zahtjevZaRezervaciju.update({
        where: { zahtjevId: odobreniZahtjev.zahtjevId },
        data: { status: 'OTKAZANO' }
      });
    }

    // 4. Vrati termin u status SLOBODAN i tipTermina u NULL
    await tx.terminObjekta.update({
      where: { terminId: training.terminId },
      data: {
        status: 'SLOBODAN',
        tipTermina: null
      }
    });

    return { poruka: 'Grupni trening je uspješno otkazan.' };
  });
};

const odjaviSeSaGrupnogTreningaService = async (treningIdValue, korisnikId, razlog) => {
  const treningId = parseInt(treningIdValue, 10);
  if (isNaN(treningId) || treningId <= 0) {
    throw serviceError('Neispravan ID treninga.', 400, 'NEVALIDAN_ID');
  }

  const training = await prisma.grupniTrening.findUnique({
    where: { treningId },
    include: {
      terminObjekta: {
        include: {
          sportskiObjekat: true,
        }
      }
    }
  });

  if (!training) {
    throw serviceError('Grupni trening nije pronađen.', 404, 'TRENING_NIJE_PRONADJEN');
  }

  if (new Date(training.terminObjekta.vrijemePocetka) <= new Date()) {
    throw serviceError('Nije moguće odjaviti se sa treninga koji je već počeo ili prošao.', 400, 'TERMIN_PROSAO');
  }

  const prijava = await prisma.prijavaGrupnogTreninga.findUnique({
    where: {
      treningId_korisnikId: {
        treningId,
        korisnikId: parseInt(korisnikId, 10)
      }
    }
  });

  if (!prijava) {
    throw serviceError('Niste prijavljeni na ovaj trening.', 400, 'NISTE_PRIJAVLJENI');
  }

  const player = await prisma.korisnik.findUnique({
    where: { korisnikId: parseInt(korisnikId, 10) },
    select: { punoIme: true, email: true }
  });

  const formattedDate = new Date(training.terminObjekta.vrijemePocetka).toLocaleDateString('bs-BA');
  const formattedTime = new Date(training.terminObjekta.vrijemePocetka).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' });
  const playerName = player.punoIme || player.email;
  const objekatNaziv = training.terminObjekta.sportskiObjekat?.naziv || 'Sportski objekat';
  const razlogTekst = razlog && razlog.trim() ? ` Razlog: "${razlog.trim()}"` : '';

  await prisma.$transaction([
    prisma.prijavaGrupnogTreninga.delete({
      where: {
        treningId_korisnikId: {
          treningId,
          korisnikId: parseInt(korisnikId, 10)
        }
      }
    }),
    prisma.notifikacija.create({
      data: {
        korisnikId: training.trenerId,
        tipNotifikacije: 'ODJAVA_TRENINGA',
        sadrzajPoruke: `Igrač ${playerName} se odjavio sa treninga dana ${formattedDate} u ${formattedTime} (Objekat: ${objekatNaziv}).${razlogTekst}`,
        status: 'NEPROCITANO',
      }
    })
  ]);

  return { poruka: 'Uspješno ste se odjavili sa grupnog treninga.' };
};

const getTrenerNotifikacijeService = async (trenerId) => {
  return prisma.notifikacija.findMany({
    where: {
      korisnikId: parseInt(trenerId, 10),
      tipNotifikacije: 'ODJAVA_TRENINGA'
    },
    orderBy: {
      vrijemeSlanja: 'desc'
    }
  });
};

module.exports = {
  kreirajGrupniTreningService,
  prijaviSeNaGrupniTreningService,
  getTrenerGrupniTreninziService,
  getGrupniTreninziService,
  otkaziGrupniTreningService,
  odjaviSeSaGrupnogTreningaService,
  getTrenerNotifikacijeService,
};
