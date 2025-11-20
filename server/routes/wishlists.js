import express from "express";
import Wishlist from "../models/Wishlist.js";
import Book from "../models/Book.js";
import auth from "../middlewares/auth.js";

const router = express.Router();
const API_BASE_URL = process.env.API_BASE_URL;


/**
 * ✅ [POST] /api/wishlist/:isbn
 * 찜 등록
 */
router.post("/:isbn", auth, async (req, res) => {
  const { isbn } = req.params;
  const userId = req.user._id;

  try {
    // 중복 확인
    const existing = await Wishlist.findOne({ userId, bookIsbn: isbn });
    if (existing) {
      return res.status(200).json({ message: "이미 찜한 도서입니다." });
    }

    // ✅ Book 컬렉션 확인
    let book = await Book.findOne({ isbn });

    // 없으면 Book API에서 가져와 저장
    if (!book) {
      try {
        const resBook = await axios.get(`${API_BASE_URL}/api/books/detail/${isbn}`);
        const newBook = resBook.data;

        // Book 모델 스키마에 맞춰 변환
        book = await Book.create({
          isbn: newBook.isbn,
          title: newBook.title,
          author: newBook.author,
          image: newBook.image,
          salePrice: newBook.salePrice,
          listPrice: newBook.listPrice,
          discountRate: newBook.discountRate,
          rating: newBook.rating,
          category: newBook.category,
          summary: newBook.summary,
        });

        console.log(`📗 새 도서 등록됨: ${book.title}`);
      } catch (err) {
        console.error("❌ 도서 정보 불러오기 실패:", err);
      }
    }

    // ✅ Wishlist에 저장
    const wishlist = new Wishlist({ userId, bookIsbn: isbn });
    await wishlist.save();

    res.status(201).json({ message: "찜 완료!", wishlist });
  } catch (err) {
    console.error("❌ 찜 등록 실패:", err);
    res.status(500).json({ error: "찜 등록 실패" });
  }
});

/**
 * ✅ [DELETE] /api/wishlist/:isbn
 * 찜 해제
 */
router.delete("/:isbn", auth, async (req, res) => {
  const { isbn } = req.params;
  const userId = req.user._id;

  try {
    const deleted = await Wishlist.findOneAndDelete({ userId, bookIsbn: isbn });
    if (!deleted) {
      return res.status(404).json({ message: "찜 목록에 존재하지 않습니다." });
    }
    res.json({ message: "찜 해제 완료!" });
  } catch (err) {
    console.error("❌ 찜 해제 실패:", err);
    res.status(500).json({ error: "찜 해제 실패" });
  }
});

/**
 * ✅ [GET] /api/wishlist/:isbn
 * 특정 도서 찜 여부 확인
 */
router.get("/:isbn", auth, async (req, res) => {
  const { isbn } = req.params;
  const userId = req.user._id;

  try {
    const exists = await Wishlist.exists({ userId, bookIsbn: isbn });
    res.json({ isFavorited: !!exists });
  } catch (err) {
    console.error("❌ 찜 여부 조회 실패:", err);
    res.status(500).json({ error: "찜 여부 조회 실패" });
  }
});

/**
 * ✅ [GET] /api/wishlist
 * 마이페이지용 찜 목록 조회
 */
router.get("/", auth, async (req, res) => {
  const userId = req.user._id;

  try {
    // Wishlist 기준으로 찜한 도서 ISBN 리스트를 불러옴
    const list = await Wishlist.find({ userId }).sort({ createdAt: -1 });

    // Book 컬렉션에서 해당 ISBN 도서 정보 조회
    const books = await Book.find({
      isbn: { $in: list.map((w) => w.bookIsbn) },
    }).select("isbn title author image salePrice");

    console.log("💬 list 타입:", typeof list, Array.isArray(list));
    const merged = list.map((w) => ({
      bookIsbn: w.bookIsbn,
      createdAt: w.createdAt,
      book: books.find((b) => b.isbn === w.bookIsbn),
    }));

    res.json(merged);
  } catch (err) {
    console.error("❌ 찜 목록 불러오기 실패:", err);
    res.status(500).json({ error: "찜 목록 불러오기 실패" });
  }
});


export default router;
