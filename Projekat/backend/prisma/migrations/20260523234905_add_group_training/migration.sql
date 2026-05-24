-- CreateTable
CREATE TABLE "GrupniTrening" (
    "treningId" SERIAL NOT NULL,
    "terminId" INTEGER NOT NULL,
    "trenerId" INTEGER NOT NULL,
    "maksimalanBrojIgraca" INTEGER NOT NULL,

    CONSTRAINT "GrupniTrening_pkey" PRIMARY KEY ("treningId")
);

-- CreateTable
CREATE TABLE "PrijavaGrupnogTreninga" (
    "prijavaId" SERIAL NOT NULL,
    "treningId" INTEGER NOT NULL,
    "korisnikId" INTEGER NOT NULL,
    "datumPrijave" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrijavaGrupnogTreninga_pkey" PRIMARY KEY ("prijavaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "GrupniTrening_terminId_key" ON "GrupniTrening"("terminId");

-- CreateIndex
CREATE UNIQUE INDEX "PrijavaGrupnogTreninga_treningId_korisnikId_key" ON "PrijavaGrupnogTreninga"("treningId", "korisnikId");

-- AddForeignKey
ALTER TABLE "GrupniTrening" ADD CONSTRAINT "GrupniTrening_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "TerminObjekta"("terminId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupniTrening" ADD CONSTRAINT "GrupniTrening_trenerId_fkey" FOREIGN KEY ("trenerId") REFERENCES "Korisnik"("korisnikId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrijavaGrupnogTreninga" ADD CONSTRAINT "PrijavaGrupnogTreninga_treningId_fkey" FOREIGN KEY ("treningId") REFERENCES "GrupniTrening"("treningId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrijavaGrupnogTreninga" ADD CONSTRAINT "PrijavaGrupnogTreninga_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("korisnikId") ON DELETE CASCADE ON UPDATE CASCADE;
