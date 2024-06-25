import { nanoid } from "nanoid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class sosmedHandler {
  async getSosmedById(req, res) {
    try {
      if (!req.params.sosmedId) {
        throw { code: 428, message: "ID_IS_REQUIRED" };
      }
      const sosmed = await prisma.socialMedia.findUnique({
        where: { id: req.params.sosmedId },
      });
      if (!sosmed) {
        throw { code: 404, message: "SOSMED_NOT_FOUND" };
      }
      return res.status(200).json({
        status: true,
        message: "GET_SOSMED_SUCCESS",
        sosmed: sosmed,
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
      const { facebook, twitter, instagram, linkedin, whatsApp, tiktok } = req.body;
      const updateSosmed = await prisma.socialMedia.update({
        where: { id: req.params.sosmedId },
        data: {
          facebook: facebook,
          twitter: twitter,
          instagram: instagram,
          linkedin: linkedin,
          whatsApp: whatsApp,
          tiktok: tiktok,
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
  async getSosmedByProfileId(req, res) {
    try {
      const profileId = req.params.profileId;
      if (!profileId) {
        throw { code: 428, message: "PROFILE_ID_IS_REQUIRED" };
      }

      const sosmed = await prisma.socialMedia.findUnique({
        where: { profileId: req.params.profileId },
      });

      return res.status(200).json({
        status: true,
        message: "GET_SOSMED_SUCCESS",
        sosmed: sosmed,
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

export default new sosmedHandler();
