-- CreateEnum
CREATE TYPE "IllustType" AS ENUM ('ILLUST', 'MANGA', 'UGOIRA');

-- CreateEnum
CREATE TYPE "AiType" AS ENUM ('UNUSED', 'SUPPORT', 'USED');

-- CreateEnum
CREATE TYPE "SearchTarget" AS ENUM ('ILLUST', 'MANGA', 'NOVEL');

-- CreateTable
CREATE TABLE "illusts" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" "IllustType" NOT NULL,
    "caption" TEXT,
    "user_id" INTEGER NOT NULL,
    "page_count" INTEGER NOT NULL,
    "series_id" INTEGER,
    "ai_type" "AiType" NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "total_bookmarks" INTEGER NOT NULL DEFAULT 0,
    "total_comments" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "illusts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "illust_series" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "illust_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "illust_bookmarks" (
    "id" INTEGER NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "illust_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "illust_images" (
    "illust_id" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "page_id" INTEGER NOT NULL,
    "square_medium_url" TEXT NOT NULL,
    "medium_url" TEXT NOT NULL,
    "large_url" TEXT NOT NULL,
    "original_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "illust_images_pkey" PRIMARY KEY ("illust_id","page_id")
);

-- CreateTable
CREATE TABLE "illust_laters" (
    "illustId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "illust_laters_pkey" PRIMARY KEY ("illustId")
);

-- CreateTable
CREATE TABLE "novels" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "page_count" INTEGER NOT NULL,
    "text_length" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "series_id" INTEGER,
    "ai_type" "AiType" NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "total_bookmarks" INTEGER NOT NULL DEFAULT 0,
    "total_comments" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novel_images" (
    "novelId" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "square_medium_url" TEXT NOT NULL,
    "medium_url" TEXT NOT NULL,
    "large_url" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novel_images_pkey" PRIMARY KEY ("novelId")
);

-- CreateTable
CREATE TABLE "novel_series" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novel_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novel_bookmarks" (
    "novelId" INTEGER NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novel_bookmarks_pkey" PRIMARY KEY ("novelId")
);

-- CreateTable
CREATE TABLE "novel_laters" (
    "novelId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novel_laters_pkey" PRIMARY KEY ("novelId")
);

-- CreateTable
CREATE TABLE "searches" (
    "id" INTEGER NOT NULL,
    "include_tags" TEXT[],
    "exclude_tags" TEXT[],
    "target" "SearchTarget" NOT NULL,
    "min_likes" INTEGER,
    "limit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "name" TEXT NOT NULL,
    "translated_name" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "twitter_id" INTEGER,
    "profile_image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tweets" (
    "id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tweets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twitter_users" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "screen_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twitter_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "twitter_media" (
    "id" INTEGER NOT NULL,
    "tweet_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twitter_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "_IllustToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_IllustToSearches" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_NovelToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_NovelToSearches" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "illusts_id_user_id_series_id_idx" ON "illusts"("id", "user_id", "series_id");

-- CreateIndex
CREATE INDEX "illust_series_id_user_id_idx" ON "illust_series"("id", "user_id");

-- CreateIndex
CREATE INDEX "illust_bookmarks_id_idx" ON "illust_bookmarks"("id");

-- CreateIndex
CREATE INDEX "illust_images_illust_id_idx" ON "illust_images"("illust_id");

-- CreateIndex
CREATE INDEX "illust_laters_illustId_idx" ON "illust_laters"("illustId");

-- CreateIndex
CREATE INDEX "novels_id_user_id_series_id_idx" ON "novels"("id", "user_id", "series_id");

-- CreateIndex
CREATE INDEX "novel_images_novelId_idx" ON "novel_images"("novelId");

-- CreateIndex
CREATE INDEX "novel_series_id_user_id_idx" ON "novel_series"("id", "user_id");

-- CreateIndex
CREATE INDEX "novel_bookmarks_novelId_idx" ON "novel_bookmarks"("novelId");

-- CreateIndex
CREATE INDEX "novel_laters_novelId_idx" ON "novel_laters"("novelId");

-- CreateIndex
CREATE INDEX "searches_id_idx" ON "searches"("id");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "users_id_name_account_twitter_id_idx" ON "users"("id", "name", "account", "twitter_id");

-- CreateIndex
CREATE INDEX "twitter_media_id_tweet_id_idx" ON "twitter_media"("id", "tweet_id");

-- CreateIndex
CREATE INDEX "settings_key_idx" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "_IllustToTag_AB_unique" ON "_IllustToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_IllustToTag_B_index" ON "_IllustToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_IllustToSearches_AB_unique" ON "_IllustToSearches"("A", "B");

-- CreateIndex
CREATE INDEX "_IllustToSearches_B_index" ON "_IllustToSearches"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NovelToTag_AB_unique" ON "_NovelToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_NovelToTag_B_index" ON "_NovelToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NovelToSearches_AB_unique" ON "_NovelToSearches"("A", "B");

-- CreateIndex
CREATE INDEX "_NovelToSearches_B_index" ON "_NovelToSearches"("B");

-- AddForeignKey
ALTER TABLE "illusts" ADD CONSTRAINT "illusts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "illusts" ADD CONSTRAINT "illusts_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "illust_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "illust_series" ADD CONSTRAINT "illust_series_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "illust_bookmarks" ADD CONSTRAINT "illust_bookmarks_id_fkey" FOREIGN KEY ("id") REFERENCES "illusts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "illust_images" ADD CONSTRAINT "illust_images_illust_id_fkey" FOREIGN KEY ("illust_id") REFERENCES "illusts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "illust_laters" ADD CONSTRAINT "illust_laters_illustId_fkey" FOREIGN KEY ("illustId") REFERENCES "illusts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novels" ADD CONSTRAINT "novels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novels" ADD CONSTRAINT "novels_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "novel_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_images" ADD CONSTRAINT "novel_images_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "novels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_series" ADD CONSTRAINT "novel_series_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_bookmarks" ADD CONSTRAINT "novel_bookmarks_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "novels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_laters" ADD CONSTRAINT "novel_laters_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "novels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_twitter_id_fkey" FOREIGN KEY ("twitter_id") REFERENCES "twitter_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "twitter_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "twitter_media" ADD CONSTRAINT "twitter_media_tweet_id_fkey" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IllustToTag" ADD CONSTRAINT "_IllustToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "illusts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IllustToTag" ADD CONSTRAINT "_IllustToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IllustToSearches" ADD CONSTRAINT "_IllustToSearches_A_fkey" FOREIGN KEY ("A") REFERENCES "illusts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IllustToSearches" ADD CONSTRAINT "_IllustToSearches_B_fkey" FOREIGN KEY ("B") REFERENCES "searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NovelToTag" ADD CONSTRAINT "_NovelToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NovelToTag" ADD CONSTRAINT "_NovelToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NovelToSearches" ADD CONSTRAINT "_NovelToSearches_A_fkey" FOREIGN KEY ("A") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NovelToSearches" ADD CONSTRAINT "_NovelToSearches_B_fkey" FOREIGN KEY ("B") REFERENCES "searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
