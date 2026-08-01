-- Email is optional at checkout; WhatsApp/phone remains required.
ALTER TABLE `Order`
  MODIFY `customerEmail` VARCHAR(191) NULL,
  ADD COLUMN `courierName` VARCHAR(191) NULL,
  ADD COLUMN `estimatedDelivery` DATETIME(3) NULL;
