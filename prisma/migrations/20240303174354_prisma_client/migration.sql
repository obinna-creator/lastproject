/*
  Warnings:

  - A unique constraint covering the columns `[BlogID]` on the table `blogpost` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `blogpost` DROP FOREIGN KEY `BlogPost_BlogID_fkey`;

-- CreateTable
CREATE TABLE `contact` (
    `ContactID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `PhoneNumber` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NOT NULL,
    `ClientID` INTEGER NOT NULL,
    `userUserID` INTEGER NULL,

    UNIQUE INDEX `contact_ContactID_key`(`ContactID`),
    PRIMARY KEY (`ContactID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `blogpost_BlogID_key` ON `blogpost`(`BlogID`);

-- AddForeignKey
ALTER TABLE `blogpost` ADD CONSTRAINT `blogpost_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `users`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_ClientID_fkey` FOREIGN KEY (`ClientID`) REFERENCES `clients`(`ClientID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact` ADD CONSTRAINT `contact_userUserID_fkey` FOREIGN KEY (`userUserID`) REFERENCES `users`(`UserID`) ON DELETE SET NULL ON UPDATE CASCADE;
