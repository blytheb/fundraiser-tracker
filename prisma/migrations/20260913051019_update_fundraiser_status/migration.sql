BEGIN;

CREATE TYPE "FundraiserStatus_new" AS ENUM ('DRAFT', 'COMPLETED', 'PUBLISHED');

ALTER TABLE "Fundraiser"
ALTER COLUMN "status"
TYPE "FundraiserStatus_new"
USING ("status"::text::"FundraiserStatus_new");

ALTER TYPE "FundraiserStatus" RENAME TO "FundraiserStatus_old";

ALTER TYPE "FundraiserStatus_new" RENAME TO "FundraiserStatus";

DROP TYPE "public"."FundraiserStatus_old";

ALTER TABLE "Fundraiser"
DROP COLUMN "distributionMethod";

DROP TYPE "FundraiserDistribution";

ALTER TABLE "Fundraiser"
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

COMMIT;