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

  // 1. Dohvat termina i trenera odjednom paralelno radi brzine
  const [termin, trener] = await Promise.all([
    prisma.terminObjekta.findUnique({ where: { terminId } }),
    prisma.korisnik.findUnique({ where: { korisnikId: trenerId } })
  ]);

  if (!termin) {
    throw serviceError('Termin nije pronađen.', 404, 'TERMIN_NIJE_PRONADJEN');
  }

  if (termin.status !== 'SLOBODAN') {
    throw serviceError('Termin je već zauzet ili blokiran.', 400, 'TERMIN_ZAUZET');
  }

  if (new Date(termin.vrijemePocetka) <= new Date()) {
    throw serviceError('Nije moguće rezervisati termin u prošlosti.', 400, 'TERMIN_PROSAO');
  }

  // --- ISTA LOGIKA KAO ZA INDIVIDUALNE REZERVACIJE ---
  const brojPrekrsaja = trener ? trener.brojPreksrenihRezervacija : 0;
  
  // Ako trener ima 3 ili više prekršaja, status je 'CEKANJE', inače je odmah 'ODOBRENO'
  const inicijalniStatus = brojPrekrsaja >= 3 ? 'CEKANJE' : 'ODOBRENO';

  return prisma.$transaction(async (tx) => {
    
    // Provjera duplog zahtjeva za ovaj termin
    const postojeciZahtjev = await tx.zahtjevZaRezervaciju.findFirst({
      where: {
        terminId,
        korisnikId: trenerId,
        status: { in: ['NA_CEKANJU', 'CEKANJE', 'ODOBRENO'] },
      },
    });

    if (postojeciZahtjev) {
      throw serviceError('Već imate aktivan zahtjev za ovaj termin.', 409, 'DUPLI_TERMIN');
    }

    // Kreiramo ZAHTJEV sa odgovarajućim statusom
    const zahtjev = await tx.zahtjevZaRezervaciju.create({
      data: {
        terminId,
        korisnikId: trenerId,
        timId: timId,
        status: inicijalniStatus,
        datumSlanja: new Date(),
        datumObrade: inicijalniStatus === 'ODOBRENO' ? new Date() : null,
      },
    });

    // Ako je trener POUZDAN (nema prekršaja), odmah u pozadini završavamo cijeli proces
    if (inicijalniStatus === 'ODOBRENO') {
      (async () => {
        try {
          await prisma.$transaction(async (bgTx) => {
            // 1. Kreiraj potvrđenu rezervaciju
            await bgTx.rezervacija.create({
              data: {
                zahtjevId: zahtjev.zahtjevId,
                terminId,
                status: 'POTVRDJENA',
                datumPotvrde: new Date(),
              },
            });

            // 2. Postavi termin kao zauzet za grupni trening
            await bgTx.terminObjekta.update({
              where: { terminId },
              data: {
                status: 'ZAUZET',
                tipTermina: 'GRUPNI',
              },
            });

            // 3. Generiši sam grupni trening u bazi
            await bgTx.grupniTrening.create({
              data: {
                terminId,
                trenerId,
                maksimalanBrojIgraca: maxIgraca,
              },
            });
          });
        } catch (bgError) {
          console.error("Pozadinska greška pri automatskom kreiranju grupnog treninga:", bgError);
        }
      })();
    } else {
      // Ako je trener NEPOUZDAN (inicijalniStatus === 'CEKANJE'):
      // NE kreiramo rezervaciju, NE mijenjamo termin u ZAUZET, NE kreiramo grupni trening.
      // Sve ovo će se odraditi tek kada Vlasnik objekta odobri zahtjev kroz Vaš postojeći kontroler/odobrenje.
    }

    // Vraćamo trenutni brzi odgovor (Trener ne čeka ni sekunde)
    return {
      status: inicijalniStatus,
      poruka: inicijalniStatus === 'CEKANJE' 
        ? 'Zahtjev je poslan na čekanje jer imate 3 ili više prekršaja. Čeka se odobrenje vlasnika objekta.' 
        : 'Grupni trening je uspješno kreiran.',
      zahtjevId: zahtjev.zahtjevId
    };

  }, {
    maxWait: 3000,
    timeout: 7000
  });
};

const prijaviSeNaGrupniTreningService = async (idParam, korisnikId) => {
  const id = parseInt(idParam);
  if (isNaN(id) || id <= 0) {
    throw serviceError('Neispravan ID.', 400, 'NEVALIDAN_ID');
  }

  // Paralelno dohvatamo trening i provjeravamo status korisnika (igrača)
  const [grupniTrening, igrac] = await Promise.all([
    prisma.grupniTrening.findFirst({
      where: {
        OR: [
          { treningId: id },
          { terminId: id },
        ],
      },
    }),
    prisma.korisnik.findUnique({
      where: { korisnikId }
    })
  ]);

  if (!grupniTrening) {
    throw serviceError('Grupni trening nije pronađen.', 404, 'TRENING_NIJE_PRONADJEN');
  }

  // --- ISTA LOGIKA KAO ZA INDIVIDUALNE (BLOKADA ZA NEPOUZDANE IGRAČE) ---
  if (igrac && igrac.brojPreksrenihRezervacija >= 3) {
    throw serviceError('Nemate pravo prijave na grupni trening jer imate 3 ili više prekršaja.', 403, 'NEPOUZDAN_KORISNIK');
  }

  return prisma.$transaction(async (tx) => {
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

    const brojPrijava = await tx.prijavaGrupnogTreninga.count({
      where: { treningId: trening.treningId },
    });

    if (brojPrijava >= trening.maksimalanBrojIgraca) {
      throw serviceError('Nažalost, ovaj grupni trening je popunjen.', 400, 'POPUNJEN_TRENING');
    }

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

    const prijava = await tx.prijavaGrupnogTreninga.create({
      data: {
        treningId: trening.treningId,
        korisnikId,
      },
    });

    return prijava;
  }, {
    maxWait: 3000,
    timeout: 7000
  });
};

