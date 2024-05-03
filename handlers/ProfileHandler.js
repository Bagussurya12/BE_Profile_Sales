import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ProfileHandler {
  async updateProfileHandler(req, res) {
    try {
      //   if (!req.params.nickName) {
      //     throw { code: 400, message: "NICK_NAME_IS_REQUIRED" };
      //   }
      if (!req.params.userId) {
        throw { code: 400, message: "NICK_NAME_IS_REQUIRED" };
      }
      const { fullName, dateOfBirth, gender, address, profilePhoto, bio } = req.body;

      if (!fullName || !dateOfBirth || !gender || !address || !profilePhoto || !bio) {
        throw { code: 428, message: "MISSING_REQUIRED_FIELDS" };
      }
      const profile = prisma.profile.findUnique({
        where: { id: req.params.userId },
      });
      if (!profile) {
        throw { code: 428, message: "PROFILE_NOT_FOUND" };
      }
      const updateProfile = await prisma.profile.update({
        where: { id: req.params.userId },
        data: {
          fullName: fullName,
          dateOfBirth: dateOfBirth,
          gender: gender,
          address: address,
          profilePhoto: profilePhoto,
          bio: bio,
        },
      });
      res.status.json({
        status: true,
        message: "UPDATE_PROFILE_SUCCESS",
        profile: updateProfile,
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
