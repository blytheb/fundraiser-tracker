/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Fundraiser` table. All the data in the column will be lost.
  - You are about to drop the column `distributionAmount` on the `FundraiserParticipant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fundraiser" DROP COLUMN "totalAmount";

-- AlterTable
ALTER TABLE "FundraiserParticipant" DROP COLUMN "distributionAmount",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL DEFAULT 0;
