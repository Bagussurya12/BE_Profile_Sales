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
      const { fullname, email, password, level, nick_name, division } = req.body;

      if (!fullname || !email || !password || !level || !nick_name) {
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

      const nickNameExist = await isNickNameExist(nick_name);
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
          nick_name: nick_name,
          division: division,
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

      const { fullname, email, nick_name, password, level, division } = req.body;

      if (!fullname || !email || !nick_name || !level || !division) {
        throw { code: 428, message: "MISSING_REQUIRED_FIELDS" };
      }

      const user = await prisma.user.findUnique({
        where: { id: req.params.userId },
      });

      if (!user) {
        throw { code: 404, message: "USER_NOT_FOUND" };
      }

      if (email !== user.email) {
        const emailExists = await isEmailExist(email);
        if (emailExists) {
          throw { code: 409, message: "EMAIL_ALREADY_EXIST" };
        }
      }

      if (nick_name !== user.nick_name) {
        const nickNameExists = await isNickNameExist(nick_name);
        if (nickNameExists) {
          throw { code: 409, message: "NICK_NAME_ALREADY_EXIST" };
        }
      }

      const dataToUpdate = {
        fullname,
        email,
        nick_name,
        level,
        division,
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
        message: error.message || "Internal Server Error",
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

      return res.status(200).json({
        status: true,
        message: "GET_USER_SUCCESS",
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

  async getUserByNickName(req, res) {
    try {
      if (!req.params.nick_name) {
        throw { code: 428, message: "NICK_NAME_IS_REQUIRED" };
      }

      const user = await prisma.user.findUnique({
        where: { nick_name: req.params.nick_name },
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

      const userData = {
        fullName: user.profile?.fullName,
        photos: user.profile?.profilePhoto,
        bio: user.profile?.bio,
        division: user.division,
        socialMedia: user.profile?.socialMedia,
      };

      return res.status(200).json({
        status: true,
        user: userData,
      });
    } catch (error) {
      if (!error.code) {
        error.code = 500;
      }
      console.log(error);
      return res.status(error.code).json({
        status: false,
        message: error.message,
      });
    }
  }

  async deleteUserById(req, res) {
    try {
      if (!req.params.userId) {
        throw { code: 428, message: "ID_IS_REQUIRED" };
      }
      const userId = req.params.userId;

      await prisma.profile.deleteMany({
        where: { userId: userId },
      });

      const user = await prisma.user.delete({
        where: { id: userId },
      });

      if (!user) {
        throw { code: 500, message: "DELETE_USER_FAILED" };
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
