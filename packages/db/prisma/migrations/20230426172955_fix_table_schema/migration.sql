/*
  Warnings:

  - The primary key for the `illust_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `illust_images` table. All the data in the column will be lost.
  - Added the required column `illust_id` to the `illust_images` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `illust_images` DROP FOREIGN KEY `illust_images_id_fkey`;

-- AlterTable
ALTER TABLE `illust_images` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `illust_id` INTEGER NOT NULL,
    MODIFY `original_url` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`illust_id`, `page_id`);

-- AlterTable
ALTER TABLE `illust_series` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `illusts` MODIFY `caption` TEXT NULL;

-- AlterTable
ALTER TABLE `novel_series` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `novels` MODIFY `caption` TEXT NULL;

-- CreateIndex
CREATE INDEX `illust_images_illust_id_idx` ON `illust_images`(`illust_id`);

-- AddForeignKey
ALTER TABLE `illust_images` ADD CONSTRAINT `illust_images_illust_id_fkey` FOREIGN KEY (`illust_id`) REFERENCES `illusts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
