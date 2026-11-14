-- Remove v1 fundraisers (decided: the data isn't needed, in dev and production).
-- First delete every ledger row that came from a fundraiser, while the columns still
-- exist: rows linked to a fundraiser, and orphaned distributions whose fundraiser was
-- deleted earlier. Team transaction rows (teamTransactionId set) are kept.
DELETE FROM "PlayerTransaction"
WHERE "fundraiserId" IS NOT NULL
   OR ("type" = 'DISTRIBUTION' AND "teamTransactionId" IS NULL);

-- DropForeignKey
ALTER TABLE "FundraiserAllocation" DROP CONSTRAINT "FundraiserAllocation_fundraiserParticipantId_fkey";

-- DropForeignKey
ALTER TABLE "FundraiserContribution" DROP CONSTRAINT "FundraiserContribution_fundraiserId_fkey";

-- DropForeignKey
ALTER TABLE "FundraiserParticipant" DROP CONSTRAINT "FundraiserParticipant_fundraiserId_fkey";

-- DropForeignKey
ALTER TABLE "FundraiserParticipant" DROP CONSTRAINT "FundraiserParticipant_playerId_fkey";

-- DropForeignKey
ALTER TABLE "FundraiserTeam" DROP CONSTRAINT "FundraiserTeam_fundraiserId_fkey";

-- DropForeignKey
ALTER TABLE "FundraiserTeam" DROP CONSTRAINT "FundraiserTeam_teamId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTransaction" DROP CONSTRAINT "PlayerTransaction_allocationId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTransaction" DROP CONSTRAINT "PlayerTransaction_fundraiserId_fkey";

-- DropIndex
DROP INDEX "PlayerTransaction_allocationId_idx";

-- DropIndex
DROP INDEX "PlayerTransaction_fundraiserId_idx";

-- AlterTable
ALTER TABLE "PlayerTransaction" DROP COLUMN "allocationId",
DROP COLUMN "fundraiserId",
DROP COLUMN "type";

-- DropTable
DROP TABLE "Fundraiser";

-- DropTable
DROP TABLE "FundraiserAllocation";

-- DropTable
DROP TABLE "FundraiserContribution";

-- DropTable
DROP TABLE "FundraiserParticipant";

-- DropTable
DROP TABLE "FundraiserTeam";

-- DropEnum
DROP TYPE "AllocationStatus";

-- DropEnum
DROP TYPE "ContributionType";

-- DropEnum
DROP TYPE "FundraiserStatus";

-- DropEnum
DROP TYPE "PlayerTransactionType";

