-- CreateTable
CREATE TABLE "novel_language_scores" (
    "novelId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novel_language_scores_pkey" PRIMARY KEY ("novelId")
);

-- CreateIndex
CREATE INDEX "novel_language_scores_novelId_idx" ON "novel_language_scores"("novelId");

-- AddForeignKey
ALTER TABLE "novel_language_scores" ADD CONSTRAINT "novel_language_scores_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "novels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
