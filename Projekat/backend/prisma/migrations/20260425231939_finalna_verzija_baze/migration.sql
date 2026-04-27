-- CreateTable
CREATE TABLE "Korisnik" (
    "korisnikId" SERIAL NOT NULL,
    "punoIme" TEXT,
    "email" TEXT NOT NULL,
    "lozinkaHash" TEXT NOT NULL,
    "datumKreiranja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brojPreksrenihRezervacija" INTEGER NOT NULL DEFAULT 0,
    "statusPouzdanosti" TEXT,
    "uloga" TEXT,

    CONSTRAINT "Korisnik_pkey" PRIMARY KEY ("korisnikId")
);

-- CreateTable
CREATE TABLE "Sport" (
    "sportId" SERIAL NOT NULL,
    "naziv" TEXT NOT NULL,
    "opis" TEXT,
    "jeTimskiSport" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("sportId")
);

-- CreateTable
CREATE TABLE "Tim" (
    "timId" SERIAL NOT NULL,
    "naziv" TEXT NOT NULL,
    "sportId" INTEGER NOT NULL,
    "opis" TEXT,
    "logoUrl" TEXT,
    "status" TEXT,

    CONSTRAINT "Tim_pkey" PRIMARY KEY ("timId")
);

-- CreateTable
CREATE TABLE "ClanstvoTima" (
    "clanstvoTimaId" SERIAL NOT NULL,
    "timId" INTEGER NOT NULL,
    "korisnikId" INTEGER NOT NULL,
    "ulogaUTimu" TEXT,
    "datumPridruzivanja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,

    CONSTRAINT "ClanstvoTima_pkey" PRIMARY KEY ("clanstvoTimaId")
);

-- CreateTable
CREATE TABLE "OmiljeniTim" (
    "omiljeniTimId" SERIAL NOT NULL,
    "korisnikId" INTEGER NOT NULL,
    "timId" INTEGER NOT NULL,
    "datumDodavanja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "napomenaKorisnika" TEXT,

    CONSTRAINT "OmiljeniTim_pkey" PRIMARY KEY ("omiljeniTimId")
);

-- CreateTable
CREATE TABLE "Takmicenje" (
    "takmicenjeId" SERIAL NOT NULL,
    "naziv" TEXT NOT NULL,
    "sezona" TEXT,
    "sportId" INTEGER NOT NULL,
    "organizatorId" INTEGER NOT NULL,
    "status" TEXT,
    "opis" TEXT,
    "datumPocetka" TIMESTAMP(3),
    "datumZavrsetka" TIMESTAMP(3),
    "tipTakmicenja" TEXT,

    CONSTRAINT "Takmicenje_pkey" PRIMARY KEY ("takmicenjeId")
);

-- CreateTable
CREATE TABLE "Utakmica" (
    "utakmicaId" SERIAL NOT NULL,
    "takmicenjeId" INTEGER NOT NULL,
    "domaciTimId" INTEGER NOT NULL,
    "gostujuciTimId" INTEGER NOT NULL,
    "objekatId" INTEGER,
    "vrijemePocetka" TIMESTAMP(3) NOT NULL,
    "vrijemeZavrsetka" TIMESTAMP(3),
    "status" TEXT,
    "lokacijaOpis" TEXT,

    CONSTRAINT "Utakmica_pkey" PRIMARY KEY ("utakmicaId")
);

-- CreateTable
CREATE TABLE "RezultatUtakmice" (
    "rezultatUtakmiceId" SERIAL NOT NULL,
    "utakmicaId" INTEGER NOT NULL,
    "rezultatDomacin" INTEGER NOT NULL,
    "rezultatGost" INTEGER NOT NULL,
    "unioKorisnikId" INTEGER NOT NULL,
    "datumUnosa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RezultatUtakmice_pkey" PRIMARY KEY ("rezultatUtakmiceId")
);

-- CreateTable
CREATE TABLE "PlasmanNaTabeli" (
    "plasmanNaTabeliId" SERIAL NOT NULL,
    "timId" INTEGER NOT NULL,
    "takmicenjeId" INTEGER NOT NULL,
    "brojPobjeda" INTEGER NOT NULL DEFAULT 0,
    "brojNerijesenih" INTEGER NOT NULL DEFAULT 0,
    "brojPoraza" INTEGER NOT NULL DEFAULT 0,
    "ukupniBodovi" INTEGER NOT NULL DEFAULT 0,
    "trenutnaPozicija" INTEGER,

    CONSTRAINT "PlasmanNaTabeli_pkey" PRIMARY KEY ("plasmanNaTabeliId")
);