const getTrenerGrupniTreninziService = async (trenerId) => {
  // 1. Dohvatamo zahtjeve trenera sa tačnim statusima iz Vaše baze podataka
  const zahtjevi = await prisma.zahtjevZaRezervaciju.findMany({
    where: {
      korisnikId: trenerId,
      // Tačni statusi iz Vaše baze (slika): POTVRDJENO, CEKANJE, OTKAZANO
      status: { in: ['CEKANJE', 'NA_CEKANJU', 'POTVRDJENO', 'OTKAZANO'] },
      terminObjekta: {
        vrijemePocetka: {
          gt: new Date(), // Samo budući termini
        },
      },
    },
    include: {
      terminObjekta: {
        include: {
          sportskiObjekat: true,
          grupniTrening: {
            include: {
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
          },
        },
      },
      tim: {
        select: {
          timId: true,
          naziv: true,
        },
      },
    },
    orderBy: {
      terminObjekta: {
        vrijemePocetka: 'asc',
      },
    },
  });

  // 2. Mapiramo podatke i precizno prepisujemo statuse za frontend (CoachDashboard)
  return zahtjevi.map((z) => {
    const stvarniTrening = z.terminObjekta.grupniTrening && z.terminObjekta.grupniTrening.length > 0
      ? z.terminObjekta.grupniTrening[0]
      : null;

    // Određivanje statusa treninga na osnovu tačne vrijednosti iz baze (kolona z.status sa slike)
    let statusZaFrontend = 'NA_CEKANJU';
    
    if (z.status === 'POTVRDJENO') {
      statusZaFrontend = 'POTVRDJEN';
    } else if (z.status === 'OTKAZANO') {
      statusZaFrontend = 'OTKAZAN'; // Ili 'OTKAZANO', zavisno šta CoachDashboard.jsx prepoznaje za crveni bedž
    }

    if (statusZaFrontend === 'POTVRDJEN' && stvarniTrening) {
      return {
        treningId: stvarniTrening.treningId,
        terminId: stvarniTrening.terminId,
        trenerId: stvarniTrening.trenerId,
        maksimalanBrojIgraca: stvarniTrening.maksimalanBrojIgraca,
        statusTreninga: 'POTVRDJEN', 
        terminObjekta: {
          ...z.terminObjekta,
          zahtjeviZaRezervaciju: [z]
        },
        prijave: stvarniTrening.prijave || [],
        tim: z.tim
      };
    }

    // Za zahtjeve koji su na 'CEKANJE' ili 'OTKAZANO' (gdje nema stvarnog treninga u tabeli grupniTrening)
    return {
      treningId: `zahtjev-${z.zahtjevId}`, 
      terminId: z.terminId,
      trenerId: z.korisnikId,
      maksimalanBrojIgraca: 10, 
      statusTreninga: statusZaFrontend, // Prosljeđuje 'NA_CEKANJU' ili 'OTKAZAN'
      terminObjekta: {
        ...z.terminObjekta,
        zahtjeviZaRezervaciju: [z]
      },
      prijave: [], 
      tim: z.tim
    };
  });
};

const getGrupniTreninziService = async (korisnikId) => {
  if (!korisnikId) {
    return [];
  }

  if (!prisma.grupniTrening?.findMany || !prisma.clanstvoTima?.findMany) {
    return [];
  }

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

  return prisma.$transaction(async (tx) => {
    const training = await tx.grupniTrening.findUnique({
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

    const operacije = [];

    await tx.prijavaGrupnogTreninga.deleteMany({
      where: { treningId }
    });

    operacije.push(
      tx.grupniTrening.delete({ where: { treningId } })
    );

    const odobreniZahtjev = training.terminObjekta.zahtjeviZaRezervaciju[0];
    if (odobreniZahtjev) {
      operacije.push(
        tx.rezervacija.updateMany({
          where: { zahtjevId: odobreniZahtjev.zahtjevId },
          data: { status: 'OTKAZANA' }
        })
      );

      operacije.push(
        tx.zahtjevZaRezervaciju.update({
          where: { zahtjevId: odobreniZahtjev.zahtjevId },
          data: { status: 'OTKAZANO' }
        })
      );
    }

    operacije.push(
      tx.terminObjekta.update({
        where: { terminId: training.terminId },
        data: {
          status: 'SLOBODAN',
          tipTermina: null
        }
      })
    );

    await Promise.all(operacije);

    return { poruka: 'Grupni trening je uspješno otkazan.' };
    
  }, {
    maxWait: 5000,
    timeout: 15000
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
