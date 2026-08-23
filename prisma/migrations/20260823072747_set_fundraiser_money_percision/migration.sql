/*
  Warnings:

  - You are about to alter the column `amount` on the `FundraiserFund` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `FundraiserParticipant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "FundraiserFund" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "FundraiserParticipant" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);
