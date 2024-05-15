import express from "express";
import UserHandler from "../handlers/UserHandler.js";
import AuthHandler from "../handlers/AuthHandler.js";
import SosmedHandler from "../handlers/SosmedHandler.js";
import ProductHandler from "../handlers/ProductHandler.js";
import ProfileHandler from "../handlers/ProfileHandler.js";
import { uploadFiles } from "../middlewares/UploadFile.js";
import jwtAuth from "../middlewares/JwtAuth.js";

const router = express.Router();

// AUTH ROUTE
router.post("/register", AuthHandler.register);
router.post("/login", AuthHandler.login);
router.post("/refresh-token", AuthHandler.refreshToken);
// PROFILE HANDLER
router.put("/Profile/:userId", uploadFiles, ProfileHandler.updateProfileHandler);
// USERS ROUTE
router.get("/Users", jwtAuth(), UserHandler.getAllUserHandler);
router.get("/users/:userId", jwtAuth(), UserHandler.getUserById);
router.get("/user/:nickName", jwtAuth(), UserHandler.getUserByNickName);
router.post("/Add-User", jwtAuth(), UserHandler.addUserHandler);
router.put("/Update-User/:userId", jwtAuth(), UserHandler.updateUserHandler);
router.delete("/users/delete/:userId", jwtAuth(), UserHandler.deleteUserById);
// SOSMED ROUTE
router.put("/sosmed/:sosmedId", jwtAuth(), SosmedHandler.updateSosmedHandler);
router.get("/sosmed/:sosmedId", jwtAuth(), SosmedHandler.getSosmedById);
// PRODUCT HANDLER
router.post("/product/:userId", uploadFiles, ProductHandler.addProductHandler);
router.get("/product/:userId", ProductHandler.getProductHandlerByUserId);
router.get("/product/:userId/:productId", ProductHandler.getProductById);
router.delete("/product/:productId", ProductHandler.deleteProductHandler);

export default router;
