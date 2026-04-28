const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      korisnikId: user.korisnikId,
      email: user.email,
      uloga: user.uloga,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

async function registerUser({ punoIme, ime, email, lozinka, trazenaUloga, documents }) {
  const dozvoljeneUloge = ['NAVIJAC', 'IGRAC', 'TRENER', 'VLASNIK'];
  const trazenaUlogaUpper = trazenaUloga ? trazenaUloga.toUpperCase() : 'NAVIJAC';

  if (!dozvoljeneUloge.includes(trazenaUlogaUpper)) {
    const error = new Error('Uloga mora biti: NAVIJAC, IGRAC, TRENER ili VLASNIK');
    error.status = 400;
    error.code = 'NEDOZVOLJENA_ULOGA';
    error.dozvoljene = dozvoljeneUloge;
    throw error;
  }

  const existingUser = await prisma.korisnik.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Korisnik sa ovim email-om je vec registriran');
    error.status = 409;
    error.code = 'EMAIL_VEC_POSTOJI';
    throw error;
  }

  const lozinkaHash = await bcrypt.hash(lozinka, SALT_ROUNDS);

  const zahtijevaOdobrenje = trazenaUlogaUpper !== 'NAVIJAC';
  const statusUloge = zahtijevaOdobrenje ? 'PENDING' : 'ODOBREN';

  const createdUser = await prisma.korisnik.create({
    data: {
      punoIme: punoIme || ime,
      email,
      lozinkaHash,
      uloga: 'NAVIJAC',
      trazenaUloga: trazenaUlogaUpper,
      statusUloge,
      documents: documents || [],
      datumZahtjeva: zahtijevaOdobrenje ? new Date() : null,
    },
  });

  const { lozinkaHash: _, refreshToken: __, ...userWithoutSensitiveData } = createdUser;
  return userWithoutSensitiveData;
}

async function loginUser({ email, lozinka }) {
  const user = await prisma.korisnik.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Email ili lozinka nisu ispravni');
    error.status = 401;
    error.code = 'NEISPRAVNE_AKREDITIVE';
    throw error;
  }

  const passwordMatches = await bcrypt.compare(lozinka, user.lozinkaHash);

  if (!passwordMatches) {
    const error = new Error('Email ili lozinka nisu ispravni');
    error.status = 401;
    error.code = 'NEISPRAVNE_AKREDITIVE';
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  await prisma.korisnik.update({
    where: { korisnikId: user.korisnikId },
    data: { refreshToken },
  });

  const { lozinkaHash: _, refreshToken: __, ...userWithoutSensitiveData } = user;

  return {
    korisnik: userWithoutSensitiveData,
    accessToken,
    refreshToken,
  };
}

async function logoutUser(korisnikId) {
  await prisma.korisnik.update({
    where: { korisnikId },
    data: { refreshToken: null },
  });

  return {
    korisnikId,
  };
}

async function getUserProfile(korisnikId) {
  const user = await prisma.korisnik.findUnique({
    where: { korisnikId },
  });

  if (!user) {
    const error = new Error('Korisnik nije pronadjen');
    error.status = 404;
    error.code = 'KORISNIK_NIJE_PRONADJEN';
    throw error;
  }

  const { lozinkaHash: _, refreshToken: __, ...userWithoutSensitiveData } = user;
  return userWithoutSensitiveData;
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
};