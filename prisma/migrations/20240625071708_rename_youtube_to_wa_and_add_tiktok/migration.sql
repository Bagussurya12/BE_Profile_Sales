/*
  Warnings:

  - You are about to drop the column `youtube` on the `SocialMedia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SocialMedia" DROP COLUMN "youtube",
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "whatsApp" TEXT;
