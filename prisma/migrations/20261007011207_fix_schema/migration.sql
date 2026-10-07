/*
  Warnings:

  - You are about to drop the column `allocatedAmount` on the `FundraiserParticipant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('ACTIVE', 'VOID');

-- AlterTable
ALTER TABLE "FundraiserParticipant" DROP COLUMN "allocatedAmount";

-- AlterTable
ALTER TABLE "PlayerTransaction" ADD COLUMN     "allocationId" TEXT,
ADD COLUMN     "fundraiserId" TEXT;

-- CreateTable
CREATE TABLE "Allocation" (
    "id" TEXT NOT NULL,
    "fundraiserParticipantId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "AllocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Allocation_fundraiserParticipantId_idx" ON "Allocation"("fundraiserParticipantId");

-- CreateIndex
CREATE INDEX "PlayerTransaction_fundraiserId_idx" ON "PlayerTransaction"("fundraiserId");

-- CreateIndex
CREATE INDEX "PlayerTransaction_allocationId_idx" ON "PlayerTransaction"("allocationId");

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_fundraiserParticipantId_fkey" FOREIGN KEY ("fundraiserParticipantId") REFERENCES "FundraiserParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTransaction" ADD CONSTRAINT "PlayerTransaction_fundraiserId_fkey" FOREIGN KEY ("fundraiserId") REFERENCES "Fundraiser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTransaction" ADD CONSTRAINT "PlayerTransaction_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "Allocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
