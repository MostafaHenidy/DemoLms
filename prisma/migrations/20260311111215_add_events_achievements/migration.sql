-- CreateTable
CREATE TABLE `Event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titleAr` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NOT NULL,
    `timeLabelAr` VARCHAR(191) NOT NULL,
    `timeLabelEn` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Achievement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `titleAr` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NOT NULL,
    `descriptionAr` VARCHAR(191) NULL,
    `descriptionEn` VARCHAR(191) NULL,
    `targetCourses` INTEGER NULL,
    `targetCertificates` INTEGER NULL,
    `targetStreakDays` INTEGER NULL,

    UNIQUE INDEX `Achievement_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
