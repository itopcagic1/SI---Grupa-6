const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12; 

async function registerUser({ ime, email, lozinka, trazenaUloga, documents }) {
  const dozvoljeneUloge = ['NAVIJAC', 'IGRAC', 'TRENER', 'VLASNIK'];
  const trazenaUlogaUpper = trazenaUloga ? trazenaUloga.toUpperCase() : 'NAVIJAC';

  if (!dozvoljeneUloge.includes(trazenaUlogaUpper)) {
    const error = new Error('Uloga mora biti: NAVIJAC, IGRAC, TRENER ili VLASNIK');
    error.status = 400;
    error.code = "NEDOZVOLJENA_ULOGA";
    error.dozvoljene = dozvoljeneUloge;
    throw error;
  }

  const existingUser = await prisma.korisnik.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error('Korisnik sa ovim email-om je vec registriran');
    error.status = 409;
    error.code = "EMAIL_VEC_POSTOJI";
    throw error;
  }

  const lozinkaHash = await bcrypt.hash(lozinka, SALT_ROUNDS);

  const zahtijevaOdobrenje = trazenaUlogaUpper !== 'NAVIJAC';
  const statusUloge = zahtijevaOdobrenje ? 'PENDING' : 'ODOBREN';

  const createdUser = await prisma.korisnik.create({
    data: {
      punoIme: ime,
      email,
      lozinkaHash,
      uloga: 'NAVIJAC', // svima je po defaultu ova uloga dok admin ne odobri neku drugu
      trazenaUloga: trazenaUlogaUpper,
      statusUloge: statusUloge,
      documents: documents || [], 
      datumZahtjeva: zahtijevaOdobrenje ? new Date() : null, 
    },
  });

  const { lozinkaHash: _, ...userWithoutPassword } = createdUser;
  return userWithoutPassword;
}


async function loginUser({ email, lozinka }) {
  const user = await prisma.korisnik.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error('Korisnik sa ovim email-om nije pronadjen');
    error.status = 404;
    error.code = "KORISNIK_NIJE_PRONADJEN";
    throw error;
  }

  const passwordMatches = await bcrypt.compare(lozinka, user.lozinkaHash);
  if (!passwordMatches) {
   const error = new Error('Email ili lozinka nisu ispravni');
    error.status = 401;
    error.code = "NEISPRAVNE_AKREDITIVE";
    throw error;
  }

  const { lozinkaHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

module.exports = {
  registerUser,
  loginUser,
};
