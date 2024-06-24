import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { isEmailExist } from "../library/EmailExist.js";
import { isNickNameExist } from "../library/nickNameExist.js";
import isEmailValid from "../library/isEmailValid.js";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

class UserHandler {
  async getAllUserHandler(req, res) {
    try {
      const { page = 1, perPage = 10 } = req.query;
      const skip = (page - 1) * perPage;
      const users = await prisma.user.findMany({
        skip: skip,
        take: perPage,
      });
      if (!users || users.length === 0) {
        throw { code: 404, message: "USERS_NOT_FOUND" };
      }

      return res.status(200).json({
        status: true,
        total: users.length,
        users,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async addUserHandler(req, res) {
    try {
      const { fullname, email, password, level, nickName } = req.body;

      if (!fullname || !email || !password || !level || !nickName) {
        throw { code: 400, message: "MISSING_REQUIRED_FIELDS" };
      }

      if (!isEmailValid(email)) {
        throw { code: 409, message: "EMAIL_INVALID" };
      }

      if (password.length < 7) {
        throw { code: 400, message: "PASSWORD_MINIMUM_8_CHARACTER" };
      }

      const emailExist = await isEmailExist(email);
      if (emailExist) {
        throw { code: 409, message: "EMAIL_ALREADY_EXIST" };
      }

      const nickNameExist = await isNickNameExist(nickName);
      if (nickNameExist) {
        throw { code: 409, message: "NICK_NAME_ALREADY_EXIST" };
      }

      const id = `User-${nanoid(12)}`;
      const profileId = `UserProfile-${nanoid(8)}`;
      const sosMedId = `sosmed-${nanoid(8)}`;

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const defaultPhoto = `default.png`;

      const user = await prisma.user.create({
        data: {
          id: id,
          fullname: fullname,
          email: email,
          password: hash,
          status: "active",
          level: level,
          nick_name: nickName,
          profile: {
            create: {
              id: profileId,
              fullName: fullname,
              profilePhoto: defaultPhoto,
              socialMedia: {
                create: {
                  id: sosMedId,
                },
              },
            },
          },
        },
        include: {
          profile: {
            include: {
              socialMedia: true,
            },
          },
        },
      });

      if (!user) {
        throw { code: 500, message: "ADD_USER_FAILED" };
      }

      return res.status(200).json({
        status: true,
        message: "ADD_USER_SUCCESS",
        user: user,
        name: user.fullname,
        userId: user.id,
        profileId: profileId,
        sosmedId: sosMedId,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUserHandler(req, res) {
    try {
      if (!req.params.userId) {
        throw { code: 428, message: "USER_ID_IS_REQUIRED" };
      }
      const { fullname, email, nickName, password, level } = req.body;

      if (!fullname) {
        throw { code: 428, message: "FULLNAME_IS_REQUIRED" };
      }
      if (!email) {
        throw { code: 428, message: "EMAIL_IS_REQUIRED" };
      }
      if (!nickName) {
        throw { code: 428, message: "NICK_NAME_IS_REQUIRED" };
      }
      if (!level) {
        throw { code: 428, message: "LEVEL_IS_REQUIRED" };
      }

      const user = await prisma.user.findUnique({
        where: { id: req.params.userId },
      });

      if (!user) {
        throw { code: 404, message: "USER_NOT_FOUND" };
      }

      let emailExists = false;
      let nickNameExists = false;

      if (email !== user.email) {
        emailExists = await isEmailExist(email);
        if (emailExists) {
          throw { code: 409, message: "EMAIL_EXIST" };
        }
      }

      if (nickName !== user.nick_name) {
        nickNameExists = await isNickNameExist(nickName);
        if (nickNameExists) {
          throw { code: 409, message: "NICK_NAME_EXIST" };
        }
      }

      const dataToUpdate = {
        fullname,
        email,
        nick_name: nickName,
        level,
      };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        dataToUpdate.password = hash;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.params.userId },
        data: dataToUpdate,
      });

      res.status(200).json({
        status: true,
        message: "USER_UPDATE_SUCCESS",
        user: updatedUser,
      });
    } catch (error) {
      if (!error.code) {
        error.code = 500;
      }
      console.log(error);
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "INTERNAL_SERVER_ERROR",
      });
    }
  }

  async getUserById(req, res) {
    try {
      if (!req.params.userId) {
        throw { code: 428, message: "ID_IS_REQUIRED" };
      }
      const user = await prisma.user.findUnique({
        where: { id: req.params.userId },
      });
      if (!user) {
        throw { code: 404, message: "USER_NOT_FOUND" };
      }
      return res.status(200).json({
        status: true,
        message: "GET_USER_SUCCESS",
        user: user,
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
  async getUserByNickName(req, res) {
    try {
      if (!req.params.nickName) {
        throw { code: 428, message: "ID_IS_REQUIRED" };
      }

      const user = await prisma.user.findUnique({
        where: { nick_name: req.params.nickName },
        include: {
          profile: {
            include: {
              socialMedia: true,
            },
          },
        },
      });

      if (!user) {
        throw { code: 404, message: "USER_NOT_FOUND" };
      }

      // Menyusun data yang diperlukan
      const userData = {
        fullName: user.profile?.fullName,
        photos: user.profile?.profilePhoto,
        bio: user.profile?.bio,
        socialMedia: user.profile?.socialMedia,
      };

      return res.status(200).json({
        status: true,
        user: userData,
      });
    } catch (error) {
      console.log(error);
      if (!error.code) {
        error.code = 500;
      }
      return res.status(error.code).json({
        status: false,
        message: error.message,
      });
    }
  }

  async deleteUserById(req, res) {
    try {
      if (!req.params.userId) {
        throw { code: 428, message: ID_IS_REQUIRED };
      }
      const userId = req.params.userId;

      // Hapus profil pengguna terlebih dahulu
      await prisma.profile.deleteMany({
        where: { userId: userId },
      });

      // Setelah menghapus profil, baru hapus pengguna
      const user = await prisma.user.delete({
        where: { id: userId },
      });

      if (!user) {
        throw { code: 500, message: DELETE_USER_FAILED };
      }

      return res.status(200).json({
        status: true,
        message: "SUCCESS_DELETE_USER",
        user,
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

export default new UserHandler();
