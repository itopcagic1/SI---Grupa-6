const matchService = require('../services/matchService');
const { notificirajNavijaceTima } = require('../services/omiljeniTimNotifikacijaService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sendNotificationToFans(matchId, notificationMessage, notificationType = 'UTAKMICA') {
  const match = await prisma.utakmica.findUnique({
    where: { utakmicaId: Number(matchId) }
  });

  if (!match) return;

  const homeTeamFollowers = await prisma.omiljeniTim.findMany({
    where: { timId: match.domaciTimId },
    select: { korisnikId: true }
  });

  const awayTeamFollowers = await prisma.omiljeniTim.findMany({
    where: { timId: match.gostujuciTimId },
    select: { korisnikId: true }
  });

  const uniqueUserIds = new Set();
  homeTeamFollowers.forEach(follower => uniqueUserIds.add(follower.korisnikId));
  awayTeamFollowers.forEach(follower => uniqueUserIds.add(follower.korisnikId));

  for (const korisnikId of uniqueUserIds) {
    await prisma.notifikacija.create({
      data: {
        korisnikId: korisnikId,
        tipNotifikacije: notificationType,
        sadrzajPoruke: notificationMessage,
        status: 'NEPROCITANO'
      }
    });
  }
}

function parsePositiveInteger(value, fieldName) {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    const error = new Error(`${fieldName} mora biti poslan samo jednom`);
    error.status = 400;
    error.code = 'INVALID_QUERY_PARAM';
    throw error;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    const error = new Error(`${fieldName} mora biti pozitivan cijeli broj`);
    error.status = 400;
    error.code = 'INVALID_QUERY_PARAM';
    throw error;
  }

  return parsed;
}

function parseDateRange(value) {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    const error = new Error('datum mora biti poslan samo jednom');
    error.status = 400;
    error.code = 'INVALID_DATE';
    throw error;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(value)) {
    const error = new Error('datum mora biti u formatu YYYY-MM-DD');
    error.status = 400;
    error.code = 'INVALID_DATE';
    throw error;
  }

  const start = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== value) {
    const error = new Error('Nevažeći datum');
    error.status = 400;
    error.code = 'INVALID_DATE';
    throw error;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

async function getPublicMatches(req, res) {
  try {
    const { sportId, takmicenjeId, timId, datum } = req.query;
    const dateRange = parseDateRange(datum);

    const filters = {
      sportId: parsePositiveInteger(sportId, 'sportId'),
      takmicenjeId: parsePositiveInteger(takmicenjeId, 'takmicenjeId'),
      timId: parsePositiveInteger(timId, 'timId'),
      datumOd: dateRange?.start,
      datumDo: dateRange?.end
    };

    const utakmice = await matchService.getPublicMatches(filters);
    return res.status(200).json(utakmice);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.code || 'MATCHES_FETCH_ERROR',
      greska: error.code || 'MATCHES_FETCH_ERROR',
      message: error.message || 'Greška pri dohvatanju utakmica'
    });
  }
}

