import { PrismaClient } from "@prisma/client";
import { isEmailExist } from "../library/EmailExist.js";
import bcrypt from "bcrypt";
import JsonWebToken from "jsonwebtoken";
import dotenv from "dotenv";
import isEmailValid from "../library/isEmailValid.js";
import { nanoid } from "nanoid";
import { isNickNameExist } from "../library/nickNameExist.js";

const env = dotenv.config().parsed;
const prisma = new PrismaClient();

const generateAccessToken = (payload) => {
  return JsonWebToken.sign(payload, env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: env.JWT_ACCESS_TOKEN_LIFE });
};

const generateRefreshToken = (payload) => {
  return JsonWebToken.sign(payload, env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: env.JWT_REFRESH_TOKEN_LIFE });
};

class AuthHandler {
  async register(req, res) {
    try {
      if (!req.body.fullname || !req.body.email || !req.body.password || !req.body.status || !req.body.level || !req.body.nickName) {
        throw { code: 400, message: "MISSING_REQUIRED_FIELDS" };
      }

      if (!isEmailValid(req.body.email)) {
        throw { code: 409, message: "EMAIL_INVALID" };
      }

      if (req.body.password.length < 8) {
        throw { code: 400, message: "PASSWORD_MINIMUM_8_CHARACTER" };
      }

      const emailExist = await isEmailExist(req.body.email);
      if (emailExist) {
        throw { code: 409, message: "EMAIL_ALREADY_EXIST" };
      }
      const nickNameExist = await isNickNameExist(req.body.nickName);
      if (nickNameExist) {
        throw { code: 409, message: "NICK_NAME_ALREADY_EXIST" };
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const id = `User-${nanoid(12)}`;
      const profileId = `UserProfile-${nanoid(8)}`;
      const sosMedId = `sosmed-${nanoid(8)}`;

      const user = await prisma.user.create({
        data: {
          id: id,
          fullname: req.body.fullname,
          email: req.body.email,
          password: hash,
          status: req.body.status,
          level: req.body.level,
          nick_name: req.body.nickName,
          division: req.body.division,
          profile: {
            create: {
              id: profileId,
              fullName: req.body.fullname,
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

      const payload = { id: user.id };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return res.status(200).json({
        status: true,
        message: "USER_REGISTER_SUCCESS",
        name: user.fullname,
        userId: user.id,
        profileId: profileId,
        sosmedId: sosMedId,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error(error);
      let errorMessage = "INTERNAL_SERVER_ERROR";
      if (error.code === 400) errorMessage = error.message;
      else if (error.code === 409) errorMessage = error.message;
      else if (error.code === 500) errorMessage = error.message;
      return res.status(error.code || 500).json({ status: false, message: errorMessage });
    }
  }

  async login(req, res) {
    try {
      if (!req.body.email || !req.body.password) {
        throw { code: 428, message: "MISSING_REQUIRED_FIELDS" };
      }
      const user = await prisma.user.findFirst({
        where: {
          email: req.body.email,
        },
        include: {
          profile: true,
        },
      });
      if (!user) {
        throw { code: 401, message: "USER_NOT_FOUND" };
      }
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
      if (!isPasswordValid) {
        throw { code: 401, message: "INVALID_CREDENTIALS" };
      }
      const payload = { id: user.id };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return res.status(200).json({
        status: true,
        message: "LOGIN_SUCCESS",
        accessToken,
        refreshToken,
        fullname: user.fullname,
        level: user.level,
      });
    } catch (error) {
      console.error(error);
      let errorMessage = "INTERNAL_SERVER_ERROR";
      if (error.code === 428) errorMessage = error.message;
      else if (error.code === 401) errorMessage = error.message;
      return res.status(error.code || 500).json({ status: false, message: errorMessage });
    }
  }

  async refreshToken(req, res) {
    try {
      const verify = await JsonWebToken.verify(req.body.refreshToken, env.JWT_REFRESH_TOKEN_SECRET);
      const payload = { id: verify.id, role: verify.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return res.status(200).json({
        status: true,
        message: "REFRESH_TOKEN_SUCCESS",
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error(error);
      let errorMessage = "INTERNAL_SERVER_ERROR";
      if (error.message === "jwt expired") {
        errorMessage = "REFRESH_TOKEN_EXPIRED";
      } else if (["invalid signature", "jwt malformed", "jwt must be provided", "invalid token"].includes(error.message)) {
        errorMessage = "INVALID_REFRESH_TOKEN";
      }
      return res.status(error.code || 500).json({ status: false, message: errorMessage });
    }
  }
}

export default new AuthHandler();
