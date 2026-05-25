const {
  getAllTermsService,
  createIndividualReservationService,
  cancelIndividualReservationService,
} = require('../services/rezervacijaService');

const {
  kreirajGrupniTreningService,
  prijaviSeNaGrupniTreningService,
  getTrenerGrupniTreninziService,
  getGrupniTreninziService,
  otkaziGrupniTreningService,
  odjaviSeSaGrupnogTreningaService,
  getTrenerNotifikacijeService,
} = require('../services/grupneRezervacijeService');

const { reservationQueue } = require('../queues/reservationQueue');
const { calculateTimeoutMilliseconds } = require('../utils/timeoutCalculator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { differenceInHours } = require('date-fns');

const getFreeIndividualTerms = async (req, res) => {
  try {
    const termini = await getAllTermsService(req.user.korisnikId);
    res.json({ termini });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju termina.',
    });
  }
};

const kreirajIndividualnuRezervaciju = async (req, res) => {
  try {
    const termId = req.params.id;
    const isTrusted = req.user?.statusPouzdanosti !== 'NEPOUZDAN';

    const result = await createIndividualReservationService(
      termId,
      req.user,
      isTrusted
    );

    // CASE A: User is trusted, term is immediately reserved
    if (result.tip === 'REZERVISANO') {
      return res.json({
        poruka: 'Termin je uspješno rezervisan.',
        status: 'POTVRDJENA',
      });
    }

    // CASE B: User is untrusted, request goes to PENDING status
    const reservationId = result.reservationId; 
    const termStartTime = result.termStartTime; 

    // Calculate delay dynamically (24h or 2h before the term starts)
    const delayMilliseconds = calculateTimeoutMilliseconds(termStartTime);

    // Add delayed background job to BullMQ
    await reservationQueue.add(
      'check-reservation-timeout',
      { 
        reservationId: reservationId, 
        termId: termId 
      },
      { delay: delayMilliseconds }
    );

    console.log(`[BULLMQ] Timer registered for reservation ${reservationId}. Waiting for: ${delayMilliseconds / 1000 / 60} minutes.`);

    return res.json({
      poruka: 'Vaš zahtjev je poslan na čekanje i biće obrađen od strane administratora.',
      status: 'NA_CEKANJU',
    });

  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom rezervacije termina.',
    });
  }
};

const otkaziIndividualnuRezervaciju = async (req, res) => {
  try {
    const terminId = req.params.id;
    const rezultat = await cancelIndividualReservationService(terminId, req.user.korisnikId);
    return res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom otkazivanja rezervacije.',
    });
  }
};

// --- TASK-3.3: NEW OWNER CANCELLATION ROUTE CONTROLLER ---
const ownerCancelReservation = async (req, res) => {
  try {
    const reservationId = parseInt(req.params.id);
    const { reason } = req.body;

    // 1. Validation check for reason
    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Cancellation reason is required.',
      });
    }

    // 2. Find reservation with prisma and include term info
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { term: true } 
    });

    if (!reservation) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Reservation not found.',
      });
    }

    // Vlasnik can only cancel automatically confirmed (active) reservations
    if (reservation.status !== 'CONFIRMED' && reservation.status !== 'POTVRDJENA') {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Only confirmed and active reservations can be cancelled.',
      });
    }

    // 3. Protection Logic: Calculate time left before the term starts
    const now = new Date();
    const termStart = new Date(reservation.term.start);
    const hoursLeft = differenceInHours(termStart, now);

    // US-15.2: If less than 24 hours left, block action immediately
    if (hoursLeft < 24) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Forbidden. You can only cancel reservations at least 24 hours before the term starts.',
      });
    }

    // 4. Update status to CANCELLED and free up the term
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'CANCELLED',
        reason: reason,
      },
    });

    await prisma.term.update({
      where: { id: reservation.termId },
      data: { isBooked: false }, 
    });

   
    return res.json({
      message: 'Reservation successfully cancelled by the owner.',
    });

  } catch (error) {
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: error.message || 'An error occurred during owner cancellation.',
    });
  }
};

const kreirajGrupniTrening = async (req, res) => {
  try {
    const terminId = req.params.id;
    const { maksimalanBrojIgraca, timId } = req.body;

    const rezultat = await kreirajGrupniTreningService(
      terminId,
      req.user.korisnikId,
      maksimalanBrojIgraca,
      timId
    );

    res.status(201).json({
      poruka: 'Grupni trening je uspješno kreiran.',
      trening: rezultat,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom kreiranja grupnog treninga.',
    });
  }
};

const prijaviSeNaGrupniTrening = async (req, res) => {
  try {
    const id = req.params.id;
    const rezultat = await prijaviSeNaGrupniTreningService(id, req.user.korisnikId);

    res.status(200).json({
      poruka: 'Uspješno ste se prijavili na grupni trening.',
      prijava: rezultat,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom prijave na grupni trening.',
    });
  }
};

const getTrenerGrupniTreninzi = async (req, res) => {
  try {
    const treninzi = await getTrenerGrupniTreninziService(req.user.korisnikId);
    res.json({ treninzi });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju grupnih treninga.',
    });
  }
};

const getGrupniTreninzi = async (req, res) => {
  try {
    const treninzi = await getGrupniTreninziService(req.user.korisnikId);
    res.json({ treninzi });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju grupnih treninga.',
    });
  }
};

const otkaziGrupniTrening = async (req, res) => {
  try {
    const treningId = req.params.id;
    const rezultat = await otkaziGrupniTreningService(treningId, req.user.korisnikId);
    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom otkazivanja grupnog treninga.',
    });
  }
};

const odjaviSeSaGrupnogTreninga = async (req, res) => {
  try {
    const treningId = req.params.id;
    const { razlog } = req.body || {};
    const rezultat = await odjaviSeSaGrupnogTreningaService(treningId, req.user.korisnikId, razlog);
    res.json(rezultat);
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške prilikom odjavljivanja sa grupnog treninga.',
    });
  }
};

const getTrenerNotifikacije = async (req, res) => {
  try {
    const notifikacije = await getTrenerNotifikacijeService(req.user.korisnikId);
    res.json({ notifikacije });
  } catch (error) {
    res.status(error.status || 500).json({
      greska: error.code || 'SERVER_ERROR',
      poruka: error.message || 'Došlo je do greške pri dohvaćanju obavijesti.',
    });
  }
};

module.exports = {
  getFreeIndividualTerms,
  kreirajIndividualnuRezervaciju,
  otkaziIndividualnuRezervaciju,
  kreirajGrupniTrening,
  prijaviSeNaGrupniTrening,
  getTrenerGrupniTreninzi,
  getGrupniTreninzi,
  otkaziGrupniTrening,
  odjaviSeSaGrupnogTreninga,
  getTrenerNotifikacije,
  ownerCancelReservation, 
};