-- CreateEnum
CREATE TYPE "AccessRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PlayerAccessRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "status" "AccessRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentPlayerLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentPlayerLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerAccessRequest_userId_status_idx" ON "PlayerAccessRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "PlayerAccessRequest_playerId_status_idx" ON "PlayerAccessRequest"("playerId", "status");

-- CreateIndex
CREATE INDEX "PlayerAccessRequest_reviewedById_idx" ON "PlayerAccessRequest"("reviewedById");

-- CreateIndex
CREATE INDEX "ParentPlayerLink_playerId_idx" ON "ParentPlayerLink"("playerId");

-- CreateIndex
CREATE INDEX "ParentPlayerLink_createdById_idx" ON "ParentPlayerLink"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ParentPlayerLink_userId_playerId_key" ON "ParentPlayerLink"("userId", "playerId");

-- AddForeignKey
ALTER TABLE "PlayerAccessRequest" ADD CONSTRAINT "PlayerAccessRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAccessRequest" ADD CONSTRAINT "PlayerAccessRequest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAccessRequest" ADD CONSTRAINT "PlayerAccessRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentPlayerLink" ADD CONSTRAINT "ParentPlayerLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentPlayerLink" ADD CONSTRAINT "ParentPlayerLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentPlayerLink" ADD CONSTRAINT "ParentPlayerLink_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
