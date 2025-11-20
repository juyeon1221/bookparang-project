// src/pages/CategoryPage/CategoryPage.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import LayoutFilter from "../../components/LayoutFilter/LayoutFilter";
import BookTile from "../../components/BookTile/BookTile";
import BookRow from "../../components/BookRow/BookRow";
import styles from "../NewBookPage/NewBookPage.module.css";
import type { Book } from "../../types/books";
import type { Review } from "../../types/review";
import { categoryIdMap } from "../../data/categoryIdMap";

export default function CategoryPage() {
  const [view, setView] = useState<"list" | "card">("list");
  const [books, setBooks] = useState<Book[]>([]);
  const [favorites] = useState<Record<string, boolean>>({});
  const [reviewAverages, setReviewAverages] = useState<Record<string, number>>({});
  const [, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("전체 도서");

  const [searchParams] = useSearchParams();

  const [sort, setSort] = useState<"latest" | "priceAsc" | "priceDesc" | "rating">("latest");

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ URL의 categoryId → category 이름 매핑
  useEffect(() => {
    const idFromUrl = searchParams.get("category");
    if (idFromUrl) {
      const matchedCategory = Object.entries(categoryIdMap).find(
        ([, id]) => id.toString() === idFromUrl
      );
      if (matchedCategory) {
        setSelectedCategory(matchedCategory[0]);
      }
    }
  }, [searchParams]);

  // ✅ 도서 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 로그인 상태 확인
        try {
          const res = await axios.get(`${API}/api/users/me`, {
            withCredentials: true,
          });
          setIsLoggedIn(!!res.data);
        } catch {
          setIsLoggedIn(false);
        }

        const params =
          selectedCategory === "전체 도서"
            ? { sort }
            : { category: selectedCategory, sort };

        const res = await axios.get<Book[]>(
          `${API}/api/books/all`,
          { params }
        );

        const mappedBooks: Book[] = res.data
          .filter((b) => b.isbn)
          .map((b, index) => ({
            isbn: b.isbn ?? `temp-isbn-${index}`,
            title: b.title,
            author: b.author,
            salePrice: b.salePrice ?? 0,
            listPrice: b.listPrice ?? b.salePrice ?? 0,
            discountRate: b.discountRate ?? 0,
            rating: b.rating ?? 0,
            image:
              b.image ??
              `https://via.placeholder.com/150?text=${encodeURIComponent(
                b.title.slice(0, 15)
              )}`,
            publisher: b.publisher ?? "",
            pubDate: b.pubDate ?? "",
            comment: b.comment ?? "",
            category: b.category ?? "기타",
          }));

        setBooks(mappedBooks);

        // 리뷰 평균
        const avgMap: Record<string, number> = {};
        await Promise.all(
          mappedBooks.map(async (book) => {
            try {
              const res = await axios.get<Review[]>(
                `${API}/api/reviews/${book.isbn}`
              );
              const reviews = res.data;
              if (reviews.length > 0) {
                const avg =
                  reviews.reduce((acc, r) => acc + r.rating, 0) /
                  reviews.length;
                avgMap[book.isbn] = Number(avg.toFixed(1));
              }
            } catch {
              // err
            }
          })
        );
        setReviewAverages(avgMap);
      } catch (err) {
        console.error("❌ 데이터 불러오기 실패:", err);
        setError("카테고리 도서를 불러오지 못했습니다 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, sort]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📚 {selectedCategory}</h2>
      <Sidebar
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
        mainTitle="전체 도서"
        subTitle="카테고리"
        defaultCategory="전체 도서"
      />

      <LayoutFilter
        view={view}
        onChange={setView}
        sort={sort}
        onSortChange={setSort}
      />

      {loading && <p className={styles.loading}>불러오는 중...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && books.length > 0 && (
        <div className={styles.bookList}>
          {view === "list" ? (
            books.map((book) => (
              <BookRow
                key={book.isbn}
                book={book}
                showRank={false}
                isFavorited={favorites[book.isbn] ?? false}
                onFavorite={() => { }}
                onAddCart={() => { }}
                reviewAverage={reviewAverages[book.isbn] ?? undefined}
              />
            ))
          ) : (
            <div className={styles.tileGrid}>
              {books.map((book) => (
                <BookTile
                  key={book.isbn}
                  book={book}
                  isFavorited={favorites[book.isbn] ?? false}
                  onFavorite={() => { }}
                  onAddCart={() => { }}
                  reviewAverage={reviewAverages[book.isbn] ?? undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
