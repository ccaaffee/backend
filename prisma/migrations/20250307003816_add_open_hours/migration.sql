-- CreateTable
CREATE TABLE `OpenHours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monday` VARCHAR(191) NULL,
    `tuesday` VARCHAR(191) NULL,
    `wednesday` VARCHAR(191) NULL,
    `thursday` VARCHAR(191) NULL,
    `friday` VARCHAR(191) NULL,
    `saturday` VARCHAR(191) NULL,
    `sunday` VARCHAR(191) NULL,
    `cafeId` INTEGER NOT NULL,

    UNIQUE INDEX `OpenHours_cafeId_key`(`cafeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OpenHours` ADD CONSTRAINT `OpenHours_cafeId_fkey` FOREIGN KEY (`cafeId`) REFERENCES `Cafe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
