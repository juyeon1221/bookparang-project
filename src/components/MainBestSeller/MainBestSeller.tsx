import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BookCard from "./BookCard";
import SkeletonBookCard from "./SkeletonBookCard";
import styles from "./MainBestSeller.module.css";
import type { Book } from "../../types/books";

// ✅ 서버 데이터
const ebookCategories = [
  { id: 1, name: "소설" },
  { id: 55889, name: "시/에세이" },
  { id: 170, name: "경제경영" },
  { id: 336, name: "자기계발" },
  { id: 987, name: "인문학" },
  { id: 798, name: "사회과학" },
  { id: 74, name: "역사" },
  { id: 517, name: "예술/대중문화" },
  { id: 1230, name: "과학" },
  { id: 351, name: "IT 모바일" },
  { id: 1322, name: "외국어" },
  { id: 1108, name: "어린이" },
  { id: 1137, name: "청소년" },
  { id: 1196, name: "여행" },
  { id: 1237, name: "요리" },
  { id: 5174, name: "건강" },
  { id: 2030, name: "가정/생활" },
  { id: 76000, name: "수험서" },
];

// ✅ 메인에 표시할 카테고리만 일부
const previewCategories = ebookCategories.slice(0, 10);

export default function MainBestSeller() {
  const [activeTab, setActiveTab] = useState("종합 베스트셀러");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 베스트셀러 불러오기
  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ 종합이면 파라미터 없이, 아니면 category 이름으로
        const selectedCategory = ebookCategories.find(
          (cat) => cat.name === activeTab
        );
        const params =
          activeTab === "종합 베스트셀러"
            ? {}
            : { category: selectedCategory?.name };

        console.log("📚 현재 탭:", activeTab);
        console.log("📦 선택된 카테고리:", selectedCategory);
        console.log("🛰️ 요청 params:", params);

        const res = await axios.get<Book[]>(
          `${API}/api/books/bestseller`,
          { params }
        );

        const mapped = res.data
          .filter((b) => b.isbn)
          .map((b, i) => ({
            ...b,
            isbn: b.isbn ?? `temp-${i}`,
            image:
              b.image ??
              `https://placehold.co/150?text=${encodeURIComponent(
                b.title.slice(0, 12)
              )}`
            ,
          }));

        setBooks(mapped.slice(0, 12)); // ✅ 12권만 표시
      } catch (err) {
        console.error("❌ 베스트셀러 불러오기 실패:", err);
        setError("도서 데이터를 불러오지 못했습니다 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [activeTab]);

  const handleTabClick = (cat: string) => {
    if (cat === "+더보기") navigate("/bestseller");
    else setActiveTab(cat);
  };

  return (
    <div className={styles.bestSellerSection}>
      <p className={styles.subMent}>사람들에게 가장 사랑받은</p>
      <h2 className={styles.mainTitle}>베스트 셀러</h2>

      {/* ✅ 카테고리 탭 */}
      <div className={styles.categoryTabsWrapper}>
        <ul className={styles.categoryTabs}>
          <li
            className={`${styles.tab} ${activeTab === "종합 베스트셀러" ? styles.active : ""
              }`}
            onClick={() => handleTabClick("종합 베스트셀러")}
          >
            종합
          </li>

          {previewCategories.map((cat) => (
            <li
              key={cat.id}
              className={`${styles.tab} ${activeTab === cat.name ? styles.active : ""
                }`}
              onClick={() => handleTabClick(cat.name)}
            >
              {cat.name}
            </li>
          ))}

          <li
            className={`${styles.tab} ${styles.moreTab}`}
            onClick={() => handleTabClick("+더보기")}
          >
            +더보기
          </li>
        </ul>
      </div>

      {/* ✅ 도서 리스트 or 스켈레톤 */}
      <div className={styles.bookList}>
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <SkeletonBookCard key={i} />
          ))
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : books.length > 0 ? (
          books.map((book, index) => (
            <BookCard key={book.isbn} book={book} rank={index + 1} />
          ))
        ) : (
          <p className={styles.loading}>표시할 도서가 없습니다 😢</p>
        )}
      </div>
    </div>
  );
}