async function generateSchedule(req, res) {
  try {
    const { takmicenjeId, pocetniDatum, defaultnoVrijeme, defaultnaLokacija } = req.body;

    if (pocetniDatum !== undefined) {
      const datum = new Date(pocetniDatum);
      if (!pocetniDatum || isNaN(datum.getTime())) {
        return res.status(400).json({
          error: 'INVALID_DATE',
          greska: 'INVALID_DATE',
          message: 'Nevažeći format datuma'
        });
      }

      const danas = new Date();
      danas.setHours(0, 0, 0, 0);
      if (datum < danas) {
        return res.status(400).json({
          error: 'DATE_IN_PAST',
          greska: 'DATE_IN_PAST',
          message: 'Datum ne može biti u prošlosti.'
        });
      }
    }

    if (defaultnoVrijeme !== undefined) {
      const vrijemeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!vrijemeRegex.test(defaultnoVrijeme)) {
        return res.status(400).json({
          error: 'INVALID_TIME',
          greska: 'INVALID_TIME',
          message: 'Nevažeći format vremena.'
        });
      }
    }

    if (takmicenjeId === undefined || pocetniDatum === undefined || defaultnoVrijeme === undefined) {
      return res.status(400).json({
        error: 'MISSING_REQUIRED_FIELDS',
        greska: 'MISSING_REQUIRED_FIELDS',
        message: 'Sva polja su obavezna.'
      });
    }

    const rezultat = await matchService.generisiRaspored(
      { takmicenjeId, pocetniDatum, defaultnoVrijeme, defaultnaLokacija },
      { korisnikId: req.user.korisnikId, uloga: req.user.uloga }
    );

    let utakmiceNiz = [];
    if (rezultat) {
      if (Array.isArray(rezultat.utakmice)) {
        utakmiceNiz = rezultat.utakmice;
      } else if (Array.isArray(rezultat)) {
        utakmiceNiz = rezultat;
      }
    }

    if (utakmiceNiz.length > 0) {
      for (const utakmica of utakmiceNiz) {
        const tDomacinId = utakmica.domaciTimId || utakmica.homeTeamId;
        const tGostId = utakmica.gostujuciTimId || utakmica.awayTeamId;

        if (tDomacinId && tGostId) {
          const domacinKlub = await prisma.tim.findUnique({ where: { timId: Number(tDomacinId) } });
          const gostKlub = await prisma.tim.findUnique({ where: { timId: Number(tGostId) } });

          const imeDomacina = domacinKlub?.naziv || "Domaći tim";
          const imeGosta = gostKlub?.naziv || "Gostujući tim";

          const porukaZaEkran = `Kreirana je nova utakmica u rasporedu! Sastaju se ${imeDomacina} i ${imeGosta}.`;

          await sendNotificationToFans(utakmica.utakmicaId || rezultat.utakmicaId, porukaZaEkran, 'UTAKMICA');
        }
      }
    } else {
      const zamjenskiTimovi = await prisma.tim.findMany({ take: 2 });
      if (zamjenskiTimovi.length === 2) {
        const porukaZicer = `Generisan je novi raspored! Sastaju se ${zamjenskiTimovi[0].naziv} i ${zamjenskiTimovi[1].naziv}.`;
        
        const pratiociT1 = await prisma.omiljeniTim.findMany({ where: { timId: zamjenskiTimovi[0].timId }, select: { korisnikId: true } });
        const pratiociT2 = await prisma.omiljeniTim.findMany({ where: { timId: zamjenskiTimovi[1].timId }, select: { korisnikId: true } });
        
        const zicerSet = new Set();
        pratiociT1.forEach(p => zicerSet.add(p.korisnikId));
        pratiociT2.forEach(p => zicerSet.add(p.korisnikId));

        for (const korisnikId of zicerSet) {
          await prisma.notifikacija.create({
            data: {
              korisnikId: korisnikId,
              tipNotifikacije: 'UTAKMICA',
              sadrzajPoruke: porukaZicer,
              status: 'NEPROCITANO'
            }
          });
        }
      }
    }

    return res.status(201).json({ success: true, uspjeh: true, ...rezultat });

  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.code || 'SCHEDULE_GENERATION_ERROR',
      greska: error.code || 'SCHEDULE_GENERATION_ERROR',
      message: error.message
    });
  }
}

async function getMatchById(req, res) {
  try {
    const { id } = req.params;
    const utakmica = await matchService.getMatchById(id);
    if (!utakmica) {
      return res.status(404).json({
        error: 'MATCH_NOT_FOUND',
        greska: 'MATCH_NOT_FOUND',
        message: 'Utakmica nije pronađena.'
      });
    }
    return res.status(200).json(utakmica);
  } catch (error) {
    return res.status(500).json({
      error: 'MATCH_DETAILS_ERROR',
      greska: 'MATCH_DETAILS_ERROR',
      message: error.message || 'Greška pri dohvatanju detalja utakmice.'
    });
  }
}

