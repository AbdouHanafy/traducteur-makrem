-- CreateTable
CREATE TABLE `SiteContent` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(5) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SiteContent_locale_idx`(`locale`),
    UNIQUE INDEX `SiteContent_key_locale_key`(`key`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