-- CreateTable
CREATE TABLE "UcesceUTakmicenju" (
    "ucesceUTakmicenjuId" SERIAL NOT NULL,
    "takmicenjeId" INTEGER NOT NULL,
    "timId" INTEGER NOT NULL,
    "prijavioKorisnikId" INTEGER NOT NULL,
    "statusPrijave" TEXT,
    "datumPrijave" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datumOdobrenja" TIMESTAMP(3),

    CONSTRAINT "UcesceUTakmicenju_pkey" PRIMARY KEY ("ucesceUTakmicenjuId")
);

-- CreateTable
CREATE TABLE "TipStatistike" (
    "tipStatistikeId" SERIAL NOT NULL,
    "sportId" INTEGER NOT NULL,
    "nazivStatistike" TEXT NOT NULL,

    CONSTRAINT "TipStatistike_pkey" PRIMARY KEY ("tipStatistikeId")
);

-- CreateTable
CREATE TABLE "StatistikaTimaNaUtakmici" (
    "statistikaTimaId" SERIAL NOT NULL,
    "utakmicaId" INTEGER NOT NULL,
    "timId" INTEGER NOT NULL,

    CONSTRAINT "StatistikaTimaNaUtakmici_pkey" PRIMARY KEY ("statistikaTimaId")
);

-- CreateTable
CREATE TABLE "VrijednostStatistikeTima" (
    "vrijednostId" SERIAL NOT NULL,
    "statistikaTimaId" INTEGER NOT NULL,
    "tipStatistikeId" INTEGER NOT NULL,
    "vrijednost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VrijednostStatistikeTima_pkey" PRIMARY KEY ("vrijednostId")
);

-- CreateTable
CREATE TABLE "StatistikaIgracaNaUtakmici" (
    "statistikaIgracaId" SERIAL NOT NULL,
    "utakmicaId" INTEGER NOT NULL,
    "timId" INTEGER NOT NULL,
    "korisnikId" INTEGER NOT NULL,

    CONSTRAINT "StatistikaIgracaNaUtakmici_pkey" PRIMARY KEY ("statistikaIgracaId")
);

-- CreateTable
CREATE TABLE "VrijednostStatistikeIgraca" (
    "vrijednostId" SERIAL NOT NULL,
    "statistikaIgracaId" INTEGER NOT NULL,
    "tipStatistikeId" INTEGER NOT NULL,
    "vrijednost" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VrijednostStatistikeIgraca_pkey" PRIMARY KEY ("vrijednostId")
);

-- CreateTable
CREATE TABLE "SportskiObjekat" (
    "objekatId" SERIAL NOT NULL,
    "vlasnikId" INTEGER NOT NULL,
    "naziv" TEXT NOT NULL,
    "adresa" TEXT,
    "opis" TEXT,
    "kapacitet" INTEGER,
    "status" TEXT,

    CONSTRAINT "SportskiObjekat_pkey" PRIMARY KEY ("objekatId")
);

-- CreateTable
CREATE TABLE "TerminObjekta" (
    "terminId" SERIAL NOT NULL,
    "objekatId" INTEGER NOT NULL,
    "vrijemePocetka" TIMESTAMP(3) NOT NULL,
    "vrijemeZavrsetka" TIMESTAMP(3) NOT NULL,
    "tipTermina" TEXT,
    "status" TEXT,

    CONSTRAINT "TerminObjekta_pkey" PRIMARY KEY ("terminId")
);

-- CreateTable
CREATE TABLE "ZahtjevZaRezervaciju" (
    "zahtjevId" SERIAL NOT NULL,
    "terminId" INTEGER NOT NULL,
    "korisnikId" INTEGER NOT NULL,
    "timId" INTEGER,
    "status" TEXT,
    "datumSlanja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datumObrade" TIMESTAMP(3),
    "razlogOdbijanja" TEXT,
    "obradioKorisnikId" INTEGER,

    CONSTRAINT "ZahtjevZaRezervaciju_pkey" PRIMARY KEY ("zahtjevId")
);

-- CreateTable
CREATE TABLE "Rezervacija" (
    "rezervacijaId" SERIAL NOT NULL,
    "zahtjevId" INTEGER NOT NULL,
    "terminId" INTEGER NOT NULL,
    "status" TEXT,
    "datumKreiranja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datumPotvrde" TIMESTAMP(3),
    "datumOtkazivanja" TIMESTAMP(3),
    "razlogOtkazivanja" TEXT,
    "otkazaoKorisnikId" INTEGER,

    CONSTRAINT "Rezervacija_pkey" PRIMARY KEY ("rezervacijaId")
);

