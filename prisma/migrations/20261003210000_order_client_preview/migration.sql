-- AlterTable
ALTER TABLE `Order` ADD COLUMN `previewViewedAt` DATETIME(3) NULL,
    ADD COLUMN `revisionRequestedAt` DATETIME(3) NULL,
    ADD COLUMN `revisionNote` TEXT NULL;
