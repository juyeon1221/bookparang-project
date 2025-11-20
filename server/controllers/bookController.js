import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchBooks } from "../services/bookService.js";
import axios from "axios";
import { categoryIdMap } from "../../src/data/categoryIdMap.js";

// 경로 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 전체 eBook
export const getAllBooks = async (req, res) => {
  const { category, sort } = req.query;
  try {
    const books = await fetchBooks("ItemNewAll", category, sort);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch all ebooks" });
  }
};

// ✅ 베스트셀러
export const getBestsellerBooks = async (req, res) => {
  console.log("🔥 [API 호출됨] /api/books/bestseller");
  const { category, sort } = req.query;

  // ✅ 문자열 → 숫자형 ID 변환
  const categoryId = categoryIdMap[category] || "";

  console.log(`📚 요청 카테고리: ${category} → 변환된 ID: ${categoryId}`);

  try {
    const books = await fetchBooks("Bestseller", categoryId, sort);
    res.json(books);
  } catch (err) {
    console.error("❌ 베스트셀러 API 실패:", err.message);
    res.status(500).json({ message: "Failed to fetch bestseller ebooks" });
  }
};

// ✅ 신간
export const getNewBooks = async (req, res) => {
  console.log("🔥 [API 호출됨] /api/books/new");
  const { category, sort } = req.query;

  // ✅ 문자열 → 숫자형 ID 변환
  const categoryId = categoryIdMap[category] || "";

  try {
    const categoryId = category ? categoryIdMap[category] : undefined;
    const books = await fetchBooks("ItemNewSpecial", categoryId, sort);
    res.json(books);
  } catch (err) {
    console.error("❌ 신간 조회 실패:", err.message);
    res.status(500).json({ message: "Failed to fetch new ebooks" });
  }
};

// ✅ 카테고리
export const getBookCategories = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/ebookCategories.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const ebookCategories = JSON.parse(rawData);

    const mapped = ebookCategories.map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      categoryPath: `eBook > ${c.name}`,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("❌ 카테고리 조회 에러:", err.message);
    res.status(500).json({ message: "Failed to fetch book categories" });
  }
};

// ✅ 도서 상세 조회
export const getBookDetail = async (req, res) => {
  const { isbn } = req.params;

  try {
    // 1️⃣ 알라딘 API 호출
    const { data } = await axios.get(
      "https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx",
      {
        params: {
          ttbkey: process.env.ALADIN_TTB_KEY,
          ItemIdType: "ISBN13", // 🔥 ISBN13이 더 정확함
          ItemId: isbn,
          Output: "JS",
          Version: "20131101",
          Cover: "Big",
        },
      }
    );

    console.log("📗 Aladin API 응답:", data);

    // 📌 2️⃣ 알라딘 API 에러 처리 (가장 중요)
    if (data.errorCode) {
      console.warn("📕 Aladin API 에러:", data.errorMessage);

      return res.status(404).json({
        success: false,
        message: "해당 ISBN의 도서가 알라딘에 존재하지 않습니다.",
        isbn,
      });
    }

    // 📌 3️⃣ item 배열이 없거나 빈 경우 처리
    if (!data?.item || data.item.length === 0) {
      return res.status(404).json({
        success: false,
        message: "도서 정보를 찾을 수 없습니다.",
        isbn,
      });
    }

    const book = data.item[0];

    const mapped = {
      isbn: book.isbn13 || book.isbn,
      title: book.title || "제목 없음",
      author: book.author || "작자 미상",
      publisher: book.publisher || "",
      listPrice: book.priceStandard || 0,
      salePrice: book.priceSales || 0,
      discountRate:
        book.priceStandard
          ? Math.round(
            ((book.priceStandard - book.priceSales) / book.priceStandard) * 100
          )
          : 0,
      category: book.categoryName || "",
      summary: book.description || "",
      image: book.cover || "",
      rating: book.customerReviewRank || 0,
      pubDate: book.pubDate || "",
    };

    return res.json(mapped);
  } catch (err) {
    // 📌 4️⃣ catch에서도 항상 응답 보내기
    console.error("❌ 도서 상세 조회 실패:", err.message);

    // 알라딘에서 XML 에러를 반환하면 err.response가 존재할 수 있음
    if (err.response) {
      console.error("🔻 Aladin Error Response:", err.response.data);
    }

    return res.status(500).json({
      success: false,
      message: "도서 상세 조회 중 오류가 발생했습니다.",
      isbn,
    });
  }
};


