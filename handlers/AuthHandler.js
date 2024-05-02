import { PrismaClient } from "@prisma/client";
import { isEmailExist } from "../library/EmailExist.js";
import bcrypt from "bcrypt";
import JsonWebToken from "jsonwebtoken";
import dotenv from "dotenv";
import isEmailValid from "../library/isEmailValid.js";
import { nanoid } from "nanoid";
import { isnNickNameExist } from "../library/nickNameExist.js";

const env = dotenv.config().parsed;
const prisma = new PrismaClient();

const generateAccessToken = async (payload) => {
  return JsonWebToken.sign(payload, env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: env.JWT_ACCESS_TOKEN_LIFE });
};

const generateRefreshToken = async (payload) => {
  return JsonWebToken.sign(payload, env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: env.JWT_REFRESH_TOKEN_LIFE });
};

class AuthHandler {
  async register(req, res) {
    try {
      if (!req.body.name || !req.body.email || !req.body.password || !req.body.status || !req.body.level || req.body.nickName) {
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
          name: req.body.name,
          email: req.body.email,
          password: hash,
          status: req.body.status,
          level: req.body.level,
          nick_name: req.body.nickName,
        },
      });

      if (!user) {
        throw { code: 500, message: "USER_REGISTER_FAILED" };
      }

      const payload = { id: user.id };
      const accessToken = await generateAccessToken(payload);
      const refreshToken = await generateRefreshToken(payload);

      return res.status(200).json({
        status: true,
        message: "USER_REGISTER_SUCCESS",
        name: user.name,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error(error);
      return res.status(error.code || 500).json({ status: false, message: error.message });
    }
  }
  async login(req, res) {
    try {
      if (!req.body.email || !req.body.password) {
        throw { code: 428, message: "MISSING_REQUIRED_FIELDS" };
      }
      const user = await prisma.users.findFirst({
        where: {
          email: req.body.email,
        },
      });
      if (!user) {
        throw { code: 404, message: "USER_NOT_FOUND" };
      }
      const isPasswordValid = await bcrypt.compareSync(req.body.password, user.password);
      if (!isPasswordValid) {
        throw { code: 404, message: "PASSWORD_INVALID" };
      }
      let payload = { id: user.id };
      const accessToken = await generateAccessToken(payload);
      const refreshToken = await generateRefreshToken(payload);

      return res.status(200).json({
        status: true,
        message: "LOGIN_SUCCESS",
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return res.status(error.code || 500).json({
        status: false,
        message: error.message,
      });
    }
  }
  async refreshToken(req, res) {
    try {
      if (!req.body.refreshToken) {
        throw { code: 428, message: "REFRESH_TOKEN_IS_REQUIRED" };
      }
      const verify = await JsonWebToken.verify(req.body.refreshToken, env.JWT_REFRESH_TOKEN_SECRET);
      let payload = { id: verify.id, role: verify.role };
      const accessToken = await generateAccessToken(payload);
      const refreshToken = await generateRefreshToken(payload);

      return res.status(200).json({
        status: true,
        message: "REFRESH_TOKEN_SUCCESS",
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (!error.code) {
        error.code = 500;
      }
      if (error.message == "jwt expired") {
        error.message = "REFRESH_TOKEN_EXPIRED";
      } else if (error.message == "invalid signature" || error.message == "jwt malformed" || error.message == "jwt must be provided" || error.message == "invalid token") {
        error.message = "INVALID_REFRESH_TOKEN";
      }
      return res.status(error.code).json({
        status: false,
        message: error.message,
      });
    }
  }
}

export default new AuthHandler();
