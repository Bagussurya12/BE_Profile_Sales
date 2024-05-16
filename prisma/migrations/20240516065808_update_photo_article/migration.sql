/*
  Warnings:

  - You are about to drop the column `photo` on the `Article` table. All the data in the column will be lost.
  - Added the required column `photos` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "photo",
ADD COLUMN     "photos" TEXT NOT NULL;
