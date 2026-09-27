-- Better Auth (replaces NextAuth v5) needs: User.name (required), User.emailVerified as
-- Boolean (was DateTime?), User.image, and its own Session/Account/Verification tables.
-- Existing rows are backfilled before constraints tighten, and passwordHash migrates
-- conceptually into Account.password (Better Auth's credential-provider row), created by
-- prisma/seed.ts via auth.api.signUpEmail rather than by this migration.

-- AlterTable: add new columns nullable first so existing rows don't violate NOT NULL.
ALTER TABLE `User`
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `emailVerifiedBool` BOOLEAN NULL;

-- Backfill from existing data.
UPDATE `User` SET `name` = TRIM(CONCAT(`firstName`, ' ', `lastName`));
UPDATE `User` SET `emailVerifiedBool` = (`emailVerified` IS NOT NULL);

-- Swap emailVerified to the boolean column, tighten NOT NULL now that both are backfilled.
ALTER TABLE `User` DROP COLUMN `emailVerified`;
ALTER TABLE `User` RENAME COLUMN `emailVerifiedBool` TO `emailVerified`;
ALTER TABLE `User`
    MODIFY COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false;

-- passwordHash is superseded by Account.password (Better Auth credential provider).
ALTER TABLE `User` DROP COLUMN `passwordHash`;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_token_key`(`token`),
    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` VARCHAR(191) NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Account_userId_idx`(`userId`),
    UNIQUE INDEX `Account_providerId_accountId_key`(`providerId`, `accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `Verification_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
