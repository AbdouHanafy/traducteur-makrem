-- AlterTable
ALTER TABLE `Article` MODIFY `coverImageUrl` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `HomeSection` MODIFY `imageUrl` VARCHAR(500) NULL,
    MODIFY `ctaHref` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `Partner` MODIFY `logoUrl` VARCHAR(500) NULL,
    MODIFY `websiteUrl` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `Service` MODIFY `imageUrl` VARCHAR(500) NULL;
