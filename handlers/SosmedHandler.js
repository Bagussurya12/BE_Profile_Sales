import { nanoid } from "nanoid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class sosmedHandler {
  async updateSosmedHandler(req, res) {
    try {
      if (!req.params.sosmedId) {
        throw { code: 428, message: "SOCIAL_MEDIA_NOT_FOUND" };
      }
      const sosmed = await prisma.socialMedia.findUnique({
        where: { id: req.params.sosmedId },
      });
      if (!sosmed) {
        throw { code: 428, message: "SOCIAL_MEDIA_NOT_FOUND" };
      }
      const updateSosmed = await prisma.socialMedia.update({
        where: { id: req.params.sosmedId },
        data: {
          facebook: facebook,
          twitter: twitter,
          instagram: instagram,
          linkedin: linkedin,
          youtube: youtube,
        },
      });
      res.status(200).json({
        status: true,
        message: "SOSMED_UPDATE_SUCCESS",
        sosmed: updateSosmed,
      });
    } catch (error) {
      if (!error.code) {
        error.code = 500;
      }
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  }
}

export default new sosmedHandler();
