-- CreateTable
CREATE TABLE `HomeSection` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('HERO', 'STATS', 'SERVICES', 'WORKFLOW', 'STATEMENT', 'FINAL_CTA', 'CUSTOM') NOT NULL,
    `order` INTEGER NOT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `eyebrow` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `body` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `ctaLabel` VARCHAR(191) NULL,
    `ctaHref` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HomeSection_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
