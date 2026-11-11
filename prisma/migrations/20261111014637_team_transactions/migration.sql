/*
  Warnings:

  - Added the required column `direction` to the `PlayerTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TeamTransactionStatus" AS ENUM ('DRAFT', 'COMPLETED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ShareStatus" AS ENUM ('ACTIVE', 'VOID');

-- DropForeignKey
ALTER TABLE "PlayerTransaction" DROP CONSTRAINT "PlayerTransaction_playerId_fkey";

-- DropIndex
DROP INDEX "PlayerTransaction_playerId_idx";

-- AlterTable
ALTER TABLE "PlayerTransaction" ADD COLUMN     "direction" "TransactionDirection",
ADD COLUMN     "shareId" TEXT,
ADD COLUMN     "teamTransactionId" TEXT;

-- Backfill direction for existing rows from type (same sign rules as summarizeTransactions)
UPDATE "PlayerTransaction" SET "direction" = CASE
  WHEN "type" IN ('PAYMENT', 'DISTRIBUTION') THEN 'INCOME'::"TransactionDirection"
  WHEN "type" = 'EXPENSE' THEN 'EXPENSE'::"TransactionDirection"
  WHEN "type" = 'ADJUSTMENT' AND "amount" >= 0 THEN 'INCOME'::"TransactionDirection"
  ELSE 'EXPENSE'::"TransactionDirection"
END;

ALTER TABLE "PlayerTransaction" ALTER COLUMN "direction" SET NOT NULL;

-- CreateTable
CREATE TABLE "TeamTransaction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "direction" "TransactionDirection" NOT NULL,
    "status" "TeamTransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamTransactionTeam" (
    "id" TEXT NOT NULL,
    "teamTransactionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamTransactionTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamTransactionParticipant" (
    "id" TEXT NOT NULL,
    "teamTransactionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamTransactionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamTransactionShare" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "ShareStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamTransactionShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamTransactionItem" (
    "id" TEXT NOT NULL,
    "teamTransactionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamTransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamTransactionTeam_teamId_idx" ON "TeamTransactionTeam"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamTransactionTeam_teamTransactionId_teamId_key" ON "TeamTransactionTeam"("teamTransactionId", "teamId");

-- CreateIndex
CREATE INDEX "TeamTransactionParticipant_playerId_idx" ON "TeamTransactionParticipant"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamTransactionParticipant_teamTransactionId_playerId_key" ON "TeamTransactionParticipant"("teamTransactionId", "playerId");

-- CreateIndex
CREATE INDEX "TeamTransactionShare_participantId_idx" ON "TeamTransactionShare"("participantId");

-- CreateIndex
CREATE INDEX "TeamTransactionItem_teamTransactionId_idx" ON "TeamTransactionItem"("teamTransactionId");

-- CreateIndex
CREATE INDEX "PlayerTransaction_playerId_status_idx" ON "PlayerTransaction"("playerId", "status");

-- CreateIndex
CREATE INDEX "PlayerTransaction_teamTransactionId_idx" ON "PlayerTransaction"("teamTransactionId");

-- CreateIndex
CREATE INDEX "PlayerTransaction_shareId_idx" ON "PlayerTransaction"("shareId");

-- AddForeignKey
ALTER TABLE "PlayerTransaction" ADD CONSTRAINT "PlayerTransaction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTransaction" ADD CONSTRAINT "PlayerTransaction_teamTransactionId_fkey" FOREIGN KEY ("teamTransactionId") REFERENCES "TeamTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTransaction" ADD CONSTRAINT "PlayerTransaction_shareId_fkey" FOREIGN KEY ("shareId") REFERENCES "TeamTransactionShare"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTransactionTeam" ADD CONSTRAINT "TeamTransactionTeam_teamTransactionId_fkey" FOREIGN KEY ("teamTransactionId") REFERENCES "TeamTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTransactionTeam" ADD CONSTRAINT "TeamTransactionTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTransactionParticipant" ADD CONSTRAINT "TeamTransactionParticipant_teamTransactionId_fkey" FOREIGN KEY ("teamTransactionId") REFERENCES "TeamTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTransactionParticipant" ADD CONSTRAINT "TeamTransactionParticipant_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTransactionShare" ADD CONSTRAINT "TeamTransactionShare_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "TeamTransactionParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTransactionItem" ADD CONSTRAINT "TeamTransactionItem_teamTransactionId_fkey" FOREIGN KEY ("teamTransactionId") REFERENCES "TeamTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
