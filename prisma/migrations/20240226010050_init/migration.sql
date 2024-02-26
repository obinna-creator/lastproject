/*
  Warnings:

  - You are about to drop the column `CaseDescription` on the `cases` table. All the data in the column will be lost.
  - You are about to drop the column `CaseStatus` on the `cases` table. All the data in the column will be lost.
  - Added the required column `Gender` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cases` DROP COLUMN `CaseDescription`,
    DROP COLUMN `CaseStatus`;

-- AlterTable
ALTER TABLE `clients` ADD COLUMN `Gender` VARCHAR(191) NOT NULL;
