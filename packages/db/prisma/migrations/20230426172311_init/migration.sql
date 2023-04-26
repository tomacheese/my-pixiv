-- CreateTable
CREATE TABLE `illusts` (
    `id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `type` ENUM('ILLUST', 'MANGA') NOT NULL,
    `caption` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `page_count` INTEGER NOT NULL,
    `series_id` INTEGER NULL,
    `ai_type` ENUM('UNUSED', 'SUPPORT', 'USED') NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `total_bookmarks` INTEGER NOT NULL DEFAULT 0,
    `total_comments` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `illusts_id_user_id_series_id_idx`(`id`, `user_id`, `series_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `illust_series` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `illust_series_id_user_id_idx`(`id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `illust_bookmarks` (
    `id` INTEGER NOT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `illust_bookmarks_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `illust_images` (
    `id` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `page_id` INTEGER NOT NULL,
    `square_medium_url` VARCHAR(191) NOT NULL,
    `medium_url` VARCHAR(191) NOT NULL,
    `large_url` VARCHAR(191) NOT NULL,
    `original_url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `illust_images_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `novels` (
    `id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `page_count` INTEGER NOT NULL,
    `text_length` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `series_id` INTEGER NULL,
    `ai_type` ENUM('UNUSED', 'SUPPORT', 'USED') NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `total_bookmarks` INTEGER NOT NULL DEFAULT 0,
    `total_comments` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `novels_id_user_id_series_id_idx`(`id`, `user_id`, `series_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `novel_images` (
    `novelId` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `square_medium_url` VARCHAR(191) NOT NULL,
    `medium_url` VARCHAR(191) NOT NULL,
    `large_url` VARCHAR(191) NOT NULL,
    `original_url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `novel_images_novelId_idx`(`novelId`),
    PRIMARY KEY (`novelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `novel_series` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `novel_series_id_user_id_idx`(`id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `novel_bookmarks` (
    `novelId` INTEGER NOT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `novel_bookmarks_novelId_idx`(`novelId`),
    PRIMARY KEY (`novelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `name` VARCHAR(191) NOT NULL,
    `translated_name` VARCHAR(191) NULL,

    INDEX `tags_name_idx`(`name`),
    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `account` VARCHAR(191) NOT NULL,
    `twitter_id` INTEGER NULL,
    `profile_image_url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `users_id_name_account_twitter_id_idx`(`id`, `name`, `account`, `twitter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tweets` (
    `id` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `twitter_users` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `screen_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `twitter_media` (
    `id` INTEGER NOT NULL,
    `tweet_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `twitter_media_id_tweet_id_idx`(`id`, `tweet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `illust_laters` (
    `illustId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `illust_laters_illustId_idx`(`illustId`),
    PRIMARY KEY (`illustId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `novel_laters` (
    `novelId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `novel_laters_novelId_idx`(`novelId`),
    PRIMARY KEY (`novelId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `settings_key_idx`(`key`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_IllustToTag` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_IllustToTag_AB_unique`(`A`, `B`),
    INDEX `_IllustToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_NovelToTag` (
    `A` INTEGER NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_NovelToTag_AB_unique`(`A`, `B`),
    INDEX `_NovelToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `illusts` ADD CONSTRAINT `illusts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `illusts` ADD CONSTRAINT `illusts_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `illust_series`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `illust_series` ADD CONSTRAINT `illust_series_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `illust_bookmarks` ADD CONSTRAINT `illust_bookmarks_id_fkey` FOREIGN KEY (`id`) REFERENCES `illusts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `illust_images` ADD CONSTRAINT `illust_images_id_fkey` FOREIGN KEY (`id`) REFERENCES `illusts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novels` ADD CONSTRAINT `novels_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novels` ADD CONSTRAINT `novels_series_id_fkey` FOREIGN KEY (`series_id`) REFERENCES `novel_series`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel_images` ADD CONSTRAINT `novel_images_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel_series` ADD CONSTRAINT `novel_series_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel_bookmarks` ADD CONSTRAINT `novel_bookmarks_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_twitter_id_fkey` FOREIGN KEY (`twitter_id`) REFERENCES `twitter_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tweets` ADD CONSTRAINT `tweets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `twitter_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `twitter_media` ADD CONSTRAINT `twitter_media_tweet_id_fkey` FOREIGN KEY (`tweet_id`) REFERENCES `tweets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `illust_laters` ADD CONSTRAINT `illust_laters_illustId_fkey` FOREIGN KEY (`illustId`) REFERENCES `illusts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `novel_laters` ADD CONSTRAINT `novel_laters_novelId_fkey` FOREIGN KEY (`novelId`) REFERENCES `novels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_IllustToTag` ADD CONSTRAINT `_IllustToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `illusts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_IllustToTag` ADD CONSTRAINT `_IllustToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NovelToTag` ADD CONSTRAINT `_NovelToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `novels`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_NovelToTag` ADD CONSTRAINT `_NovelToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;
