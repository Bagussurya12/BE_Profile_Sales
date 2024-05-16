import express from "express";
import UserHandler from "../handlers/UserHandler.js";
import AuthHandler from "../handlers/AuthHandler.js";
import SosmedHandler from "../handlers/SosmedHandler.js";
import ProductHandler from "../handlers/ProductHandler.js";
import ProfileHandler from "../handlers/ProfileHandler.js";
import ArticleHandler from "../handlers/ArticleHandler.js";

import { uploadFiles } from "../middlewares/UploadFile.js";
import jwtAuth from "../middlewares/JwtAuth.js";

const router = express.Router();

// AUTH ROUTE
router.post("/register", AuthHandler.register);
router.post("/login", AuthHandler.login);
router.post("/refresh-token", AuthHandler.refreshToken);
// PROFILE HANDLER
router.put("/Profile/:userId", uploadFiles, ProfileHandler.updateProfileHandler);
router.get("/profile/:userId", ProfileHandler.getProfileHandlerByUserId);
// USERS ROUTE
router.get("/Users", UserHandler.getAllUserHandler);
router.get("/users/:userId", UserHandler.getUserById);
router.get("/user/:nickName", UserHandler.getUserByNickName);
router.post("/Add-User", UserHandler.addUserHandler);
router.put("/Update-User/:userId", UserHandler.updateUserHandler);
router.delete("/users/delete/:userId", UserHandler.deleteUserById);
// SOSMED ROUTE
router.put("/sosmed/:sosmedId", SosmedHandler.updateSosmedHandler);
router.get("/sosmed/:sosmedId", SosmedHandler.getSosmedById);
router.get("/sosmed/:profileId", SosmedHandler.getSosmedByProfileId);
// PRODUCT HANDLER
router.post("/product/:userId", uploadFiles, ProductHandler.addProductHandler);
router.get("/product/:userId", ProductHandler.getProductHandlerByUserId);
router.get("/product/:userId/:productId", ProductHandler.getProductById);
router.delete("/product/:productId", ProductHandler.deleteProductHandler);
// ARTICLE ROUTE
router.post("/article", uploadFiles, ArticleHandler.addArticle);
router.get("/article/:articleId", ArticleHandler.getArticleById);
export default router;