-- CreateTable
CREATE TABLE "StavkaListeCekanja" (
    "stavkaId" SERIAL NOT NULL,
    "zahtjevId" INTEGER NOT NULL,
    "redniBroj" INTEGER NOT NULL,
    "datumDodavanja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusStavke" TEXT,

    CONSTRAINT "StavkaListeCekanja_pkey" PRIMARY KEY ("stavkaId")
);

-- CreateTable
CREATE TABLE "AIPredikcija" (
    "predikcijaId" SERIAL NOT NULL,
    "takmicenjeId" INTEGER NOT NULL,
    "utakmicaId" INTEGER NOT NULL,
    "predvidjeniIshod" TEXT,
    "vjerovatnoca" DOUBLE PRECISION,
    "detaljnoObjasnjenje" TEXT,
    "vrijemeGenerisanja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPredikcija_pkey" PRIMARY KEY ("predikcijaId")
);

-- CreateTable
CREATE TABLE "Notifikacija" (
    "notifikacijaId" SERIAL NOT NULL,
    "korisnikId" INTEGER NOT NULL,
    "tipNotifikacije" TEXT,
    "sadrzajPoruke" TEXT,
    "status" TEXT,
    "vrijemeSlanja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vrijemeCitanja" TIMESTAMP(3),

    CONSTRAINT "Notifikacija_pkey" PRIMARY KEY ("notifikacijaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Korisnik_email_key" ON "Korisnik"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_naziv_key" ON "Sport"("naziv");

-- CreateIndex
CREATE UNIQUE INDEX "RezultatUtakmice_utakmicaId_key" ON "RezultatUtakmice"("utakmicaId");

-- AddForeignKey
ALTER TABLE "Tim" ADD CONSTRAINT "Tim_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("sportId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanstvoTima" ADD CONSTRAINT "ClanstvoTima_timId_fkey" FOREIGN KEY ("timId") REFERENCES "Tim"("timId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClanstvoTima" ADD CONSTRAINT "ClanstvoTima_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OmiljeniTim" ADD CONSTRAINT "OmiljeniTim_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OmiljeniTim" ADD CONSTRAINT "OmiljeniTim_timId_fkey" FOREIGN KEY ("timId") REFERENCES "Tim"("timId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Takmicenje" ADD CONSTRAINT "Takmicenje_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("sportId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Takmicenje" ADD CONSTRAINT "Takmicenje_organizatorId_fkey" FOREIGN KEY ("organizatorId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utakmica" ADD CONSTRAINT "Utakmica_takmicenjeId_fkey" FOREIGN KEY ("takmicenjeId") REFERENCES "Takmicenje"("takmicenjeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utakmica" ADD CONSTRAINT "Utakmica_domaciTimId_fkey" FOREIGN KEY ("domaciTimId") REFERENCES "Tim"("timId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utakmica" ADD CONSTRAINT "Utakmica_gostujuciTimId_fkey" FOREIGN KEY ("gostujuciTimId") REFERENCES "Tim"("timId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utakmica" ADD CONSTRAINT "Utakmica_objekatId_fkey" FOREIGN KEY ("objekatId") REFERENCES "SportskiObjekat"("objekatId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RezultatUtakmice" ADD CONSTRAINT "RezultatUtakmice_utakmicaId_fkey" FOREIGN KEY ("utakmicaId") REFERENCES "Utakmica"("utakmicaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RezultatUtakmice" ADD CONSTRAINT "RezultatUtakmice_unioKorisnikId_fkey" FOREIGN KEY ("unioKorisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlasmanNaTabeli" ADD CONSTRAINT "PlasmanNaTabeli_timId_fkey" FOREIGN KEY ("timId") REFERENCES "Tim"("timId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlasmanNaTabeli" ADD CONSTRAINT "PlasmanNaTabeli_takmicenjeId_fkey" FOREIGN KEY ("takmicenjeId") REFERENCES "Takmicenje"("takmicenjeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UcesceUTakmicenju" ADD CONSTRAINT "UcesceUTakmicenju_takmicenjeId_fkey" FOREIGN KEY ("takmicenjeId") REFERENCES "Takmicenje"("takmicenjeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UcesceUTakmicenju" ADD CONSTRAINT "UcesceUTakmicenju_timId_fkey" FOREIGN KEY ("timId") REFERENCES "Tim"("timId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UcesceUTakmicenju" ADD CONSTRAINT "UcesceUTakmicenju_prijavioKorisnikId_fkey" FOREIGN KEY ("prijavioKorisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipStatistike" ADD CONSTRAINT "TipStatistike_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("sportId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistikaTimaNaUtakmici" ADD CONSTRAINT "StatistikaTimaNaUtakmici_utakmicaId_fkey" FOREIGN KEY ("utakmicaId") REFERENCES "Utakmica"("utakmicaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistikaTimaNaUtakmici" ADD CONSTRAINT "StatistikaTimaNaUtakmici_timId_fkey" FOREIGN KEY ("timId") REFERENCES "Tim"("timId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VrijednostStatistikeTima" ADD CONSTRAINT "VrijednostStatistikeTima_statistikaTimaId_fkey" FOREIGN KEY ("statistikaTimaId") REFERENCES "StatistikaTimaNaUtakmici"("statistikaTimaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VrijednostStatistikeTima" ADD CONSTRAINT "VrijednostStatistikeTima_tipStatistikeId_fkey" FOREIGN KEY ("tipStatistikeId") REFERENCES "TipStatistike"("tipStatistikeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistikaIgracaNaUtakmici" ADD CONSTRAINT "StatistikaIgracaNaUtakmici_utakmicaId_fkey" FOREIGN KEY ("utakmicaId") REFERENCES "Utakmica"("utakmicaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistikaIgracaNaUtakmici" ADD CONSTRAINT "StatistikaIgracaNaUtakmici_timId_fkey" FOREIGN KEY ("timId") REFERENCES "Tim"("timId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatistikaIgracaNaUtakmici" ADD CONSTRAINT "StatistikaIgracaNaUtakmici_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VrijednostStatistikeIgraca" ADD CONSTRAINT "VrijednostStatistikeIgraca_statistikaIgracaId_fkey" FOREIGN KEY ("statistikaIgracaId") REFERENCES "StatistikaIgracaNaUtakmici"("statistikaIgracaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VrijednostStatistikeIgraca" ADD CONSTRAINT "VrijednostStatistikeIgraca_tipStatistikeId_fkey" FOREIGN KEY ("tipStatistikeId") REFERENCES "TipStatistike"("tipStatistikeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportskiObjekat" ADD CONSTRAINT "SportskiObjekat_vlasnikId_fkey" FOREIGN KEY ("vlasnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TerminObjekta" ADD CONSTRAINT "TerminObjekta_objekatId_fkey" FOREIGN KEY ("objekatId") REFERENCES "SportskiObjekat"("objekatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZahtjevZaRezervaciju" ADD CONSTRAINT "ZahtjevZaRezervaciju_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "TerminObjekta"("terminId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZahtjevZaRezervaciju" ADD CONSTRAINT "ZahtjevZaRezervaciju_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZahtjevZaRezervaciju" ADD CONSTRAINT "ZahtjevZaRezervaciju_timId_fkey" FOREIGN KEY ("timId") REFERENCES "Tim"("timId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZahtjevZaRezervaciju" ADD CONSTRAINT "ZahtjevZaRezervaciju_obradioKorisnikId_fkey" FOREIGN KEY ("obradioKorisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rezervacija" ADD CONSTRAINT "Rezervacija_zahtjevId_fkey" FOREIGN KEY ("zahtjevId") REFERENCES "ZahtjevZaRezervaciju"("zahtjevId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rezervacija" ADD CONSTRAINT "Rezervacija_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "TerminObjekta"("terminId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rezervacija" ADD CONSTRAINT "Rezervacija_otkazaoKorisnikId_fkey" FOREIGN KEY ("otkazaoKorisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StavkaListeCekanja" ADD CONSTRAINT "StavkaListeCekanja_zahtjevId_fkey" FOREIGN KEY ("zahtjevId") REFERENCES "ZahtjevZaRezervaciju"("zahtjevId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPredikcija" ADD CONSTRAINT "AIPredikcija_takmicenjeId_fkey" FOREIGN KEY ("takmicenjeId") REFERENCES "Takmicenje"("takmicenjeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPredikcija" ADD CONSTRAINT "AIPredikcija_utakmicaId_fkey" FOREIGN KEY ("utakmicaId") REFERENCES "Utakmica"("utakmicaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikacija" ADD CONSTRAINT "Notifikacija_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;
