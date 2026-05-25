require('tslib');
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const db = require('../config/db');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redisConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

const reservationWorker = new Worker('reservationTimeout', async (job) => {
  const { reservationId, termId } = job.data;

  console.log(`[WORKER] Timer expired. Checking reservation ID: ${reservationId}`);

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId }
  });

  if (reservation && (reservation.status === 'NA_CEKANJU' || reservation.status === 'PENDING')) {
    
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'REJECTED',
        reason: 'Sistemski timeout - vlasnik nije reagovao u definisanom roku.'
      }
    });

    await prisma.term.update({
      where: { id: termId },
      data: { isBooked: false } 
    });

    console.log(`[WORKER SUCCESS] Reservation ${reservationId} has been automatically REJECTED due to timeout.`);
  } else {
    console.log(`[WORKER INFO] Reservation ${reservationId} is no longer pending. No action needed.`);
  }
}, { connection: redisConnection });

module.exports = reservationWorker;