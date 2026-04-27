/*
  Warnings:

  - The `uloga` column on the `Korisnik` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Uloga" AS ENUM ('ADMINISTRATOR', 'ORGANIZATOR', 'TRENER', 'IGRAC', 'VLASNIK', 'NAVIJAC');

-- AlterTable
ALTER TABLE "Korisnik" DROP COLUMN "uloga",
ADD COLUMN     "uloga" "Uloga" NOT NULL DEFAULT 'NAVIJAC';
