const express = require("express");
const router = express.Router();
const users = require("../models/users.model");
const { register, login, logout } = require("../controllers/auth.controllers");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/register", register);

router.post("/login", login);

router.post("/logout", verifyToken, logout);

router.get("/me", verifyToken, (req, res) => {
  // req.user được gán bởi verifyToken middleware
  users.getById(req.user.id, (err, user) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const { password_hash, ...safeUser } = user;
    res.status(200).json(safeUser);
  });
});

module.exports = router;
