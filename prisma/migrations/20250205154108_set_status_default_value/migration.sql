/*
  Warnings:

  - Made the column `status` on table `UserCafe` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `UserCafe` MODIFY `status` ENUM('LIKE', 'DISLIKE') NOT NULL DEFAULT 'DISLIKE';
