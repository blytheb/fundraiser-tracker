/*
  Warnings:

  - You are about to drop the `Allocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Allocation" DROP CONSTRAINT "Allocation_fundraiserParticipantId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTransaction" DROP CONSTRAINT "PlayerTransaction_allocationId_fkey";

-- DropTable
DROP TABLE "Allocation";

-- CreateTable
CREATE TABLE "FundraiserAllocation" (
    "id" TEXT NOT NULL,
    "fundraiserParticipantId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "AllocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundraiserAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FundraiserAllocation_fundraiserParticipantId_idx" ON "FundraiserAllocation"("fundraiserParticipantId");

-- AddForeignKey
ALTER TABLE "FundraiserAllocation" ADD CONSTRAINT "FundraiserAllocation_fundraiserParticipantId_fkey" FOREIGN KEY ("fundraiserParticipantId") REFERENCES "FundraiserParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTransaction" ADD CONSTRAINT "PlayerTransaction_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "FundraiserAllocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
