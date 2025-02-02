/*
  Warnings:

  - The primary key for the `UserCafe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserCafe` table. All the data in the column will be lost.
  - Made the column `userUuid` on table `UserCafe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cafeId` on table `UserCafe` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `UserCafe` DROP FOREIGN KEY `UserCafe_cafeId_fkey`;

-- DropForeignKey
ALTER TABLE `UserCafe` DROP FOREIGN KEY `UserCafe_userUuid_fkey`;

-- DropIndex
DROP INDEX `UserCafe_cafeId_fkey` ON `UserCafe`;

-- DropIndex
DROP INDEX `UserCafe_userUuid_fkey` ON `UserCafe`;

-- AlterTable
ALTER TABLE `UserCafe` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    MODIFY `userUuid` VARCHAR(191) NOT NULL,
    MODIFY `cafeId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`userUuid`, `cafeId`);

-- AddForeignKey
ALTER TABLE `UserCafe` ADD CONSTRAINT `UserCafe_userUuid_fkey` FOREIGN KEY (`userUuid`) REFERENCES `User`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserCafe` ADD CONSTRAINT `UserCafe_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Cafe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
