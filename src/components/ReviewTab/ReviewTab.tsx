import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ReviewTab.module.css";

interface Review {
  _id?: string;
  bookIsbn: string;
  rating: number;
  comment: string;
}

interface PurchasedBook {
  bookIsbn: string;
  book?: { title: string; image?: string; author?: string };
}

const ReviewTab: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [purchasedBooks, setPurchasedBooks] = useState<PurchasedBook[]>([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchaseRes, reviewRes] = await Promise.all([
          axios.get("${API}/api/purchase/my", { withCredentials: true }),
          axios.get("${API}/api/reviews/my", { withCredentials: true }),
        ]);
        setPurchasedBooks(purchaseRes.data);
        setReviews(reviewRes.data);
      } catch (err) {
        console.error("❌ 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ 리뷰 내용 변경
  const handleChange = <K extends "rating" | "comment">(
    isbn: string,
    field: K,
    value: K extends "rating" ? number : string
  ) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.bookIsbn === isbn ? { ...r, [field]: value } : r
      )
    );
  };

  // ✅ 리뷰 등록/수정
  const saveReview = async (isbn: string) => {
    const target = reviews.find((r) => r.bookIsbn === isbn);
    if (!target) return;

    try {
      if (target._id) {
        await axios.put(
          `${API}/api/reviews/${target._id}`,
          target,
          { withCredentials: true }
        );
        alert("✏️ 리뷰가 수정되었습니다!");
      } else {
        await axios.post(
          `${API}/api/reviews`,
          target,
          { withCredentials: true }
        );
        alert("✅ 리뷰가 등록되었습니다!");
      }
    } catch (err) {
      console.error("❌ 리뷰 저장 실패:", err);
      alert("리뷰 저장 중 오류가 발생했습니다 😢");
    }
  };

  // ✅ 리뷰 삭제
  const deleteReview = async (isbn: string) => {
    const target = reviews.find((r) => r.bookIsbn === isbn);
    if (!target || !target._id) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API}/api/reviews/${target._id}`, {
        withCredentials: true,
      });
      setReviews((prev) => prev.filter((r) => r.bookIsbn !== isbn));
      alert("🗑️ 리뷰가 삭제되었습니다!");
    } catch (err) {
      console.error("❌ 리뷰 삭제 실패:", err);
    }
  };

  if (loading) return <p>⏳ 불러오는 중...</p>;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>✍️ 리뷰관리</h3>

      {purchasedBooks.map((p) => {
        const review =
          reviews.find((r) => r.bookIsbn === p.bookIsbn) ||
          { bookIsbn: p.bookIsbn, rating: 0, comment: "" };

        return (
          <div key={p.bookIsbn} className={styles.item}>
            <img src={p.book?.image} alt={p.book?.title} className={styles.image} />

            <div className={styles.info}>
              <h4>{p.book?.title}</h4>
              <p>{p.book?.author}</p>

              <div className={styles.rating}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={n <= review.rating ? styles.starActive : styles.star}
                    onClick={() => handleChange(p.bookIsbn, "rating", n)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                value={review.comment}
                placeholder="내용을 입력해주세요"
                onChange={(e) =>
                  handleChange(p.bookIsbn, "comment", e.target.value)
                }
                className={styles.textarea}
              />

              <div className={styles.actions}>
                <button onClick={() => saveReview(p.bookIsbn)}>
                  {review._id ? "리뷰 수정" : "리뷰 작성"}
                </button>
                {review._id && (
                  <button onClick={() => deleteReview(p.bookIsbn)}>삭제</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewTab;
