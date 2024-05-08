import express from "express";
import AuthHandler from "../handlers/AuthHandler.js";
import UserHandler from "../handlers/userHandler.js";
import SosmedHandler from "../handlers/SosmedHandler.js";

const router = express.Router();

// AUTH ROUTE
router.post("/register", AuthHandler.register);
router.post("/login", AuthHandler.login);
router.post("/refresh-token", AuthHandler.refreshToken);
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

export default router;
