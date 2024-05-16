/*
  Warnings:

  - Added the required column `photo` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "photo" TEXT NOT NULL;
