const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// ==== Register User
// ==== POST : api/users/register
// ==== UNPROTECTED
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(422).json({ message: "Fill in all fields" });
    }

    const newEmail = email.toLowerCase();
    const emailExists = await userModel.findOne({ email: newEmail });

    if (emailExists) {
      return res.status(422).json({ message: "Email already exists" });
    }

    if (password.trim().length < 6) {
      return res
        .status(422)
        .json({ message: "Password should be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);
    const newUser = await userModel.create({
      name,
      email: newEmail,
      password: hashpassword,
    });

    res.status(201).json(`New user ${newUser.email} registered`);
  } catch (error) {
    console.error("User registration error:", error);
    res
      .status(500)
      .json({ message: "User registration failed. Please try again later." });
  }
};

// ==== Login User
// ==== POST : api/users/login
// ==== UNPROTECTED
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ message: "Fill in all fields" });
    }
    const newEmail = email.toLowerCase();
    const user = await userModel.findOne({ email: newEmail });
    if (!user) {
      return res.status(422).json({ message: "Invalid credentials" });
    }
    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return res.status(422).json({ message: "Invalid credentials" });
    }
    const { _id: id, email: userEmail } = user;
    const token = jwt.sign({ id, email: userEmail }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ token, id, email: userEmail });
  } catch (error) {
    console.error("Login error: ", error);
    res.status(422).json({ message: "Login failed, Please try again later" });
  }
};

// ==== User Profile
// ==== POST : api/users/:id
// ==== PROTECTED
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Please search valid id" });
  }
};

// ==== Edit User Details (from Profile)
// ==== POST : api/users/edit-user
// ==== PROTECTED
const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(422).json({ message: "Password Required" });
    }

    if (!name || !email) {
      return res.status(422).json({ message: "Please fill all fields" });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emailExist = await userModel.findOne({ email });
    if (emailExist && emailExist._id != req.user.id) {
      return res.status(422).json({ message: "Email already exists" });
    }

    const validatePassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validatePassword) {
      return res.status(422).json({ message: "Invalid current password" });
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    user.name = name;
    user.email = email;
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in editUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==== Change User Avatar (Profile Picture)
// ==== POST : api/users/change-avatar
// ==== PROTECTED
const changeAvatar = async (req, res, next) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { filename: avatar } = req.file;
    // console.log("Uploaded file:", avatar);
    if (user.avatar) {
      const previousAvatarPath = path.join(
        __dirname,
        "../uploads",
        user.avatar
      );
      fs.stat(previousAvatarPath, (err, stats) => {
        if (err) {
          if (err.code === "ENOENT") {
            console.warn(`File not found: ${previousAvatarPath}`);
          } else {
            return next(err);
          }
        } else {
          fs.unlink(previousAvatarPath, (err) => {
            if (err) {
              console.error("Error deleting previous avatar:", err);
            }
          });
        }
      });
    }
    user.avatar = avatar;
    await user.save();
    // console.log("Updated user avatar in DB:", user.avatar);
    res
      .status(200)
      .json({ message: "Avatar updated successfully", avatar: user.avatar });
  } catch (error) {
    console.error("Error changing avatar:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==== Get Authors
// ==== POST : api/users/authors
// ==== UNPROTECTED
const getAuthors = async (req, res, next) => {
  try {
    const authors = await userModel.find().select("-password");
    res.status(201).json(authors);
  } catch (error) {
    return res.status(422).json({ message: "error occured" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  editUser,
  changeAvatar,
  getAuthors,
};
