const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUser,
  editUser,
  changeAvatar,
  getAuthors,
} = require("../controllers/userController");
const upload = require("../config/multerConfig");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.get("/", getAuthors);
router.post(
  "/change-avatar",
  authMiddleware,
  upload.single("avatar"),
  changeAvatar
);
router.patch("/edit-user", authMiddleware, editUser);

module.exports = router;
