-- CreateTable
CREATE TABLE "Bookmark" (
    "user_id" STRING NOT NULL,
    "currency_pair" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_user_id_currency_pair_key" ON "Bookmark"("user_id", "currency_pair");
