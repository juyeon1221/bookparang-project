import express from "express";
import Cart from "../models/Cart.js";
import Book from "../models/Book.js";
import auth from "../middlewares/auth.js";
import axios from "axios";

const router = express.Router();

/**
 * ✅ [POST] /api/cart/:isbn
 * 장바구니에 책 추가
 */
router.post("/:isbn", auth, async (req, res) => {
  const API_BASE_URL = process.env.API_BASE_URL;
  const { isbn } = req.params;
  const userId = req.user._id;

  // ✅ isbn 유효성 검사
  if (!isbn || isbn === "undefined" || isbn === "null") {
    return res.status(400).json({ error: "ISBN이 유효하지 않습니다." });
  }

  try {
    // 1️⃣ 이미 장바구니에 있는지 확인
    const existing = await Cart.findOne({ userId, bookIsbn: isbn });
    if (existing) {
      return res.status(200).json({ message: "이미 장바구니에 있습니다." });
    }

    // 2️⃣ Book 컬렉션에 존재하는지 확인
    let book = await Book.findOne({ isbn });

    // 3️⃣ 없으면 Book API에서 새로 가져와 저장
    if (!book) {
      try {
        const resBook = await axios.get(`${API_BASE_URL}/api/books/detail/${isbn}`);
        console.log("📘 도서 상세 응답:", resBook.data);
        const newBook = resBook.data;

        // ✅ Book 모델 스키마에 맞게 변환 후 저장
        book = await Book.create({
          isbn: newBook.isbn ?? newBook.isbn13 ?? isbn,
          title: newBook.title || "제목 없음",
          author: newBook.author || "작자 미상",
          image: newBook.image || newBook.cover || "",
          salePrice: newBook.salePrice ?? newBook.price ?? 0,
          listPrice: newBook.listPrice ?? newBook.priceStandard ?? 0,
          discountRate: newBook.discountRate ?? null,
          summary: newBook.summary ?? "",
          category: newBook.categoryName ?? "",
          rating: newBook.rating ?? 0,
        });

        console.log(`📘 새 도서 등록됨: ${book.title}`);
      } catch (err) {
        console.error("❌ 도서 정보 불러오기 실패:", err);

        // ✅ API 실패 시 fallback 도서 저장 (최소한의 정보)
        book = await Book.create({
          isbn,
          title: "정보 없음",
          author: "작자 미상",
          salePrice: 0,
          listPrice: 0,
          discountRate: null,
        });

        console.log(`⚠️ Fallback 도서 등록됨 (ISBN: ${isbn})`);
      }
    }

    // 4️⃣ Cart에 추가
    const cartItem = new Cart({ userId, bookIsbn: isbn });
    await cartItem.save();

    res.status(201).json({ message: "장바구니에 추가되었습니다.", cartItem });
  } catch (err) {
    console.error("❌ 장바구니 추가 실패:", err);
    res.status(500).json({ error: "장바구니 추가 실패" });
  }
});

/**
 * ✅ [DELETE] /api/cart/:isbn
 * 장바구니에서 책 제거
 */
router.delete("/:isbn", auth, async (req, res) => {
  const { isbn } = req.params;
  const userId = req.user._id;

  try {
    const deleted = await Cart.findOneAndDelete({ userId, bookIsbn: isbn });
    if (!deleted) {
      return res.status(404).json({ message: "장바구니에 존재하지 않습니다." });
    }

    res.json({ message: "장바구니에서 제거되었습니다." });
  } catch (err) {
    console.error("❌ 장바구니 제거 실패:", err);
    res.status(500).json({ error: "장바구니 제거 실패" });
  }
});

/**
 * ✅ [GET] /api/cart
 * 장바구니 목록 조회
 */
router.get("/", auth, async (req, res) => {
  const userId = req.user._id;

  try {
    // 1️⃣ 해당 유저의 장바구니 목록
    const list = await Cart.find({ userId }).sort({ createdAt: -1 });
    const isbns = list.map((c) => c.bookIsbn);

    console.log("🧾 장바구니 ISBN 목록:", isbns);

    // 2️⃣ Book 정보 조회 (정가, 할인율 포함)
    const books = await Book.find({
      isbn: { $in: isbns },
    }).select("isbn title author image salePrice listPrice discountRate");

    console.log("📚 조회된 Book 수:", books.length);

    // 3️⃣ 병합하여 반환
    const merged = list.map((c) => ({
      bookIsbn: c.bookIsbn,
      quantity: c.quantity,
      book: books.find((b) => b.isbn === c.bookIsbn) || null,
    }));

    res.json(merged);
  } catch (err) {
    console.error("❌ 장바구니 목록 불러오기 실패:", err);
    res.status(500).json({ error: "장바구니 목록 불러오기 실패" });
  }
});

export default router;
