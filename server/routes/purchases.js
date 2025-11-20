import express from "express";
import Purchase from "../models/Purchase.js";
import Book from "../models/Book.js";
import Cart from "../models/Cart.js";
import auth from "../middlewares/auth.js";
import axios from "axios";

const router = express.Router();
const API_BASE_URL = process.env.API_BASE_URL;

/**
 * ✅ [POST] /api/purchase
 * 선택한 도서 결제 후 DB 저장
 */
router.post("/", auth, async (req, res) => {
  const { books } = req.body; // [{ isbn, price }]
  const userId = req.user._id;

  console.log("🧾 결제 요청 도서:", books);
  console.log("👤 사용자:", userId);

  if (!Array.isArray(books) || books.length === 0) {
    return res.status(400).json({ error: "결제할 도서 목록이 비어 있습니다." });
  }

  try {
    const purchases = [];

    for (const book of books) {
      const { isbn, price } = book;
      if (!isbn) continue;

      // 1️⃣ 이미 구매한 책은 스킵
      const existing = await Purchase.findOne({ userId, bookIsbn: isbn });
      if (existing) continue;

      // 2️⃣ Book 존재 확인
      let foundBook = await Book.findOne({ isbn });

      // 3️⃣ Book이 없으면 외부 API or 내부 API 통해 생성
      if (!foundBook) {
        try {
          const resBook = await axios.get(`${API_BASE_URL}/api/books/detail/${isbn}`);
          const data = resBook.data;

          foundBook = await Book.create({
            isbn: data.isbn ?? data.isbn13 ?? isbn,
            title: data.title || "제목 없음",
            author: data.author || "작자 미상",
            image: data.image || data.cover || "",
            salePrice: data.salePrice ?? data.price ?? 0,
            listPrice: data.listPrice ?? data.priceStandard ?? 0,
            discountRate: data.discountRate ?? null,
            summary: data.summary ?? "",
            category: data.categoryName ?? "",
            rating: data.rating ?? 0,
          });

          console.log(`📕 새 도서 등록됨: ${foundBook.title}`);
        } catch (err) {
          console.error("❌ 도서 정보 불러오기 실패:", err.message);

          // ✅ API 실패 시 최소 정보로 fallback
          foundBook = await Book.create({
            isbn,
            title: "정보 없음",
            author: "작자 미상",
            salePrice: price ?? 0,
            listPrice: price ?? 0,
            discountRate: null,
          });

          console.log(`⚠️ Fallback 도서 등록됨 (ISBN: ${isbn})`);
        }
      }

      // 4️⃣ Purchase 생성
      const newPurchase = await Purchase.create({
        userId,
        bookIsbn: isbn,
        price,
      });

      purchases.push(newPurchase);
    }

    // 5️⃣ 장바구니에서 제거
    const isbns = books.map((b) => b.isbn);
    await Cart.deleteMany({ userId, bookIsbn: { $in: isbns } });

    res.status(201).json({
      message: "✅ 결제가 완료되었습니다. 장바구니에서 제거되었습니다.",
      purchases,
    });
  } catch (err) {
    console.error("❌ 결제 처리 실패:", err);
    res.status(500).json({ error: "결제 처리 실패" });
  }
});

/**
 * ✅ [GET] /api/purchase/my
 * 로그인한 유저의 구매 내역 조회
 */
router.get("/my", auth, async (req, res) => {
  const userId = req.user._id;

  try {
    const purchases = await Purchase.find({ userId }).sort({ createdAt: -1 });
    const books = await Book.find({
      isbn: { $in: purchases.map((p) => p.bookIsbn) },
    }).select("isbn title author image salePrice");

    const result = purchases.map((p) => ({
      ...p.toObject(),
      book: books.find((b) => String(b.isbn) === String(p.bookIsbn)) || null,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ 구매 내역 불러오기 실패:", err);
    res.status(500).json({ error: "구매 내역 불러오기 실패" });
  }
});

export default router;