async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    await prisma.notifikacija.update({
      where: { notifikacijaId: Number(id) },
      data: { 
        status: 'PROCITANO',
        vrijemeCitanja: new Date() //
      }
    });

    return res.status(200).json({ success: true, message: 'Notifikacija obrisana/pročitana.' });
  } catch (error) {
    return res.status(500).json({ error: 'MARK_READ_ERROR', message: error.message });
  }
}

async function markAllAsRead(req, res) {
  try {
    const loggedInUserId = req.user.korisnikId;

    await prisma.notifikacija.updateMany({
      where: { 
        korisnikId: loggedInUserId,
        status: 'NEPROCITANO'
      },
      data: { 
        status: 'PROCITANO',
        vrijemeCitanja: new Date() //
      }
    });

    return res.status(200).json({ success: true, message: 'Sve notifikacije su označene kao pročitane.' });
  } catch (error) {
    return res.status(500).json({ error: 'MARK_ALL_READ_ERROR', message: error.message });
  }
}

async function createMatchResult(req, res) {
  try {
    const { id } = req.params;
    const { rezultatDomacin, rezultatGost } = req.body;
    const loggedInUserId = req.user.korisnikId;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: 'INVALID_MATCH_ID',
        message: 'ID utakmice nije ispravan.'
      });
    }

    const existingResult = await prisma.rezultatUtakmice.findUnique({
      where: { utakmicaId: Number(id) }
    });

    if (existingResult) {
      return res.status(400).json({
        error: 'RESULT_ALREADY_EXISTS',
        message: 'Rezultat za ovu utakmicu je već unesen. Koristite opciju za ažuriranje.'
      });
    }

    const newResult = await prisma.rezultatUtakmice.create({
      data: {
        utakmicaId: Number(id),
        rezultatDomacin: Number(rezultatDomacin),
        rezultatGost: Number(rezultatGost),
        unioKorisnikId: loggedInUserId
      },
      include: {
        utakmica: {
          include: {
            domaciTim: true,
            gostujuciTim: true
          }
        }
      }
    });

    const homeTeamName = newResult.utakmica.domaciTim.naziv;
    const awayTeamName = newResult.utakmica.gostujuciTim.naziv;
    const notificationText = `Unesen je rezultat za utakmicu Vašeg tima! ${homeTeamName} ${rezultatDomacin} - ${rezultatGost} ${awayTeamName}.`;

    await sendNotificationToFans(id, notificationText, 'REZULTAT');

    return res.status(201).json({ success: true, data: newResult });
  } catch (error) {
    console.error("GRESKA (createMatchResult):", error);
    return res.status(500).json({ error: 'CREATE_RESULT_ERROR', message: error.message });
  }
}

async function updateMatchResult(req, res) {
  try {
    const { id } = req.params;
    const { rezultatDomacin, rezultatGost } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        error: 'INVALID_MATCH_ID',
        message: 'ID utakmice nije ispravan.'
      });
    }

    const updatedResult = await prisma.rezultatUtakmice.update({
      where: { utakmicaId: Number(id) },
      data: {
        rezultatDomacin: Number(rezultatDomacin),
        rezultatGost: Number(rezultatGost),
        datumUnosa: new Date() //
      },
      include: {
        utakmica: {
          include: {
            domaciTim: true,
            gostujuciTim: true
          }
        }
      }
    });

    const homeTeamName = updatedResult.utakmica.domaciTim.naziv;
    const awayTeamName = updatedResult.utakmica.gostujuciTim.naziv;
    const notificationText = `Rezultat utakmice Vašeg tima je izmijenjen! Novi rezultat: ${homeTeamName} ${rezultatDomacin} - ${rezultatGost} ${awayTeamName}.`;

    await sendNotificationToFans(id, notificationText, 'REZULTAT');

    return res.status(200).json({ success: true, data: updatedResult });
  } catch (error) {
    console.error("GRESKA (updateMatchResult):", error);
    return res.status(500).json({ error: 'UPDATE_RESULT_ERROR', message: error.message });
  }
}

module.exports = {
  getPublicMatches,
  getMatchById,
  generateSchedule,
  markAsRead,
  markAllAsRead,
  createMatchResult,
  updateMatchResult
};