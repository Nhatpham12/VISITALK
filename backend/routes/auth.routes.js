const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/auth.controllers");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

module.exports = router;
