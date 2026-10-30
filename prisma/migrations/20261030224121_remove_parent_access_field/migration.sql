-- Convert admin accounts that also have parent access
UPDATE "user"
SET "role" = 'ADMIN_PARENT'
WHERE "role" = 'ADMIN'
AND "hasParentAccess" = true;

-- Remove the old parent access field
ALTER TABLE "user" DROP COLUMN "hasParentAccess";