-- CreateEnum
CREATE TYPE "Pot" AS ENUM ('GENERAL', 'TRAVEL', 'TOURNAMENT');

-- AlterTable
ALTER TABLE "PlayerTransaction" ADD COLUMN     "pot" "Pot" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "transferId" TEXT;

-- AlterTable
ALTER TABLE "TeamTransaction" ADD COLUMN     "pot" "Pot" NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX "PlayerTransaction_transferId_idx" ON "PlayerTransaction"("transferId");
