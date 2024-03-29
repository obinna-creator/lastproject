-- CreateTable
CREATE TABLE `BlogPost` (
    `BlogID` INTEGER NOT NULL AUTO_INCREMENT,
    `BlogPost` VARCHAR(191) NOT NULL,
    `FilePath` VARCHAR(191) NOT NULL,
    `Upload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UserID` INTEGER NOT NULL,

    PRIMARY KEY (`BlogID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_BlogID_fkey` FOREIGN KEY (`BlogID`) REFERENCES `users`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;
