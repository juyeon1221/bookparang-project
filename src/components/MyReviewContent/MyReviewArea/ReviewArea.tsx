import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ReviewArea.module.css";
import ReviewItem from "../ReviewItem/ReviewItem";
import ReviewWriteForm from "../ReviewWriteForm/ReviewWriteForm";
import type { Purchase } from "../../../types/purchase";
import type { Review } from "../../../types/review";

export default function ReviewArea() {
  const [purchasedBooks, setPurchasedBooks] = useState<Purchase[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [refresh, setRefresh] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "";

  /** ✅ 구매 목록 불러오기 */
  const fetchPurchasedBooks = async () => {
    try {
      const res = await axios.get(`${API}/api/purchase/my`, { withCredentials: true });
      setPurchasedBooks(res.data);
    } catch (err) {
      console.error("❌ 구매 목록 불러오기 실패:", err);
    }
  };

  /** ✅ 내 리뷰 불러오기 */
  const fetchMyReviews = async () => {
    try {
      const res = await axios.get(`${API}/api/reviews/me`, { withCredentials: true });
      setReviews(res.data);
    } catch (err) {
      console.error("❌ 내 리뷰 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchPurchasedBooks();
    fetchMyReviews();
  }, [refresh]);

  /** ✅ ISBN 정규화 + 매칭 */
  const getReviewByIsbn = (isbn: string) =>
    reviews.find(
      (r) =>
        String(r.isbn).trim() === String(isbn).trim() ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        String((r as any).bookIsbn || "").trim() === String(isbn).trim()
    );

  /** 디버깅 로그 */
  useEffect(() => {
    console.log("🧾 구매 목록:", purchasedBooks);
    console.log("🧾 내 리뷰 목록:", reviews);
  }, [purchasedBooks, reviews]);

  return (
    <main className={styles.content}>
      <h2>구매도서</h2>

      {purchasedBooks.map((purchase) => {
        const book = purchase.book;
        if (!book) {
          console.warn("⚠️ book 정보가 없는 purchase:", purchase);
          return null;
        }

        const existingReview = getReviewByIsbn(book.isbn);

        console.log(
          `📘 현재 책: ${book.title} | ISBN: ${book.isbn} | 리뷰: ${
            existingReview ? "있음 ✅" : "없음 ✏️"
          }`
        );

        return (
          <div key={book.isbn} className={styles.bookBlock}>
            <img src={book.image} alt={book.title} className={styles.image} />
            <div className={styles.bookInfo}>
              <h3>{book.title}</h3>
              <p>{book.author}</p>

              {existingReview ? (
                <ReviewItem
                  key={`review-${existingReview._id || book.isbn}`}
                  review={existingReview}
                  onUpdated={() => setRefresh(!refresh)}
                />
              ) : (
                <ReviewWriteForm
                  key={`write-${book.isbn}`}
                  book={book}
                  onAdded={() => setRefresh(!refresh)}
                />
              )}
            </div>
          </div>
        );
      })}
    </main>
  );
}
