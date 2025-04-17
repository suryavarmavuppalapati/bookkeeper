const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  verifyOtp,
  resendOtp
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp",verifyOtp);
router.post("/resend-otp",resendOtp);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});
router.get("/checkapi", (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "hello man",
    user,
  });
});

module.exports = router;
