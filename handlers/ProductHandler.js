import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

class ProductHandler {
  async addProductHandler(req, res) {
    try {
      // Validasi userId
      if (!req.params.userId) {
        throw { code: 428, message: "USER_ID_IS_REQUIRED" };
      }

      // Generate ID untuk house
      const id = `Product-${nanoid(12)}`;

      const { harga, luas_tanah, luas_bangunan, deskripsi, spesifikasi } = req.body;
      const jumlah_kamar_tidur = parseInt(req.body.jumlah_kamar_tidur); // Mengonversi nilai ke tipe Int
      const jumlah_kamar_mandi = parseInt(req.body.jumlah_kamar_mandi); // Mengonversi nilai ke tipe Int
      const files = req.files; // Ambil file upload dari request

      // Buat entri baru di tabel House
      const newselling = await prisma.house.create({
        data: {
          id: id,
          userId: req.params.userId,
          harga: harga,
          luas_tanah: luas_tanah,
          luas_bangunan: luas_bangunan,
          jumlah_kamar_tidur: jumlah_kamar_tidur,
          jumlah_kamar_mandi: jumlah_kamar_mandi,
          deskripsi: deskripsi,
          spesifikasi: spesifikasi,
        },
      });

      // Buat entri baru di tabel HousePicture untuk setiap file
      const pictureHousePromises = files.map((file) => {
        return prisma.housePicture.create({
          data: {
            id: `housePicture-${nanoid(8)}`,
            houseId: id,
            gambar_url: file.filename,
          },
        });
      });

      const pictureHouses = await Promise.all(pictureHousePromises);

      if (!newselling || !pictureHouses) {
        throw { code: 500, message: "ADD_SELLING_FAILED" };
      }

      // Return response sukses
      return res.status(200).json({
        status: true,
        message: "ADD_SELLING_SUCCESS",
        data_Selling: newselling,
        housePhotos: pictureHouses,
      });
    } catch (error) {
      // console.error(error);
      // Return response error
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async getProductHandlerByUserId(req, res) {
    try {
      if (!req.params.userId) {
        throw { code: 428, message: "ID_USER_IS_REQUIRED" };
      }
      const userId = req.params.userId;
      const products = await prisma.house.findMany({
        where: { userId: userId },
        include: {
          gambar: true,
        },
      });

      if (!products) {
        throw { code: 404, message: "PRODUCT_NOT_FOUND" };
      }
      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_PRODUCT",
        Products: products,
      });
    } catch (error) {
      console.error(error);
      // Return response error
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async getProductById(req, res) {
    try {
      const userId = req.params.userId;
      const productId = req.params.productId;
      if (!userId && !productId) {
        throw { code: 428, message: "ID_IS_REQUIRED" };
      }
      const product = await prisma.house.findUnique({
        where: { id: productId, userId: userId },
      });
      if (!product) {
        throw { code: 404, message: "PRODUCT_NOT_FOUND" };
      }
      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_PRODUCT",
        product: product,
      });
    } catch (error) {
      if (!error.code) {
        error.code = 500;
      }
      return res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

export default new ProductHandler();
