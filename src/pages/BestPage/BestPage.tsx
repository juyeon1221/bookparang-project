import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./BestPage.module.css";
import type { Book } from "../../types/books";
import BookTile from "../../components/BookTile/BookTile";

interface Review {
  rating: number;
  comment?: string;
  user?: string;
}

const BestPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [reviewAverages, setReviewAverages] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 로그인 확인
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/users/me`, {
        withCredentials: true,
      });
      if (res.data) setIsLoggedIn(true);
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  // ✅ 찜 불러오기
  const fetchFavorites = useCallback(
    async (bookList: Book[]) => {
      if (!isLoggedIn) return;

      const favMap: Record<string, boolean> = {};
      await Promise.all(
        bookList.map(async (book) => {
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
    },
    [isLoggedIn]
  );

  // ✅ 찜 토글
  const toggleFavorite = async (isbn: string) => {
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
        await axios.post(`${API}/api/wishlist/${isbn}`, {}, { withCredentials: true });
        setFavorites((prev) => ({ ...prev, [isbn]: true }));
      }
    } catch (err) {
      console.error("❌ 찜 토글 실패:", err);
    }
  };

  // ✅ 장바구니 추가
  const addToCart = async (isbn: string) => {
    try {
      await axios.post(`${API}/api/cart/${isbn}`, {}, { withCredentials: true });
      alert("🛒 장바구니에 추가되었습니다!");
    } catch (err) {
      console.error("❌ 장바구니 추가 실패:", err);
      alert("장바구니 추가 중 오류가 발생했습니다 😢");
    }
  };

  // ✅ 베스트셀러 불러오기
  useEffect(() => {
    const fetchBestsellers = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get<Book[]>(`${API}/api/books/bestseller`);
        const fetchedBooks = res.data;
        setBooks(Array.isArray(fetchedBooks) ? fetchedBooks : []);

        // 리뷰 평균 계산
        const avgMap: Record<string, number> = {};
        await Promise.all(
          fetchedBooks.map(async (book) => {
            try {
              const res = await axios.get<Review[]>(`${API}/api/reviews/${book.isbn}`);
              const reviews = res.data;
              if (reviews.length > 0) {
                const avgUserRating =
                  reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                const combined = ((book.rating ?? 0) + avgUserRating) / 2;
                avgMap[book.isbn] = Number(combined.toFixed(1));
              }
            } catch {
              /* 리뷰 없으면 무시 */
            }
          })
        );
        setReviewAverages(avgMap);

        // 찜 상태 및 로그인 확인
        await fetchUser();
        await fetchFavorites(fetchedBooks);
      } catch (err) {
        console.error("❌ 베스트셀러 불러오기 실패:", err);
        setError("베스트셀러 목록을 불러오는 중 문제가 발생했습니다 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, [fetchUser, fetchFavorites]);

  if (loading) return <p className={styles.message}>🔥 베스트셀러를 불러오는 중...</p>;
  if (error) return <p className={`${styles.message} ${styles.error}`}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔥 베스트셀러</h2>
      {books.length === 0 ? (
        <p className={styles.message}>표시할 베스트셀러가 없습니다.</p>
      ) : (
        <ul className={styles.grid}>
          {books.map((book) => {
            const displayRating = reviewAverages[book.isbn] ?? book.rating ?? null;
            const isFavorited = favorites[book.isbn];

            return (
              <li key={book.isbn}>
                <BookTile
                  book={book}
                  reviewAverage={displayRating ?? undefined}
                  isFavorited={isFavorited}
                  onFavorite={toggleFavorite}
                  onAddCart={addToCart}
                  onClick={() => navigate(`/book/${book.isbn}`)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BestPage;
