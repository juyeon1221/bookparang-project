import { useEffect, useState } from "react";
import axios from "axios";
import StarRating from "../../StarRating/StarRating";
import styles from "./MyReviewList.module.css";
import type { Review } from "../../../types/review";

interface MyReviewListProps {
  isbn: string;
  refresh?: boolean;
}

export default function MyReviewList({ isbn, refresh }: MyReviewListProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 함수는 useEffect 밖으로 분리
  const fetchBookAndReviews = async () => {
    if (!isbn) return;
    try {
      const [bookRes, reviewRes] = await Promise.all([
        axios.get(`${API}/api/books/detail/${isbn}`),
        axios.get(`${API}/api/reviews/${isbn}`),
      ]);
      setBook(bookRes.data);
      setReviews(reviewRes.data);
    } catch (err) {
      console.error("❌ 책 및 리뷰 불러오기 실패:", err);
    }
  };

  // ✅ isbn 또는 refresh 변경 시 데이터 새로 불러오기
  useEffect(() => {
    fetchBookAndReviews();
  }, [isbn, refresh]);

  return (
    <div className={styles.reviewList}>
      {/* 책 정보 */}
      {book && (
        <div className={styles.bookHeader}>
          <img src={book.image} alt={book.title} className={styles.image} />
          <div className={styles.bookInfo}>
            <h3>{book.title}</h3>
            <p>
              {book.author} | {book.publisher} | {book.pubDate}
            </p>
          </div>
        </div>
      )}

      {/* 리뷰 목록 */}
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review._id} className={styles.item}>
            <div className={styles.starRating}>
              <StarRating rating={review.rating} />
            </div>
            <p className={styles.comment}>{review.comment}</p>
          </div>
        ))
      ) : (
        <p>아직 리뷰가 없습니다.</p>
      )}
    </div>
  );
}
