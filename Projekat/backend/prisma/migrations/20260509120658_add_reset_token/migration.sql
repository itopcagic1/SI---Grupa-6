-- AlterTable
ALTER TABLE "Korisnik" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);
