import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();
class SellingHandler {
  async addSellingHandler(req, res) {
    try {
    } catch (error) {}
  }
  async contohHandler(req, res) {
    try {
      if (!req.params.userId) {
        throw { code: 428, message: "USER_ID_IS_REQUIRED" };
      }
      const id = `Salling-${nanoid(12)}`;
      const { harga, luas_tanah, luas_bangunan, jumlah_kamar_tidur, jumlah_kamar_mandi, deskripsi, spesifikasi } = req.body;
      const idRumah = `housePicture-${nanoid(8)}`;
      const { gambarUrl } = req.file.filename;
      const newselling = await prisma.house.create({
        data: {
          id: id,
          harga: harga,
          luas_tanah: luas_tanah,
          luas_bangunan: luas_bangunan,
          jumlah_kamar_mandi: jumlah_kamar_mandi,
          jumlah_kamar_tidur: jumlah_kamar_tidur,
          deskripsi: deskripsi,
          spesifikasi: spesifikasi,
        },
      });

      const pictureHouse = await prisma.housePicture.create({
        id: idRumah,
        houseId: id,
        gambar_url: gambarUrl,
      });

      if (!newselling || !pictureHouse) {
        throw { code: 500, message: "ADD_SELLING_FAILED" };
      }
      return res.status(200).json({
        status: true,
        message: "ADD_SELLING_SUCCESS",
        data_Selling: newselling,
        housePhoto: pictureHouse,
      });
    } catch (error) {}
  }
}

export default new SellingHandler();
