/*
  Warnings:

  - The values [DRAFT] on the enum `FundraiserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `distributionMethod` on the `Fundraiser` table. All the data in the column will be lost.
  - You are about to drop the column `fundraiserDate` on the `Fundraiser` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Fundraiser` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `Fundraiser` table. All the data in the column will be lost.
  - You are about to drop the `FundraiserTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Season` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeasonPlayer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WalletTransaction` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `description` on table `Fundraiser` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `status` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('IN_SEASON', 'SEASON_ENDED');

-- AlterEnum
BEGIN;
CREATE TYPE "FundraiserStatus_new" AS ENUM ('ACTIVE', 'COMPLETED');
ALTER TABLE "Fundraiser" ALTER COLUMN "status" TYPE "FundraiserStatus_new" USING ("status"::text::"FundraiserStatus_new");
ALTER TYPE "FundraiserStatus" RENAME TO "FundraiserStatus_old";
ALTER TYPE "FundraiserStatus_new" RENAME TO "FundraiserStatus";
DROP TYPE "public"."FundraiserStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Fundraiser" DROP CONSTRAINT "Fundraiser_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "FundraiserTransaction" DROP CONSTRAINT "FundraiserTransaction_fundraiserId_fkey";

-- DropForeignKey
ALTER TABLE "FundraiserTransaction" DROP CONSTRAINT "FundraiserTransaction_seasonPlayerId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Season" DROP CONSTRAINT "Season_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "SeasonPlayer" DROP CONSTRAINT "SeasonPlayer_playerId_fkey";

-- DropForeignKey
ALTER TABLE "SeasonPlayer" DROP CONSTRAINT "SeasonPlayer_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_createdById_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_fundraiserTransactionId_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_seasonPlayerId_fkey";

-- AlterTable
ALTER TABLE "Fundraiser" DROP COLUMN "distributionMethod",
DROP COLUMN "fundraiserDate",
DROP COLUMN "notes",
DROP COLUMN "seasonId",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "FundraiserTransaction";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "OrganizationMember";

-- DropTable
DROP TABLE "Season";

-- DropTable
DROP TABLE "SeasonPlayer";

-- DropTable
DROP TABLE "WalletTransaction";

-- DropEnum
DROP TYPE "FundraiserDistribution";

-- DropEnum
DROP TYPE "FundraiserTransactionType";

-- DropEnum
DROP TYPE "OrganizationRole";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "SeasonStatus";

-- DropEnum
DROP TYPE "WalletTransactionType";

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TeamStatus" NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPlayer" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundraiserParticipant" (
    "id" TEXT NOT NULL,
    "fundraiserId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundraiserParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundraiserTeam" (
    "id" TEXT NOT NULL,
    "fundraiserId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundraiserTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlayer_teamId_playerId_key" ON "TeamPlayer"("teamId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FundraiserParticipant_fundraiserId_playerId_key" ON "FundraiserParticipant"("fundraiserId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FundraiserTeam_fundraiserId_teamId_key" ON "FundraiserTeam"("fundraiserId", "teamId");

-- AddForeignKey
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundraiserParticipant" ADD CONSTRAINT "FundraiserParticipant_fundraiserId_fkey" FOREIGN KEY ("fundraiserId") REFERENCES "Fundraiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundraiserParticipant" ADD CONSTRAINT "FundraiserParticipant_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundraiserTeam" ADD CONSTRAINT "FundraiserTeam_fundraiserId_fkey" FOREIGN KEY ("fundraiserId") REFERENCES "Fundraiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundraiserTeam" ADD CONSTRAINT "FundraiserTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
