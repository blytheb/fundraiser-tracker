/*
  Warnings:

  - You are about to drop the column `status` on the `Fundraiser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fundraiser" DROP COLUMN "status",
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "FundraiserStatus";
