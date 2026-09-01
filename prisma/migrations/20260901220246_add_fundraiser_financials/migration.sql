/*
  Warnings:

  - You are about to drop the column `amount` on the `FundraiserParticipant` table. All the data in the column will be lost.
  - You are about to drop the `FundraiserFund` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ContributionType" AS ENUM ('SALES', 'EVENT_PROFIT', 'TIPS', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CHECK', 'VENMO', 'OTHER');

-- CreateEnum
CREATE TYPE "PlayerTransactionType" AS ENUM ('EXPENSE', 'PAYMENT', 'ADJUSTMENT');

-- DropForeignKey
ALTER TABLE "FundraiserFund" DROP CONSTRAINT "FundraiserFund_fundraiserId_fkey";

-- AlterTable
ALTER TABLE "FundraiserParticipant" DROP COLUMN "amount",
ADD COLUMN     "allocatedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "status" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "status" SET DEFAULT 'IN_SEASON';

-- DropTable
DROP TABLE "FundraiserFund";

-- DropEnum
DROP TYPE "FundType";

-- CreateTable
CREATE TABLE "FundraiserContribution" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "source" "ContributionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "fundraiserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundraiserContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTransaction" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "PlayerTransactionType" NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FundraiserContribution_fundraiserId_idx" ON "FundraiserContribution"("fundraiserId");

-- CreateIndex
CREATE INDEX "PlayerTransaction_playerId_idx" ON "PlayerTransaction"("playerId");

-- CreateIndex
CREATE INDEX "FundraiserParticipant_fundraiserId_idx" ON "FundraiserParticipant"("fundraiserId");

-- CreateIndex
CREATE INDEX "FundraiserTeam_teamId_idx" ON "FundraiserTeam"("teamId");

-- AddForeignKey
ALTER TABLE "FundraiserContribution" ADD CONSTRAINT "FundraiserContribution_fundraiserId_fkey" FOREIGN KEY ("fundraiserId") REFERENCES "Fundraiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTransaction" ADD CONSTRAINT "PlayerTransaction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
