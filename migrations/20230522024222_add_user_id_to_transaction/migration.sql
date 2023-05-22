/*
  Warnings:

  - Added the required column `user_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "user_id" STRING NOT NULL;
