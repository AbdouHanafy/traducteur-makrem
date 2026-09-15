-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `role` ENUM('CLIENT', 'TRANSLATOR', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `pricePerPage` DECIMAL(10, 3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Service_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PricingRule` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `multiplier` DECIMAL(6, 3) NULL,
    `flatFee` DECIMAL(10, 3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `PricingRule_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `sourceLang` VARCHAR(191) NOT NULL,
    `targetLang` VARCHAR(191) NOT NULL,
    `pages` INTEGER NOT NULL,
    `delayKey` VARCHAR(191) NOT NULL,
    `status` ENUM('DEMANDE', 'DEVIS_A_VALIDER', 'EN_ATTENTE_ACOMPTE', 'ACOMPTE_PAYE', 'EN_TRADUCTION', 'TRADUCTION_TERMINEE', 'FICHIER_EN_ATTENTE_DE_SOLDE', 'SOLDE_PAYE', 'TELECHARGEABLE', 'TERMINEE', 'ANNULEE') NOT NULL DEFAULT 'DEMANDE',
    `totalAmount` DECIMAL(10, 3) NOT NULL,
    `advanceAmount` DECIMAL(10, 3) NOT NULL,
    `balanceAmount` DECIMAL(10, 3) NOT NULL,
    `advancePaid` BOOLEAN NOT NULL DEFAULT false,
    `balancePaid` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_reference_key`(`reference`),
    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `status` ENUM('DEMANDE', 'DEVIS_A_VALIDER', 'EN_ATTENTE_ACOMPTE', 'ACOMPTE_PAYE', 'EN_TRADUCTION', 'TRADUCTION_TERMINEE', 'FICHIER_EN_ATTENTE_DE_SOLDE', 'SOLDE_PAYE', 'TELECHARGEABLE', 'TERMINEE', 'ANNULEE') NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusHistory_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `kind` ENUM('SOURCE', 'TRANSLATED') NOT NULL,
    `status` ENUM('UPLOADED', 'SCANNING', 'READY', 'REJECTED') NOT NULL DEFAULT 'UPLOADED',
    `storageKey` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `sha256` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Document_storageKey_key`(`storageKey`),
    INDEX `Document_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `phase` ENUM('ADVANCE', 'BALANCE') NOT NULL,
    `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(10, 3) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TND',
    `provider` VARCHAR(191) NOT NULL,
    `providerRef` VARCHAR(191) NOT NULL,
    `rawPayload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `confirmedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Payment_providerRef_key`(`providerRef`),
    INDEX `Payment_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_actorId_idx`(`actorId`),
    INDEX `AuditLog_resource_idx`(`resource`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusHistory` ADD CONSTRAINT `OrderStatusHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
