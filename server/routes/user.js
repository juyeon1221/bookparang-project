import express from "express";
import multer from "multer";
import path from "path";
import auth from "../middlewares/auth.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
  getUserProfile,
  updateUser,
  checkNickname,
} from "../controllers/userController.js";

const router = express.Router();

// ✅ Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ 유저 관련 API
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.delete("/delete/:userId", auth, deleteUser);
router.get("/me", auth, getUserProfile);
router.get("/check-nickname", checkNickname); // 닉네임 중복 체크
router.put("/update", auth, upload.single("profileImage"), updateUser);
router.get("/check", auth, (req, res) => res.json({ user: req.user }));

export default router;
