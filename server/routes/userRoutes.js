const express = require("express");
const User = require("../models/User");
const upload = require("../helpers/upload"); // Multer middleware
const uploadFileToS3 = require("../helpers/uploadtos3"); // S3 helper
const {authMiddleware} =  require("../controllers/auth/auth-controller")
const router = express.Router();

/**
 * @route   POST /api/user/upload
 * @desc    Upload profile image to AWS S3
 */
router.post("/upload", authMiddleware,upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = await uploadFileToS3(req.file, "profile-images");

    return res.status(200).json({ message: "Image uploaded", imageUrl });
  } catch (error) {
    console.error("❌ S3 upload failed:", error.message);
    return res.status(500).json({
      message: "S3 upload failed",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/user/getUser/:userId
 * @desc    Fetch all users
 */
router.put("/getUser/:userId", authMiddleware,async (req, res) => {
  try {
    const userId=req?.params?.userId;
    console.log(userId);
    
    const user = await User.findById(userId);
    const reUser= {
      name: user.userName,
      email: user.email,
      profileImageUrl: user.profileImageUrl
    }
    console.log(reUser);
    return res.status(200).json(reUser);
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    return res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/user/:id
 * @desc    Update user info by ID (username and/or profile image)
 */
router.put("/:id",authMiddleware, async (req, res) => {
  try {
    const { userName } = req.body;

    const updatedUser = await User.findById(
      req.user.id,
      { new: true }
    );
     if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    updatedUser.userName=userName;
    updatedUser.save();
   

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    return res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
});

router.post("/profileChange", authMiddleware,upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const user= await User.findById(req.user.id);
    if(!user)
    {
      return res.status(401).json({ message: "User Not found" });
    }
    const imageUrl = await uploadFileToS3(req.file, "profile-images");
    await User.findByIdAndUpdate(req.user.id, { profileImageUrl: imageUrl }, { new:
      true });
    return res.status(200).json({ message: "Image updated Successfully", imageUrl });
  } catch (error) {
    console.error("❌ S3 upload failed:", error.message);
    return res.status(500).json({
      message: "S3 upload failed",
      error: error.message,
    });
  }
});``
module.exports = router;
