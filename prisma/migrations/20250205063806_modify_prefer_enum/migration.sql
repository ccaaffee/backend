/*
  Warnings:

  - You are about to alter the column `status` on the `UserCafe` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `UserCafe` MODIFY `status` ENUM('LIKE', 'DISLIKE') NULL;
