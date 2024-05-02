import express from "express";
import AuthHandler from "../handlers/AuthHandler.js";
import UserHandler from "../handlers/userHandler.js";
import userHandler from "../handlers/userHandler.js";

const router = express.Router();

// AUTH ROUTE
router.post("/register", AuthHandler.register);
router.post("/login", AuthHandler.login);
router.post("/refresh-token", AuthHandler.refreshToken);
// USERS ROUTE
router.get("/Users", UserHandler.getAllUserHandler);
router.post("/Add-User", UserHandler.addUserHandler);
router.put("/Update-User/:userId", UserHandler.updateUserHandler);
router.get("/users/:userId", userHandler.getUserById);

export default router;
