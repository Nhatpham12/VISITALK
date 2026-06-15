const express = require("express");
const router = express.Router();

const {
  recordAccess,
  getByUserId,
  getByLessonId,
  deleteAccess,
} = require("../controllers/accessTo.controllers");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/", verifyToken, recordAccess);
router.get("/user/:userId", verifyToken, getByUserId);
router.get("/lesson/:les_id", verifyToken, getByLessonId);
router.delete("/:userId/:lessonId", verifyToken, deleteAccess);

module.exports = router;
