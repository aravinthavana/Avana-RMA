-- AlterTable rmastable
ALTER TABLE "rmas" ALTER COLUMN "creationDate" TYPE TIMESTAMP(3) USING "creationDate"::TIMESTAMP(3);
ALTER TABLE "rmas" ALTER COLUMN "creationDate" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "rmas" ALTER COLUMN "lastUpdateDate" TYPE TIMESTAMP(3) USING "lastUpdateDate"::TIMESTAMP(3);
ALTER TABLE "rmas" ALTER COLUMN "lastUpdateDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable service_cycles
ALTER TABLE "service_cycles" ALTER COLUMN "creationDate" TYPE TIMESTAMP(3) USING "creationDate"::TIMESTAMP(3);
ALTER TABLE "service_cycles" ALTER COLUMN "creationDate" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "service_cycles" ALTER COLUMN "statusDate" TYPE TIMESTAMP(3) USING "statusDate"::TIMESTAMP(3);
ALTER TABLE "service_cycles" ALTER COLUMN "statusDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable service_history
ALTER TABLE "service_history" ALTER COLUMN "date" TYPE TIMESTAMP(3) USING "date"::TIMESTAMP(3);
ALTER TABLE "service_history" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;
