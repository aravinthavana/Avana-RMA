-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rmas" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "creationDate" TEXT NOT NULL,
    "lastUpdateDate" TEXT NOT NULL,
    "dateOfIncident" TEXT NOT NULL,
    "dateOfReport" TEXT NOT NULL,
    "attachment" TEXT,

    CONSTRAINT "rmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rma_devices" (
    "id" SERIAL NOT NULL,
    "rmaId" TEXT NOT NULL,
    "articleNumber" TEXT,
    "serialNumber" TEXT NOT NULL,
    "quantity" INTEGER,

    CONSTRAINT "rma_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_cycles" (
    "id" SERIAL NOT NULL,
    "rmaId" TEXT NOT NULL,
    "deviceSerialNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "creationDate" TEXT NOT NULL,
    "statusDate" TEXT NOT NULL,
    "issueDescription" TEXT,
    "accessoriesIncluded" TEXT,

    CONSTRAINT "service_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_history" (
    "id" SERIAL NOT NULL,
    "serviceCycleId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "service_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_rmas_customerId" ON "rmas"("customerId");

-- CreateIndex
CREATE INDEX "idx_rmas_creationDate" ON "rmas"("creationDate");

-- CreateIndex
CREATE UNIQUE INDEX "rma_devices_serialNumber_rmaId_key" ON "rma_devices"("serialNumber", "rmaId");

-- CreateIndex
CREATE INDEX "idx_rma_devices_rmaId" ON "rma_devices"("rmaId");

-- CreateIndex
CREATE INDEX "idx_rma_devices_serialNumber" ON "rma_devices"("serialNumber");

-- CreateIndex
CREATE INDEX "idx_service_cycles_rmaId" ON "service_cycles"("rmaId");

-- CreateIndex
CREATE INDEX "idx_service_cycles_deviceSerialNumber" ON "service_cycles"("deviceSerialNumber");

-- CreateIndex
CREATE INDEX "idx_service_history_serviceCycleId" ON "service_history"("serviceCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_audit_userId" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "idx_audit_action" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "rmas" ADD CONSTRAINT "rmas_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rma_devices" ADD CONSTRAINT "rma_devices_rmaId_fkey" FOREIGN KEY ("rmaId") REFERENCES "rmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_cycles" ADD CONSTRAINT "service_cycles_rmaId_fkey" FOREIGN KEY ("rmaId") REFERENCES "rmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_serviceCycleId_fkey" FOREIGN KEY ("serviceCycleId") REFERENCES "service_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
