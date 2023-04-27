/*
  Warnings:

  - You are about to drop the `_IllustToSearches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_NovelToSearches` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_IllustToSearches" DROP CONSTRAINT "_IllustToSearches_A_fkey";

-- DropForeignKey
ALTER TABLE "_IllustToSearches" DROP CONSTRAINT "_IllustToSearches_B_fkey";

-- DropForeignKey
ALTER TABLE "_NovelToSearches" DROP CONSTRAINT "_NovelToSearches_A_fkey";

-- DropForeignKey
ALTER TABLE "_NovelToSearches" DROP CONSTRAINT "_NovelToSearches_B_fkey";

-- AlterTable
CREATE SEQUENCE searches_id_seq;
ALTER TABLE "searches" ALTER COLUMN "id" SET DEFAULT nextval('searches_id_seq');
ALTER SEQUENCE searches_id_seq OWNED BY "searches"."id";

-- DropTable
DROP TABLE "_IllustToSearches";

-- DropTable
DROP TABLE "_NovelToSearches";

-- CreateTable
CREATE TABLE "_IllustToSearch" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_NovelToSearch" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_IllustToSearch_AB_unique" ON "_IllustToSearch"("A", "B");

-- CreateIndex
CREATE INDEX "_IllustToSearch_B_index" ON "_IllustToSearch"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_NovelToSearch_AB_unique" ON "_NovelToSearch"("A", "B");

-- CreateIndex
CREATE INDEX "_NovelToSearch_B_index" ON "_NovelToSearch"("B");

-- AddForeignKey
ALTER TABLE "_IllustToSearch" ADD CONSTRAINT "_IllustToSearch_A_fkey" FOREIGN KEY ("A") REFERENCES "illusts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IllustToSearch" ADD CONSTRAINT "_IllustToSearch_B_fkey" FOREIGN KEY ("B") REFERENCES "searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NovelToSearch" ADD CONSTRAINT "_NovelToSearch_A_fkey" FOREIGN KEY ("A") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NovelToSearch" ADD CONSTRAINT "_NovelToSearch_B_fkey" FOREIGN KEY ("B") REFERENCES "searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
