-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PARENT');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PARENT';
