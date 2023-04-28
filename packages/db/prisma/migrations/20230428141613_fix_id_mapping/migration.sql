/*
  Warnings:

  - The primary key for the `novel_language_scores` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "novel_language_scores" DROP CONSTRAINT "novel_language_scores_pkey",
ADD CONSTRAINT "novel_language_scores_pkey" PRIMARY KEY ("novelId", "language");
