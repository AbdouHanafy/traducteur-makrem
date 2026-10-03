-- Store the provider checkout URL so a pending payment can be resumed safely.
-- activeKey is nullable because MySQL permits multiple NULL values in a UNIQUE index;
-- this gives us one active attempt per order/phase/provider while retaining terminal history.
ALTER TABLE `Payment`
    ADD COLUMN `checkoutUrl` VARCHAR(1000) NULL,
    ADD COLUMN `activeKey` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Payment_activeKey_key` ON `Payment`(`activeKey`);
