const PDFDocument = require('pdfkit');
const prisma = require('../config/db');
const tabelaService = require('./tabelaService');

// NAPOMENA: PDFKit ugrađeni fontovi (Helvetica) ne podržavaju
// Bosanske znakove (š, č, ć, ž, đ). Za punu podršku treba ugraditi
// Unicode font: doc.registerFont('Custom', path.join(__dirname, '../assets/fonts/DejaVuSans.ttf'))

function formatDatum(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function crtajZaglavlje(doc, naziv, sezona, naslov) {
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#ea580c')
    .text('sport.ba', { align: 'center' });

  doc.moveDown(0.3);

  doc
    .fontSize(13)
    .fillColor('#1e293b')
    .text(naziv, { align: 'center' });

  if (sezona) {
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Sezona: ${sezona}`, { align: 'center' });
  }

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text(`Generisano: ${formatDatum(new Date())}`, { align: 'center' });

  doc.moveDown(0.5);

  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .strokeColor('#f59e0b')
    .lineWidth(2)
    .stroke();

  doc.moveDown(0.8);

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text(naslov, { align: 'left' });

  doc.moveDown(0.6);
}

async function generateTabelaPDF(takmicenjeId) {
  const { takmicenje, tabela } = await tabelaService.getTabelaZaTakmicenje(takmicenjeId);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    crtajZaglavlje(doc, takmicenje.naziv, takmicenje.sezona, 'Tabela takmicenja');

    if (tabela.length === 0) {
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Nema dostupnih podataka za ovo takmicenje.', { align: 'center' });
      doc.end();
      return;
    }

    // Pozicije kolona (x koordinate)
    const COL = {
      pos:        40,   // #
      tim:        75,   // Naziv tima
      odigrane:  255,   // O
      pobjede:   295,   // W
      nerij:     335,   // D
      porazi:    375,   // L
      golovi:    415,   // G+:G-
      bodovi:    490,   // BOD
    };
    const ROW_H = 20;
    const TABLE_WIDTH = 520;

    let y = doc.y;

    // --- Zaglavlje tabele ---
    doc.rect(40, y - 3, TABLE_WIDTH, ROW_H).fill('#f59e0b');

    doc.fontSize(8).font('Helvetica-Bold').fillColor('white');
    doc.text('#',       COL.pos,      y, { width: 30,  align: 'center' });
    doc.text('Tim',     COL.tim,      y, { width: 175, align: 'left' });
    doc.text('O',       COL.odigrane, y, { width: 35,  align: 'center' });
    doc.text('W',       COL.pobjede,  y, { width: 35,  align: 'center' });
    doc.text('D',       COL.nerij,    y, { width: 35,  align: 'center' });
    doc.text('L',       COL.porazi,   y, { width: 35,  align: 'center' });
    doc.text('G+:G-',   COL.golovi,   y, { width: 70,  align: 'center' });
    doc.text('BOD',     COL.bodovi,   y, { width: 50,  align: 'center' });

    y += ROW_H;

    // --- Redovi tabele ---
    tabela.forEach((tim, i) => {
      // Page break
      if (y > 760) {
        doc.addPage();
        y = 50;
      }

      const bgBoja = i % 2 === 0 ? '#fffbeb' : '#ffffff';
      doc.rect(40, y - 3, TABLE_WIDTH, ROW_H).fill(bgBoja);

      // Pozicija – medalje boje za top 3
      const pozBoje = { 1: '#ca8a04', 2: '#64748b', 3: '#b45309' };
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(pozBoje[tim.pozicija] || '#1e293b')
        .text(String(tim.pozicija), COL.pos, y, { width: 30, align: 'center' });

      // Naziv tima
      doc
        .font('Helvetica')
        .fillColor('#1e293b')
        .text(tim.naziv, COL.tim, y, { width: 175, align: 'left' });

      // Statistike
      doc.fillColor('#475569');
      doc.text(String(tim.odigrane),   COL.odigrane, y, { width: 35,  align: 'center' });
      doc.fillColor('#16a34a');
      doc.text(String(tim.pobjede),    COL.pobjede,  y, { width: 35,  align: 'center' });
      doc.fillColor('#64748b');
      doc.text(String(tim.nerijeseno), COL.nerij,    y, { width: 35,  align: 'center' });
      doc.fillColor('#dc2626');
      doc.text(String(tim.porazi),     COL.porazi,   y, { width: 35,  align: 'center' });

      const golRazlikaGol = `${tim.golovi}:${tim.primljeniGolovi}`;
      doc.fillColor('#475569');
      doc.text(golRazlikaGol, COL.golovi, y, { width: 70, align: 'center' });

      // Bodovi – istaknuto
      doc
        .font('Helvetica-Bold')
        .fillColor('#ea580c')
        .text(String(tim.bodovi), COL.bodovi, y, { width: 50, align: 'center' });

      y += ROW_H;
    });

    // Footer linija
    doc.moveDown(1);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .stroke();

    doc.end();
  });
}

async function generateRezultatiPDF(takmicenjeId, datumOd, datumDo) {
  const takmicenje = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: parseInt(takmicenjeId) },
    select: { naziv: true, sezona: true },
  });

  if (!takmicenje) throw new Error('Takmicenje nije pronađeno');

  const where = {
    takmicenjeId: parseInt(takmicenjeId),
    rezultatUtakmice: { isNot: null },
  };

  if (datumOd || datumDo) {
    where.vrijemePocetka = {};
    if (datumOd) where.vrijemePocetka.gte = new Date(datumOd);
    if (datumDo) {
      const do_ = new Date(datumDo);
      do_.setHours(23, 59, 59, 999);
      where.vrijemePocetka.lte = do_;
    }
  }

  const utakmice = await prisma.utakmica.findMany({
    where,
    include: {
      domaciTim:       { select: { naziv: true } },
      gostujuciTim:    { select: { naziv: true } },
      rezultatUtakmice: true,
    },
    orderBy: { vrijemePocetka: 'asc' },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    crtajZaglavlje(doc, takmicenje.naziv, takmicenje.sezona, 'Rezultati utakmica');

    // Period filtera u PDF-u
    if (datumOd || datumDo) {
      const od = datumOd ? formatDatum(new Date(datumOd).setHours(0, 0, 0)) : 'pocetka';
      const do_ = datumDo ? formatDatum(new Date(datumDo).setHours(23, 59, 59)) : 'danas';
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`Period: ${od} - ${do_}`, { align: 'left' });
      doc.moveDown(0.4);
    }

    if (utakmice.length === 0) {
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Nema rezultata za odabrani period.', { align: 'center' });
      doc.end();
      return;
    }

    // Kolone: Domaci | Rezultat | Gostujuci | Datum
    const COL = {
      domaci:    40,   // width 165
      rezultat: 210,   // width 80  – centrirano
      gostujuci: 295,  // width 165
      datum:    465,   // width 110
    };
    const ROW_H = 22;
    const TABLE_WIDTH = 520;

    let y = doc.y;

    // --- Zaglavlje tabele ---
    doc.rect(40, y - 3, TABLE_WIDTH, ROW_H).fill('#f59e0b');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('white');
    doc.text('Domaci tim',    COL.domaci,    y, { width: 165 });
    doc.text('Rezultat',      COL.rezultat,  y, { width: 80,  align: 'center' });
    doc.text('Gostujuci tim', COL.gostujuci, y, { width: 165 });
    doc.text('Datum',         COL.datum,     y, { width: 110 });
    y += ROW_H;

    // --- Redovi ---
    utakmice.forEach((utakmica, i) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }

      const bg = i % 2 === 0 ? '#fffbeb' : '#ffffff';
      doc.rect(40, y - 3, TABLE_WIDTH, ROW_H).fill(bg);

      const rezultat = utakmica.rezultatUtakmice;
      const score = rezultat
        ? `${rezultat.rezultatDomacin} : ${rezultat.rezultatGost}`
        : '-';

      doc.fontSize(9).font('Helvetica').fillColor('#1e293b');
      doc.text(utakmica.domaciTim.naziv,    COL.domaci,    y, { width: 165 });

      doc.font('Helvetica-Bold').fillColor('#ea580c');
      doc.text(score,                        COL.rezultat,  y, { width: 80, align: 'center' });

      doc.font('Helvetica').fillColor('#1e293b');
      doc.text(utakmica.gostujuciTim.naziv,  COL.gostujuci, y, { width: 165 });

      doc.fillColor('#64748b');
      doc.text(formatDatum(utakmica.vrijemePocetka), COL.datum, y, { width: 110 });

      y += ROW_H;
    });

    doc.moveDown(1);
    doc
      .moveTo(40, doc.y)
      .lineTo(555, doc.y)
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .stroke();

    doc.end();
  });
}

async function generateRasporedPDF(takmicenjeId, datumOd, datumDo) {
  const takmicenje = await prisma.takmicenje.findUnique({
    where: { takmicenjeId: parseInt(takmicenjeId) },
    select: { naziv: true, sezona: true },
  });

  if (!takmicenje) throw new Error('Takmicenje nije pronađeno');

  const where = { takmicenjeId: parseInt(takmicenjeId) };

  if (datumOd || datumDo) {
    where.vrijemePocetka = {};
    if (datumOd) where.vrijemePocetka.gte = new Date(datumOd);
    if (datumDo) {
      const do_ = new Date(datumDo);
      do_.setHours(23, 59, 59, 999);
      where.vrijemePocetka.lte = do_;
    }
  }

  const utakmice = await prisma.utakmica.findMany({
    where,
    include: {
      domaciTim:    { select: { naziv: true } },
      gostujuciTim: { select: { naziv: true } },
      sportskiObjekat: { select: { naziv: true } },
    },
    orderBy: { vrijemePocetka: 'asc' },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    crtajZaglavlje(doc, takmicenje.naziv, takmicenje.sezona, 'Raspored utakmica');

    if (datumOd || datumDo) {
      const od  = datumOd ? formatDatum(new Date(datumOd).setHours(0, 0, 0))      : 'pocetka';
      const do_ = datumDo ? formatDatum(new Date(datumDo).setHours(23, 59, 59))   : 'danas';
      doc
        .fontSize(9).font('Helvetica').fillColor('#64748b')
        .text(`Period: ${od} - ${do_}`, { align: 'left' });
      doc.moveDown(0.4);
    }

    if (utakmice.length === 0) {
      doc
        .fontSize(11).font('Helvetica').fillColor('#64748b')
        .text('Nema utakmica za odabrani period.', { align: 'center' });
      doc.end();
      return;
    }

    const COL = {
      domaci:    40,
      gostujuci: 190,
      datum:     340,
      lokacija:  450,
    };
    const ROW_H = 22;
    const TABLE_WIDTH = 520;

    let y = doc.y;

    doc.rect(40, y - 3, TABLE_WIDTH, ROW_H).fill('#f59e0b');
    doc.fontSize(8).font('Helvetica-Bold').fillColor('white');
    doc.text('Domaci tim',    COL.domaci,    y, { width: 145 });
    doc.text('Gostujuci tim', COL.gostujuci, y, { width: 145 });
    doc.text('Datum i vrijeme', COL.datum,   y, { width: 105 });
    doc.text('Lokacija',      COL.lokacija,  y, { width: 115 });
    y += ROW_H;

    utakmice.forEach((utakmica, i) => {
      if (y > 760) { doc.addPage(); y = 50; }

      const bg = i % 2 === 0 ? '#fffbeb' : '#ffffff';
      doc.rect(40, y - 3, TABLE_WIDTH, ROW_H).fill(bg);

      const lokacija = utakmica.sportskiObjekat?.naziv || utakmica.lokacijaOpis || '-';

      doc.fontSize(9).font('Helvetica').fillColor('#1e293b');
      doc.text(utakmica.domaciTim.naziv,    COL.domaci,    y, { width: 145 });
      doc.text(utakmica.gostujuciTim.naziv, COL.gostujuci, y, { width: 145 });
      doc.fillColor('#64748b');
      doc.text(formatDatum(utakmica.vrijemePocetka), COL.datum, y, { width: 105 });
      doc.text(lokacija, COL.lokacija, y, { width: 115 });

      y += ROW_H;
    });

    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke();
    doc.end();
  });
}

module.exports = { generateTabelaPDF, generateRezultatiPDF, generateRasporedPDF };