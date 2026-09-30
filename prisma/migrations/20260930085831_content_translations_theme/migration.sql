/*
  Warnings:

  - You are about to alter the column `logoUrl` on the `Partner` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.
  - You are about to alter the column `websiteUrl` on the `Partner` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Article` ADD COLUMN `translations` JSON NULL;

-- AlterTable
ALTER TABLE `FaqItem` ADD COLUMN `translations` JSON NULL;

-- AlterTable
ALTER TABLE `HomeSection` ADD COLUMN `translations` JSON NULL;

-- AlterTable
ALTER TABLE `Partner` MODIFY `logoUrl` VARCHAR(191) NULL,
    MODIFY `websiteUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `translations` JSON NULL;

-- AlterTable
ALTER TABLE `Testimonial` ADD COLUMN `translations` JSON NULL;

-- CreateTable
CREATE TABLE `SiteSetting` (
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ordre initial des services : alphabétique (comportement précédent), désormais modifiable.
SET @i := -1;
UPDATE `Service` SET `order` = (@i := @i + 1) ORDER BY `name`;
