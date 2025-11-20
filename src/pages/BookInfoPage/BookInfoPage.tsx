import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookDetailTop from "../../components/BookDetailTop/BookDetailTop";
import BookDetailTabs from "../../components/BookDetailTabs/BookDetailTabs";
import type { Book } from "../../types/books";
import type { Review } from "../../types/review";
import styles from "./BookInfoPage.module.css";

export default function BookInfoPage() {
  const { isbn } = useParams<{ isbn: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 평균 평점 계산
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // ✅ 도서 상세 불러오기
  const fetchBook = useCallback(async () => {
    if (!isbn) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/books/detail/${isbn}`);
      setBook(res.data);
      setError(null);
    } catch (err) {
      console.error("❌ 도서 상세 불러오기 실패:", err);
      setError("도서 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isbn]);

  // ✅ 리뷰 불러오기
  const fetchReviews = useCallback(async () => {
    if (!isbn) return;
    try {
      const res = await axios.get(`${API}/api/reviews/${isbn}`);
      setReviews(res.data);
    } catch (err) {
      console.error("❌ 리뷰 목록 불러오기 실패:", err);
    }
  }, [isbn]);

  // ✅ 리뷰 등록 함수
  const handleAddReview = async (reviewData: { rating: number; content: string }) => {
    if (!isbn) return;
    try {
      await axios.post(
        `${API}/api/reviews/${isbn}`,
        {
          rating: reviewData.rating,
          comment: reviewData.content, // ✅ comment 필드
          title: book?.title,
          author: book?.author,
          image: book?.image,
        },
        {
          withCredentials: true, // ✅ 쿠키 전송 허용
        }
      );

      alert("리뷰가 등록되었습니다!");
      fetchReviews(); // 새 리뷰 반영
    } catch (err) {
      console.error("❌ 리뷰 등록 실패:", err);
      alert("리뷰 등록 중 오류가 발생했습니다 😢");
    }
  };

  // ✅ 찜 토글 함수 (연결 가능 자리만 확보)
  const toggleFavorite = async () => {
    if (!book) return;
    try {
      setIsFavorited((prev) => !prev);
    } catch (err) {
      console.error("❌ 찜 토글 실패:", err);
    }
  };

  // ✅ 장바구니 추가 (연결 가능 자리만 확보)
  const addToCart = async (isbn: string) => {
    try {
      await axios.post(`${API}/api/cart/${isbn}`, {}, { withCredentials: true });
      alert("🛒 장바구니에 추가되었습니다!");
    } catch (err) {
      console.error("❌ 장바구니 추가 실패:", err);
      alert("장바구니 추가 중 오류가 발생했습니다 😢");
    }
  };

  // ✅ 첫 진입 시 도서 + 리뷰 로드
  useEffect(() => {
    fetchBook();
    fetchReviews();
  }, [fetchBook, fetchReviews]);

  // ✅ 로딩 / 에러 / 데이터 없을 때
  if (loading) return <p className={styles.loading}>📚 도서 정보를 불러오는 중...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!book) return <p className={styles.empty}>도서 정보를 찾을 수 없습니다 😢</p>;

  return (
    <div className={styles.container}>
      {/* 도서 상단 */}
      <BookDetailTop
        book={book}
        averageRating={averageRating / 2}
        reviewCount={reviews.length}
        isFavorited={isFavorited}
        toggleFavorite={toggleFavorite}
        addToCart={() => addToCart(book.isbn)}
      />

      {/* 도서 정보 / 리뷰 탭 */}
      <BookDetailTabs
        book={book}
        reviews={reviews}
        setReviews={setReviews}
        averageRating={averageRating / 2}
        onAddReview={handleAddReview}
        currentUser="사용자"
      />
    </div>
  );
}