// ✅ 상위 카테고리 매핑 테이블
const CATEGORY_MAP = [
  { id: 1, name: "소설", keywords: ["소설/시/희곡", "한국소설", "외국소설"] },
  { id: 55889, name: "시/에세이", keywords: ["시", "에세이"] },
  { id: 170, name: "경제경영", keywords: ["경제", "경영"] },
  { id: 336, name: "자기계발", keywords: ["자기계발"] },
  { id: 987, name: "인문학", keywords: ["인문"] },
  { id: 798, name: "사회과학", keywords: ["사회과학"] },
  { id: 74, name: "역사", keywords: ["역사"] },
  { id: 517, name: "예술/대중문화", keywords: ["예술", "대중문화"] },
  { id: 1230, name: "과학", keywords: ["과학"] },
  { id: 351, name: "IT 모바일", keywords: ["IT", "모바일", "컴퓨터"] },
  { id: 1322, name: "외국어", keywords: ["외국어", "영어", "일본어", "중국어"] },
  { id: 1108, name: "어린이", keywords: ["어린이"] },
  { id: 1137, name: "청소년", keywords: ["청소년"] },
  { id: 1196, name: "여행", keywords: ["여행"] },
  { id: 1237, name: "요리", keywords: ["요리"] },
  { id: 5174, name: "건강", keywords: ["건강"] },
  { id: 2030, name: "가정/생활", keywords: ["가정", "생활"] },
  { id: 76000, name: "수험서", keywords: ["수험서"] },
];

// ✅ 알라딘 상세 조회 (카테고리 포함)
export const getAladinBookDetail = async (req, res) => {
  console.log("🚀 [getAladinBookDetail] 호출됨, ISBN:", req.query.isbn);
  const { isbn } = req.query;

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  }

  try {
    const { data } = await axios.get("https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx", {
      params: {
        ttbkey: process.env.ALADIN_TTB_KEY,
        ItemIdType: "ISBN",
        ItemId: isbn,
        Output: "JS",
        Version: "20131101",
        Cover: "Big",
      },
    });

    if (!data?.item?.length) {
      return res.status(404).json({ message: "Book not found" });
    }

    const book = data.item[0];
    const rawCategory = book.categoryName || "";

    // ✅ 매핑 로직 (수정된 부분)
    const rawParts = rawCategory.split(">").map(p => p.trim());
    console.log("📗 카테고리 분리:", rawParts);

    let matchedCategory = CATEGORY_MAP.find((cat) =>
      cat.keywords.some((kw) =>
        rawParts.some((part) => part.includes(kw))
      )
    );

    if (!matchedCategory) {
      matchedCategory = { id: 0, name: "기타" };
    }

    const detail = {
      listPrice: book.priceStandard || 0,
      salePrice: book.priceSales || 0,
      discountRate: book.priceStandard
        ? Math.round(((book.priceStandard - book.priceSales) / book.priceStandard) * 100)
        : 0,
      reviewRank: book.customerReviewRank || 0,
      link: book.link || "",
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
    };

    console.log("📗 원본 categoryName:", rawCategory);
    console.log("📘 매칭된 카테고리:", matchedCategory.name);

    res.json(detail);
  } catch (err) {
    console.error("❌ 알라딘 도서 상세 조회 실패:", err.message);
    res.status(500).json({ message: "Failed to fetch Aladin book detail" });
  }
};
