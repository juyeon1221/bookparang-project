import express from "express";
import auth from "../middlewares/auth.js";
import ReadingRecord from "../models/ReadingRecord.js";
import Book from "../models/Book.js";

const router = express.Router();

/**
 * 📌 1) 날짜에 책 기록 저장
 * POST /api/reading-record
 */
router.post("/", auth, async (req, res) => {
  const { date, bookIsbn } = req.body;
  const userId = req.user._id;

  if (!date || !bookIsbn) {
    return res.status(400).json({ error: "date 또는 bookIsbn이 없습니다." });
  }

  try {
    const record = await ReadingRecord.create({
      userId,
      date,
      bookIsbn,
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("❌ 기록 저장 실패:", err);
    res.status(500).json({ error: "기록 저장 실패" });
  }
});

/**
 * 📌 2) 특정 날짜 기록 조회
 * GET /api/reading-record?date=YYYY-MM-DD
 */
router.get("/", auth, async (req, res) => {
  const userId = req.user._id;
  const date = req.query.date;

  if (!date) {
    return res.status(400).json({ error: "date가 필요합니다." });
  }

  try {
    const records = await ReadingRecord.find({ userId, date });

    const books = await Book.find({
      isbn: { $in: records.map((r) => r.bookIsbn) },
    });

    const merged = records.map((r) => ({
      ...r.toObject(),
      book: books.find((b) => b.isbn === r.bookIsbn) || null,
    }));

    res.json(merged);
  } catch (err) {
    console.error("❌ 날짜 기록 조회 실패:", err);
    res.status(500).json({ error: "날짜 기록 조회 실패" });
  }
});

/**
 * 📌 3) 전체 독서 기록 조회 (캘린더 로딩용)
 * GET /api/reading-record/all
 */
router.get("/all", auth, async (req, res) => {
  const userId = req.user._id;

  try {
    const records = await ReadingRecord.find({ userId });

    const books = await Book.find({
      isbn: { $in: records.map((r) => r.bookIsbn) },
    });

    const merged = records.map((r) => ({
      ...r.toObject(),
      book: books.find((b) => b.isbn === r.bookIsbn) || null,
    }));

    res.json(merged);
  } catch (err) {
    console.error("❌ 전체 기록 불러오기 실패:", err);
    res.status(500).json({ error: "전체 기록 불러오기 실패" });
  }
});

/**
 * 📌 4) 특정 기록 삭제
 * DELETE /api/reading-record/:id
 */
router.delete("/:id", auth, async (req, res) => {
  const userId = req.user._id;
  const id = req.params.id;

  try {
    await ReadingRecord.deleteOne({ _id: id, userId });
    res.json({ message: "삭제 완료" });
  } catch (err) {
    console.error("❌ 삭제 실패:", err);
    res.status(500).json({ error: "삭제 실패" });
  }
});

/**
 * 📌 5) 기록 수정 (책 변경 / 날짜 변경 가능)
 * PATCH /api/reading-record/:id
 */
router.patch("/:id", auth, async (req, res) => {
  const userId = req.user._id;
  const id = req.params.id;
  const update = req.body;

  try {
    const record = await ReadingRecord.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true }
    );

    res.json(record);
  } catch (err) {
    console.error("❌ 수정 실패:", err);
    res.status(500).json({ error: "수정 실패" });
  }
});

export default router;
