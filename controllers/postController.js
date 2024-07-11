const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const fs = require("fs");
const path = require("path");

const createPost = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;
    if (!title || !category || !description || !req.file) {
      return res.status(402).json({ message: "Fill all fields" });
    }
    const { filename: thumbnail } = req.file;
    const newPost = new postModel({
      title,
      category,
      description,
      creator: req.user.id,
      thumbnail,
    });
    await newPost.save();
    await userModel.findByIdAndUpdate(
      req.user.id,
      { $inc: { posts: 1 } },
      { new: true }
    );
    res.status(201).json(newPost);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await postModel.find().sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return res.status(422).json("Error :", error.message);
  }
};

const getPost = async (req, res, next) => {
  try {
    const postID = req.params.id;
    const post = await postModel.findById(postID);
    if (!post) {
      return res.status(404).json({ message: "No post found" });
    }
    res.status(200).json(post);
  } catch (error) {
    return res.status(444).json({ error: error.message });
  }
};

const getCategoryPosts = async (req, res, next) => {
  try {
    const { category } = req.params;
    const categoryPosts = await postModel
      .find({ category })
      .sort({ updatedAt: -1 });
    res.status(200).json(categoryPosts);
  } catch (error) {
    return res.status(444).json({ error: error.message });
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await postModel.find({ creator: id }).sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return res.status(444).json({ error: error.message });
  }
};

const editPost = async (req, res, next) => {
  try {
    const postID = req.params.id;
    let { title, category, description } = req.body;
    if (!title || !category || !description) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    if (description.length < 12) {
      return res.status(400).json({ message: "Description must be longer" });
    }
    let updatedPost;
    if (!req.file) {
      updatedPost = await postModel.findByIdAndUpdate(
        postID,
        { title, category, description },
        { new: true }
      );
    } else {
      const oldPost = await postModel.findById(postID);
      if (!oldPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      const oldFilePath = path.join(__dirname, "../uploads", oldPost.thumbnail);
      fs.unlink(oldFilePath, async (err) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        const { filename: thumbnail } = req.file;
        if (req.file.size > 2000000) {
          return res.status(422).json({ message: "File too big" });
        }
        updatedPost = await postModel.findByIdAndUpdate(
          postID,
          { title, category, description, thumbnail: thumbnail },
          { new: true }
        );
        return res
          .status(200)
          .json({ message: "Post updated successfully", post: updatedPost });
      });
      return;
    }
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postID = req.params.id;
    if (!postID) {
      return res.status(400).json({ message: "Post Unavailable" });
    }
    const post = await postModel.findById(postID);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const fileName = post.thumbnail;
    const filePath = path.join(__dirname, "../uploads", fileName);
    fs.unlink(filePath, async (err) => {
      if (err) {
        return res.status(422).json({ message: err.message });
      }
      await postModel.findByIdAndDelete(postID);
      const currentUser = await userModel.findById(req.user.id);
      if (currentUser) {
        const userPostCount = currentUser.posts - 1;
        await userModel.findByIdAndUpdate(req.user.id, {
          posts: userPostCount,
        });
      }
      return res
        .status(200)
        .json({ message: `Post ${postID} deleted successfully` });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  getCategoryPosts,
  getUserPosts,
  editPost,
  deletePost,
};
