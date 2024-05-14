-- CreateTable
CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "harga" TEXT,
    "tipe_rumah" TEXT,
    "luas_tanah" TEXT,
    "luas_bangunan" TEXT,
    "jumlah_kamar_tidur" INTEGER,
    "jumlah_kamar_mandi" INTEGER,
    "deskripsi" TEXT,
    "spesifikasi" TEXT,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HousePicture" (
    "id" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "gambar_url" TEXT NOT NULL,

    CONSTRAINT "HousePicture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HousePicture" ADD CONSTRAINT "HousePicture_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
