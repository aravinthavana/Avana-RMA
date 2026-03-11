-- AlterTable
ALTER TABLE "rmas" ADD COLUMN "isInjuryRelated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "rmas" ADD COLUMN "injuryDetails" TEXT;
