import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { isEmailExist, isEmailExistWithUserId } from "../library/EmailExist.js";
import { isnNickNameExist } from "../library/nickNameExist.js";
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
      if (!users) {
        throw { code: 404 || 500, message: "USERS_NOT_FOUND || GET_USER_FAILED" };
      }

      return res.status(200).json({
        status: true,
        total: users.length,
        users,
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
  async addUserHandler(req, res) {
    try {
      if (!req.body.fullname || !req.body.email || !req.body.password || !req.body.status || !req.body.level || !req.body.nickName) {
        throw { code: 400, message: "MISSING_REQUIRED_FIELDS" };
      }

      if (!isEmailValid(req.body.email)) {
        throw { code: 409, message: "EMAIL_INVALID" };
      }

      if (req.body.password.length <= 7) {
        throw { code: 400, message: "PASSWORD_MINIMUM_8_CHARACTER" };
      }

      const emailExist = await isEmailExist(req.body.email);
      if (emailExist) {
        throw { code: 409, message: "EMAIL_ALREADY_EXIST" };
      }
      const nickNameExist = await isnNickNameExist(req.body.nickName);
      if (nickNameExist) {
        throw { code: 409, message: "NICK_NAME_ALREADY_EXIST" };
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const id = `User-${nanoid(12)}`;

      const user = await prisma.users.create({
        data: {
          id: id,
          fullname: req.body.fullname,
          email: req.body.email,
          password: hash,
          status: req.body.status,
          level: req.body.level,
          nick_name: req.body.nickName,
        },
      });

      if (!user) {
        throw { code: 500, message: "ADD_USER_FAILED" };
      }

      const payload = { id: user.id };

      return res.status(200).json({
        status: true,
        message: "ADD_USER_SUCCESS",
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
}

export default new UserHandler();
