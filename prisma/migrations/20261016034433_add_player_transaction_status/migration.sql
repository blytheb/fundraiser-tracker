-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('ACTIVE', 'VOID');

-- AlterTable
ALTER TABLE "PlayerTransaction" ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'ACTIVE';
