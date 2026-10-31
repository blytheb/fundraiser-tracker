/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `Fundraiser` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Fundraiser` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FundraiserStatus" AS ENUM ('DRAFT', 'COMPLETED', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Fundraiser" DROP COLUMN "isCompleted",
DROP COLUMN "isPublished",
ADD COLUMN     "status" "FundraiserStatus" NOT NULL DEFAULT 'DRAFT';
