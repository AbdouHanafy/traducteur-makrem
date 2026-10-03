-- The previous migration used column defaults only to backfill rows created before the intake
-- fields existed. New orders must always provide these values explicitly.
ALTER TABLE `Order`
    ALTER COLUMN `destinationCountry` DROP DEFAULT,
    ALTER COLUMN `certificationNeeds` DROP DEFAULT;
