-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT
);

-- CreateTable
CREATE TABLE "rmas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "creationDate" TEXT NOT NULL,
    "lastUpdateDate" TEXT NOT NULL,
    "dateOfIncident" TEXT NOT NULL,
    "dateOfReport" TEXT NOT NULL,
    "attachment" TEXT,
    CONSTRAINT "rmas_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rma_devices" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rmaId" TEXT NOT NULL,
    "articleNumber" TEXT,
    "serialNumber" TEXT NOT NULL,
    "quantity" INTEGER,
    CONSTRAINT "rma_devices_rmaId_fkey" FOREIGN KEY ("rmaId") REFERENCES "rmas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "service_cycles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rmaId" TEXT NOT NULL,
    "deviceSerialNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "creationDate" TEXT NOT NULL,
    "statusDate" TEXT NOT NULL,
    "issueDescription" TEXT,
    "accessoriesIncluded" TEXT,
    CONSTRAINT "service_cycles_rmaId_fkey" FOREIGN KEY ("rmaId") REFERENCES "rmas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "service_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serviceCycleId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "service_history_serviceCycleId_fkey" FOREIGN KEY ("serviceCycleId") REFERENCES "service_cycles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "idx_rmas_customerId" ON "rmas"("customerId");

-- CreateIndex
CREATE INDEX "idx_rmas_creationDate" ON "rmas"("creationDate");

-- CreateIndex
CREATE INDEX "idx_rma_devices_rmaId" ON "rma_devices"("rmaId");

-- CreateIndex
CREATE INDEX "idx_rma_devices_serialNumber" ON "rma_devices"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "rma_devices_serialNumber_rmaId_key" ON "rma_devices"("serialNumber", "rmaId");

-- CreateIndex
CREATE INDEX "idx_service_cycles_rmaId" ON "service_cycles"("rmaId");

-- CreateIndex
CREATE INDEX "idx_service_cycles_deviceSerialNumber" ON "service_cycles"("deviceSerialNumber");

-- CreateIndex
CREATE INDEX "idx_service_history_serviceCycleId" ON "service_history"("serviceCycleId");
