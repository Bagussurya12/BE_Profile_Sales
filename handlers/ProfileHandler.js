import { PrismaClient } from "@prisma/client";
import { parse, isValid } from "date-fns";

const prisma = new PrismaClient();

class ProfileHandler {
  async updateProfileHandler(req, res) {
    try {
      if (!req.params.userId) {
        throw { code: 400, message: "USER_ID_IS_REQUIRED" };
      }

      const { fullName, gender, address, bio, dateOfBirth } = req.body;

      if (!fullName || !gender || !address || !bio || !dateOfBirth) {
        throw { code: 428, message: "MISSING_REQUIRED_FIELDS" };
      }

      const profile = await prisma.profile.findUnique({
        where: { userId: req.params.userId },
      });

      if (!profile) {
        throw { code: 428, message: "PROFILE_NOT_FOUND" };
      }

      const files = req.files;

      let profilePhoto = null;
      if (files && files.length > 0) {
        profilePhoto = files[0].filename;
      }

      // Parse dateOfBirth from dd/MM/yyyy format
      const parsedDateOfBirth = parse(dateOfBirth, "dd/MM/yyyy", new Date());

      if (!isValid(parsedDateOfBirth)) {
        throw { code: 428, message: "INVALID_DATE_OF_BIRTH" };
      }

      const updatedProfile = await prisma.profile.update({
        where: { userId: req.params.userId },
        data: {
          fullName: fullName,
          gender: gender,
          address: address,
          dateOfBirth: parsedDateOfBirth.toISOString(), // Convert to ISO-8601
          profilePhoto: profilePhoto,
          bio: bio,
        },
      });

      res.status(200).json({
        status: true,
        message: "UPDATE_PROFILE_SUCCESS",
        profile: updatedProfile,
      });
    } catch (error) {
      console.log(error);
      if (!error.code) {
        error.code = 500;
      }
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  }
  async getProfileHandlerByUserId(req, res) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        throw { code: 428, message: "USER_ID_IS_REQUIRED" };
      }
      const profile = await prisma.profile.findUnique({
        where: { userId: userId },
      });
      if (!profile) {
        throw { code: 428, message: "PROFILE_NOT_FOUND" };
      }
      return res.status(200).json({
        status: true,
        message: "SUCCESS_GET_PROFILE",
        profile: profile,
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

export default new ProfileHandler();
