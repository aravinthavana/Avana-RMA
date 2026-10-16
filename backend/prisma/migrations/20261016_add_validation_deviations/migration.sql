-- CreateTable
CREATE TABLE "validation_deviations" (
    "id" TEXT NOT NULL,
    "deviationNumber" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL DEFAULT 'FORM-SH001',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effectiveDate" TEXT NOT NULL DEFAULT '10-Oct-2022',
    "protocolPortion" TEXT NOT NULL DEFAULT 'IQ',
    "protocolPortionCustom" TEXT,
    "testSection" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "observedByName" TEXT NOT NULL,
    "observedBySignature" TEXT,
    "dateObserved" TIMESTAMP(3) NOT NULL,
    "investigationImpact" TEXT,
    "correctiveAction" TEXT,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "completedByName" TEXT,
    "completedBySignature" TEXT,
    "completedDate" TIMESTAMP(3),
    "validationApproverName" TEXT,
    "validationApproverSignature" TEXT,
    "validationApprovalDate" TIMESTAMP(3),
    "smeApproverName" TEXT,
    "smeApproverSignature" TEXT,
    "smeApprovalDate" TIMESTAMP(3),
    "approverName" TEXT,
    "approverSignature" TEXT,
    "approvalDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "validation_deviations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "validation_deviations_deviationNumber_key" ON "validation_deviations"("deviationNumber");

-- CreateIndex
CREATE INDEX "validation_deviations_deviationNumber_idx" ON "validation_deviations"("deviationNumber");

-- CreateIndex
CREATE INDEX "validation_deviations_status_idx" ON "validation_deviations"("status");

-- AddForeignKey
ALTER TABLE "validation_deviations" ADD CONSTRAINT "validation_deviations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
