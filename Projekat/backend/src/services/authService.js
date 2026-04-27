const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function registerUser({ ime, email, password }) {
  const existingUser = await prisma.korisnik.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Korisnik s tim emailom već postoji');
    error.status = 409;
    throw error;
  }

  const lozinkaHash = await bcrypt.hash(password, SALT_ROUNDS);

  const createdUser = await prisma.korisnik.create({
    data: {
      punoIme: ime,
      email,
      lozinkaHash,
      uloga: 'NAVIJAC',
    },
  });

  const { lozinkaHash: _, ...userWithoutPassword } = createdUser;
  return userWithoutPassword;
}

async function loginUser({ email, password }) {
  const user = await prisma.korisnik.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Email ili lozinka nisu ispravni');
    error.status = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.lozinkaHash);
  if (!passwordMatches) {
    const error = new Error('Email ili lozinka nisu ispravni');
    error.status = 401;
    throw error;
  }

  const { lozinkaHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

module.exports = {
  registerUser,
  loginUser,
};
