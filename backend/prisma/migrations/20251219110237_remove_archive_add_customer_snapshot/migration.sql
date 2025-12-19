/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `customers` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT
);
INSERT INTO "new_customers" ("address", "contactPerson", "email", "id", "name", "phone") SELECT "address", "contactPerson", "email", "id", "name", "phone" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE TABLE "new_rmas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "creationDate" TEXT NOT NULL,
    "lastUpdateDate" TEXT NOT NULL,
    "dateOfIncident" TEXT NOT NULL,
    "dateOfReport" TEXT NOT NULL,
    "attachment" TEXT,
    CONSTRAINT "rmas_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_rmas" ("attachment", "creationDate", "customerId", "dateOfIncident", "dateOfReport", "id", "lastUpdateDate") SELECT "attachment", "creationDate", "customerId", "dateOfIncident", "dateOfReport", "id", "lastUpdateDate" FROM "rmas";
DROP TABLE "rmas";
ALTER TABLE "new_rmas" RENAME TO "rmas";
CREATE INDEX "idx_rmas_customerId" ON "rmas"("customerId");
CREATE INDEX "idx_rmas_creationDate" ON "rmas"("creationDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
