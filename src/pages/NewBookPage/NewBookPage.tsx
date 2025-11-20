import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import LayoutFilter from "../../components/LayoutFilter/LayoutFilter";
import BookTile from "../../components/BookTile/BookTile";
import BookRow from "../../components/BookRow/BookRow";
import styles from "./NewBookPage.module.css";
import type { Book } from "../../types/books";
import type { Review } from "../../types/review";

export default function NewBookPage() {
  const [view, setView] = useState<"list" | "card">("list");
  const [books, setBooks] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [reviewAverages, setReviewAverages] = useState<Record<string, number>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("종합 신간");
  const [sort, setSort] = useState<"latest" | "priceAsc" | "priceDesc" | "rating">("latest");

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 찜 토글
  const toggleFavorite = async (isbn: string | undefined) => {
    if (!isbn) {
      alert("ISBN 정보가 없어 찜 기능을 사용할 수 없습니다 😢");
      return;
    }
    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요 😄");
      return;
    }

    try {
      if (favorites[isbn]) {
        await axios.delete(`${API}/api/wishlist/${isbn}`, {
          withCredentials: true,
        });
        setFavorites((prev) => ({ ...prev, [isbn]: false }));
      } else {
        await axios.post(
          `${API}/api/wishlist/${isbn}`,
          {},
          { withCredentials: true }
        );
        setFavorites((prev) => ({ ...prev, [isbn]: true }));
      }
    } catch (err) {
      console.error("❌ 찜 토글 실패:", err);
    }
  };

  // ✅ 장바구니 추가
  const addToCart = async (isbn: string | undefined) => {
    if (!isbn) {
      alert("ISBN 정보가 없어 장바구니에 담을 수 없습니다 😢");
      return;
    }

    try {
      await axios.post(
        `${API}/api/cart/${isbn}`,
        {},
        { withCredentials: true }
      );
      alert("🛒 장바구니에 추가되었습니다!");
    } catch (err) {
      console.error("❌ 장바구니 추가 실패:", err);
      alert("장바구니 추가 중 오류가 발생했습니다 😢");
    }
  };

  // ✅ 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ 로그인 상태 확인
        try {
          const res = await axios.get(`${API}/api/users/me`, {
            withCredentials: true,
          });
          setIsLoggedIn(!!res.data);
        } catch {
          setIsLoggedIn(false);
        }

        // ✅ 신간 도서 불러오기 (카테고리별)
        const params =
          selectedCategory === "종합 신간"
            ? { sort } // ✅ 정렬 기준 추가
            : { category: selectedCategory, sort }; // ✅ 정렬 기준 추가

        const res = await axios.get<Book[]>(
          `${API}/api/books/new`,
          { params }
        );

        console.log("📡 요청 카테고리:", selectedCategory, params);

        // ✅ ISBN 없는 책 필터링
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
              `https://placehold.co/150?text=${encodeURIComponent(
                b.title.slice(0, 15)
              )}`,
            publisher: b.publisher ?? "",
            pubDate: b.pubDate ?? "",
            comment: b.comment ?? "",
            category: b.category ?? "기타",
          }));

        console.log("📚 ISBN 필터링 후 도서 수:", mappedBooks.length);
        setBooks(mappedBooks);

        // ✅ 리뷰 평균 불러오기
        const avgMap: Record<string, number> = {};
        await Promise.all(
          mappedBooks.map(async (book) => {
            if (!book.isbn) return;

            try {
              const res = await axios.get<Review[]>(
                `${API}/api/reviews/${book.isbn}`
              );
              const reviews = res.data;
              if (reviews.length > 0) {
                const avgRating =
                  reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                avgMap[book.isbn] = Number(avgRating.toFixed(1));
              }
            } catch {
              /* 리뷰 없으면 무시 */
            }
          })
        );
        setReviewAverages(avgMap);

        // ✅ 찜 상태 불러오기
        if (isLoggedIn) {
          const favMap: Record<string, boolean> = {};
          await Promise.all(
            mappedBooks.map(async (book) => {
              if (!book.isbn) return;
              try {
                const res = await axios.get(
                  `${API}/api/wishlist/${book.isbn}`,
                  { withCredentials: true }
                );
                favMap[book.isbn] = res.data.isFavorited;
              } catch {
                favMap[book.isbn] = false;
              }
            })
          );
          setFavorites(favMap);
        } else {
          setFavorites({});
        }
      } catch (err) {
        console.error("❌ 데이터 불러오기 실패:", err);
        setError("신간 도서를 불러오지 못했습니다 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sort]);

  // ✅ 로딩 / 에러 처리
  if (loading)
    return <p className={styles.loading}>📚 신간 도서를 불러오는 중...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <>
      <div className={styles.container}>
        <h2 className={styles.title}>🆕 {selectedCategory}</h2>
        <div className={styles.line} />
      </div>

      <Sidebar
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
        mainTitle="종합 신간"
        subTitle="카테고리"
        defaultCategory="종합 신간"
      />

      <LayoutFilter
        view={view}
        onChange={setView}
        sort={sort}
        onSortChange={setSort}
      />

      {books.length > 0 ? (
        <div className={styles.bookList}>
          {view === "list" ? (
            books.slice(0, 15).map((book) => (
              <BookRow
                key={book.isbn}
                book={book}
                showRank={false}
                isFavorited={favorites[book.isbn] ?? false}
                onFavorite={toggleFavorite}
                onAddCart={addToCart}
                reviewAverage={reviewAverages[book.isbn] ?? undefined}
              />
            ))
          ) : (
            <div className={styles.tileGrid}>
              {books.slice(0, 15).map((book) => (
                <BookTile
                  key={book.isbn}
                  book={book}
                  isFavorited={favorites[book.isbn] ?? false}
                  onFavorite={toggleFavorite}
                  onAddCart={addToCart}
                  reviewAverage={reviewAverages[book.isbn] ?? undefined}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className={styles.loading}>표시할 도서가 없습니다 😢</p>
      )}
    </>
  );
}
