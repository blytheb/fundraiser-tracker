-- CreateEnum
CREATE TYPE "FundType" AS ENUM ('SALES', 'EVENT_PROFIT', 'TIPS', 'OTHER');

-- CreateTable
CREATE TABLE "FundraiserFund" (
    "id" TEXT NOT NULL,
    "type" "FundType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "fundraiserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundraiserFund_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FundraiserFund" ADD CONSTRAINT "FundraiserFund_fundraiserId_fkey" FOREIGN KEY ("fundraiserId") REFERENCES "Fundraiser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
