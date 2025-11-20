import { useState } from "react";
import axios from "axios";
import styles from "./ReviewForm.module.css";

export default function ReviewForm({ isbn, book, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const API = import.meta.env.VITE_API_URL ?? "";


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isbn || !book) return;

    try {
      await axios.post(
        `${API}/api/reviews/${isbn}`,
        {
          rating,
          comment,
          title: book.title,
          author: book.author,
          image: book.image,
        },
        {
          withCredentials: true, // ✅ 로그인 쿠키 전송
        }
      );

      alert("리뷰가 등록되었습니다!");
      setRating(0);
      setComment("");
      if (onReviewAdded) onReviewAdded(); // ✅ 새로고침 트리거
    } catch (err) {
      console.error("❌ 리뷰 등록 실패:", err);
      alert("리뷰 등록 중 오류가 발생했습니다 😢");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        별점 (1~10)
        <input
          type="number"
          value={rating}
          min="1"
          max="10"
          onChange={(e) => setRating(Number(e.target.value))}
        />
      </label>
      <textarea
        placeholder="리뷰 내용을 입력하세요"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit">리뷰 등록</button>
    </form>
  );
}
