import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./BookDetailPage.module.css";
import BookInfo from "../../components/BookInfo/BookInfo";
import ReviewSection from "../../components/ReviewSection/ReviewSection";
import LogoutButton from "../../components/LogoutButton/LogoutButton";
import type { Review } from "../../types/review";

export interface BookDetail {
  isbn: string;
  title: string;
  author?: string;
  summary?: string;
  image?: string;
  salePrice?: number;
  listPrice?: number;
  discountRate?: number;
  rating?: number;
  category?: string;
}

const BookDetailPage: React.FC = () => {
  const { isbn } = useParams<{ isbn: string }>();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<{ nickname: string; userId: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [isFavorited, setIsFavorited] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 도서 상세 불러오기
  const fetchBook = useCallback(async () => {
    if (!isbn) return;
    try {
      const res = await axios.get(`${API}/api/books/detail/${isbn}`);
      setBook(res.data);
    } catch (err) {
      console.error("❌ 상세 도서 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [isbn]);

  // ✅ 리뷰 목록 불러오기
  const fetchReviews = useCallback(async () => {
    if (!isbn) return;
    try {
      const res = await axios.get(`${API}/api/reviews/${isbn}`);
      console.log("📥 리뷰 데이터 확인:", res.data);
      setReviews(res.data);
    } catch (err) {
      console.error("❌ 리뷰 목록 불러오기 실패:", err);
    }
  }, [isbn]);

  // ✅ 처음 진입 시 도서/리뷰 데이터 모두 로드
  useEffect(() => {
    fetchBook();
    fetchReviews();
  }, [fetchBook, fetchReviews]);

  // ✅ 로그인 사용자 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, {
          withCredentials: true, // ✅ 쿠키 전송 필요
        });

        setUser(res.data);
        setIsLoggedIn(true);
      } catch (err) {
        console.warn("❌ 로그인 정보 없음:", err);
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ 현재 유저의 찜 여부 확인
  const fetchFavoriteStatus = useCallback(async () => {
    if (!isbn || !isLoggedIn) return;
    try {
      const res = await axios.get(`${API}/api/wishlist/${isbn}`, {
        withCredentials: true,
      });
      setIsFavorited(res.data.isFavorited);
    } catch (err) {
      console.error("❌ 찜 상태 불러오기 실패:", err);
    }
  }, [isbn, isLoggedIn]);

  // ✅ 찜 등록 / 해제 토글
  const toggleFavorite = async () => {
    if (!isLoggedIn) {
      alert("로그인 후 이용해주세요 😄");
      return;
    }

    try {
      if (isFavorited) {
        await axios.delete(`${API}/api/wishlist/${isbn}`, {
          withCredentials: true,
        });
        setIsFavorited(false);
      } else {
        await axios.post(`${API}/api/wishlist/${isbn}`, {}, {
          withCredentials: true,
        });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("❌ 찜 토글 실패:", err);
    }
  };

  const addToCart = async (isbn: string) => {
    try {
      await axios.post(`${API}/api/cart/${isbn}`, {}, { withCredentials: true });
      alert("🛒 장바구니에 추가되었습니다!");
    } catch (err) {
      console.error("❌ 장바구니 추가 실패:", err);
      alert("장바구니 추가 중 오류가 발생했습니다 😢");
    }
  };

  // ✅ 찜 상태도 첫 진입 시 함께 불러오기
  useEffect(() => {
    fetchFavoriteStatus();
  }, [fetchFavoriteStatus]);

  if (loading) return <p>📖 도서 정보를 불러오는 중...</p>;
  if (!book) return <p>도서 정보를 찾을 수 없습니다 😢</p>;
  if (!isbn) return <p>잘못된 접근입니다 😢</p>;

  return (
    <div className={styles.container}>
      <LogoutButton />
      <div className={styles.favoriteArea}>
        <button onClick={toggleFavorite} className={styles.favoriteBtn}>
          {isFavorited ? "❤️ 찜 해제" : "🤍 찜하기"}
        </button>
        <button onClick={() => addToCart(book.isbn)} className={styles.cartBtn}>
          🛒 장바구니
        </button>
      </div>
      <BookInfo book={book} reviews={reviews} />
      <ReviewSection
        isbn={isbn}
        book={book}
        reviews={reviews}
        fetchReviews={fetchReviews}
        isLoggedIn={isLoggedIn}
        currentUserNickname={user?.nickname || ""}
        currentUserId={user?.userId || ""}
      />
    </div>
  );
};

export default BookDetailPage;
