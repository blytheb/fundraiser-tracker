-- CreateEnum
CREATE TYPE "FundraiserDistribution" AS ENUM ('EQUAL', 'CUSTOM');

-- AlterTable
ALTER TABLE "Fundraiser" ADD COLUMN     "distributionMethod" "FundraiserDistribution" NOT NULL DEFAULT 'EQUAL',
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FundraiserParticipant" ADD COLUMN     "distributionAmount" DECIMAL(10,2);
