/*
  Warnings:

  - You are about to drop the column `currency_pair` on the `Bookmark` table. All the data in the column will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Balance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,instrument]` on the table `Bookmark` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `instrument` to the `Bookmark` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Bookmark_user_id_currency_pair_key";

-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "currency_pair";
ALTER TABLE "Bookmark" ADD COLUMN     "instrument" STRING NOT NULL;

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "Balance";

-- DropTable
DROP TABLE "Transaction";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_user_id_instrument_key" ON "Bookmark"("user_id", "instrument");
