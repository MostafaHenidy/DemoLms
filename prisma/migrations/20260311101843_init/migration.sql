-- CreateTable
CREATE TABLE `Course` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `titleAr` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NOT NULL,
    `instructorAr` VARCHAR(191) NOT NULL,
    `instructorEn` VARCHAR(191) NOT NULL,
    `rating` DOUBLE NOT NULL,
    `students` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `originalPrice` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `hours` INTEGER NOT NULL,
    `lessons` INTEGER NOT NULL,
    `sections` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Course_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
