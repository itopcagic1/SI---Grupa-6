const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null
});

const reservationQueue = new Queue('reservationTimeout', {
  connection: redisConnection
});

module.exports = {
  reservationQueue
};