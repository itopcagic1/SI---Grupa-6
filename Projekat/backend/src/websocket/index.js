const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let ioInstance = null;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://sportmanager-frontend.onrender.com',
];

function extractToken(socket) {
  const authToken = socket.handshake.auth?.token;
  const header = socket.handshake.headers?.authorization;

  if (authToken) return authToken;
  if (header?.startsWith('Bearer ')) return header.split(' ')[1];

  return null;
}

function initializeSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    const token = extractToken(socket);

    if (!token) return next();

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      socket.user = null;
    }

    return next();
  });

  ioInstance.on('connection', (socket) => {
    const korisnikId = socket.user?.korisnikId;

    if (korisnikId) {
      socket.join(`user:${korisnikId}`);
    }

    socket.on('disconnect', () => {});
  });

  return ioInstance;
}

function getIo() {
  return ioInstance;
}

function emitToUser(korisnikId, eventName, payload) {
  if (!ioInstance || !korisnikId) return false;
  ioInstance.to(`user:${korisnikId}`).emit(eventName, payload);
  return true;
}

function emitToUsers(korisnikIds, eventName, payload) {
  if (!ioInstance || !Array.isArray(korisnikIds)) return 0;

  const uniqueIds = [...new Set(korisnikIds.filter(Boolean))];
  uniqueIds.forEach((korisnikId) => {
    ioInstance.to(`user:${korisnikId}`).emit(eventName, payload);
  });

  return uniqueIds.length;
}

module.exports = {
  initializeSocket,
  getIo,
  emitToUser,
  emitToUsers,
};
