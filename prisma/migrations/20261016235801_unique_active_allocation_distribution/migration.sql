-- This is an empty migration.
CREATE UNIQUE INDEX "PlayerTransaction_one_active_distribution_per_allocation"
ON "PlayerTransaction" ("allocationId")
WHERE "allocationId" IS NOT NULL
    AND "type" = 'DISTRIBUTION'
    AND "status" = 'ACTIVE';