import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { isEmailExist, isEmailExistWithUserId } from "../library/EmailExist.js";
import { isnNickNameExist } from "../library/nickNameExist.js";
import isEmailValid from "../library/isEmailValid.js";

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
}

export default new UserHandler();
