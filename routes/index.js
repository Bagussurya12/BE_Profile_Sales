import express from "express";
import AuthHandler from "../handlers/AuthHandler.js";

const router = express.Router();

// AUTH ROUTE
router.post("/register", AuthHandler.register);
router.post("/login", AuthHandler.login);
router.post("/refresh-token", AuthHandler.refreshToken);

export default router;
