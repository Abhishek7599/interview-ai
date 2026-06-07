const express = require("express");
const authController = require("../controllers/auth.controller");
const authmiddleware = require("../middleware/auth.middleware")
const authrouter = express.Router();

/**
 * @route Post /api/auth/register
 * @description Register a new user
 * @access Public 
 */
authrouter.post("/register",authController.registerUserController)

/**
 * @route Post/api/auth/login
 * @description login user with email and password
 * @access Public
 */
authrouter.post("/login",authController.loginUserController);

/**
 * @route post/api/auth/logout
 * @description user can logout their account from device
 * @access Public
 */
authrouter.post("/logout",authController.logoutUserController);

/**
 * @route get/api/auth/get-me
 * @description get the current logged in user details
 * @access Public
 */
authrouter.get("/get-me",authmiddleware.authuser,authController.getMeController);

module.exports = authrouter;