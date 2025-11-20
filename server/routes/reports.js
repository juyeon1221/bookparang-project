import express from "express";
import auth from "../middlewares/auth.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ 모든 신고 조회 (관리자 전용)
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (user.role !== "admin") {
      return res.status(403).json({ error: "관리자만 접근 가능합니다." });
    }

    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error("❌ 신고 목록 불러오기 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// ✅ 신고 처리 (관리자 전용)
router.put("/:id/resolve", auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (user.role !== "admin") {
      return res.status(403).json({ error: "관리자만 접근 가능합니다." });
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "해당 신고를 찾을 수 없습니다." });
    }

    res.json({ message: "신고가 처리되었습니다.", report: updated });
  } catch (error) {
    console.error("❌ 신고 처리 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

export default router;
