const express = require("express");
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  getCategoryPosts,
  getUserPosts,
  editPost,
  deletePost,
} = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");

router.post("/", authMiddleware, upload.single("thumbnail"), createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.get("/categories/:category", getCategoryPosts);
router.get("/users/:id", getUserPosts);
router.patch("/:id", authMiddleware, upload.single("thumbnail"), editPost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
