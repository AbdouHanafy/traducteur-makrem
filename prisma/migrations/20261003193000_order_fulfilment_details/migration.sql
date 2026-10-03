ALTER TABLE `Order`
    ADD COLUMN `destinationCountry` VARCHAR(191) NOT NULL DEFAULT 'À confirmer',
    ADD COLUMN `receivingAuthority` VARCHAR(191) NULL,
    ADD COLUMN `purpose` TEXT NULL,
    ADD COLUMN `certificationNeeds` VARCHAR(191) NOT NULL DEFAULT 'UNSURE',
    ADD COLUMN `deliveryMethod` VARCHAR(191) NOT NULL DEFAULT 'DIGITAL',
    ADD COLUMN `deliveryAddress` TEXT NULL,
    ADD COLUMN `clientNotes` TEXT NULL,
    ADD COLUMN `legalHold` BOOLEAN NOT NULL DEFAULT false;

-- Existing development rows predate this intake field.
UPDATE `Order` SET `purpose` = 'À confirmer' WHERE `purpose` = '';
UPDATE `Order` SET `purpose` = 'À confirmer' WHERE `purpose` IS NULL;
ALTER TABLE `Order` MODIFY COLUMN `purpose` TEXT NOT NULL;
