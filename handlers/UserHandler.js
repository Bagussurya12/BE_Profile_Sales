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
      const users = await prisma.users.findMany({
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
      const { fullname, email, password, status, level, nickName } = req.body;

      if (!fullname || !email || !password || !status || !level || !nickName) {
        throw { code: 400, message: "MISSING_REQUIRED_FIELDS" };
      }

      if (!isEmailValid(email)) {
        throw { code: 409, message: "EMAIL_INVALID" };
      }

      if (password.length <= 7) {
        throw { code: 400, message: "PASSWORD_MINIMUM_8_CHARACTER" };
      }

      const emailExist = await isEmailExist(email);
      if (emailExist) {
        throw { code: 409, message: "EMAIL_ALREADY_EXIST" };
      }

      const nickNameExist = await isnNickNameExist(nickName);
      if (nickNameExist) {
        throw { code: 409, message: "NICK_NAME_ALREADY_EXIST" };
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const user = await prisma.users.create({
        data: {
          id: nanoid(12),
          fullname: fullname,
          email: email,
          password: hash,
          status: status,
          level: level,
          nick_name: nickName,
        },
      });

      if (!user) {
        throw { code: 500, message: "ADD_USER_FAILED" };
      }

      return res.status(200).json({
        status: true,
        message: "ADD_USER_SUCCESS",
        user: user,
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
      if (!password) {
        throw { code: 428, message: "PASSWORD_IS_REQUIRED" };
      }
      if (!level) {
        throw { code: 428, message: "LEVEL_IS_REQUIRED" };
      }

      const user = await prisma.users.findUnique({
        where: { id: req.params.userId },
      });

      if (!user) {
        throw { code: 404, message: "USER_NOT_FOUND" };
      }

      let emailExists = false;
      let nickNameExists = false;

      // Jika email baru tidak sama dengan yang lama, periksa keberadaannya
      if (email !== user.email) {
        emailExists = await isEmailExist(email);
        if (emailExists) {
          throw { code: 409, message: "EMAIL_EXIST" };
        }
      }

      // Jika nickname baru tidak sama dengan yang lama, periksa keberadaannya
      if (nickName !== user.nick_name) {
        nickNameExists = await isNickNameExist(nickName);
        if (nickNameExists) {
          throw { code: 409, message: "NICK_NAME_EXIST" };
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const updatedUser = await prisma.users.update({
        where: { id: req.params.userId },
        data: {
          fullname: fullname,
          email: email,
          password: hash,
          nick_name: nickName,
          level: level,
        },
      });

      res.status(200).json({
        status: true,
        message: "USER_UPDATE_SUCCESS",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.code || 500).json({
        status: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

export default new UserHandler();
