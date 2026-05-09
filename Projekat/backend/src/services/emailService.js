const sgMail = require('../config/mailer');

async function posaljiResetEmail(email, resetLink) {
  await sgMail.send({
    to: email,
    from: '"SportManager" <pisprojekat15@gmail.com>',
    subject: 'Reset lozinke',
    html: `
      <p>Zatražen je reset lozinke za vaš nalog.</p>
      <p><a href="${resetLink}">Kliknite ovdje da resetujete lozinku</a></p>
      <p>Link je validan 30 minuta. Ako niste vi zatražili reset, ignorišite ovaj mail.</p>
    `,
  });
}

module.exports = { posaljiResetEmail };