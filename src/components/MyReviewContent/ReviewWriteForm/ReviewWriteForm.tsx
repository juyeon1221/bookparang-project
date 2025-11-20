import { useState } from "react";
import axios from "axios";
import styles from "./ReviewWriteForm.module.css";
import StarRating from "../../StarRating/StarRating";

export default function ReviewWriteForm({ book, onAdded }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const API = import.meta.env.VITE_API_URL ?? "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/api/reviews/${book.isbn}`,
        {
          rating,
          comment,
          title: book.title,
          author: book.author,
          image: book.image,
        },
        { withCredentials: true }
      );
      alert("리뷰가 등록되었습니다!");
      setRating(0);
      setComment("");
      onAdded();
    } catch (err) {
      console.error("❌ 리뷰 등록 실패:", err);
    }
  };

  return (
    <form className={styles.reviewWrite} onSubmit={handleSubmit}>
      {/* 별점 */}
      <div className={styles.starRating}>
        <StarRating rating={rating} onClick={(val) => setRating(val)} />
      </div>

      {/* 리뷰 내용 */}
      <textarea
        className={styles.textarea}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="리뷰를 작성하세요"
      />

      {/* 버튼 */}
      <div className={styles.buttonWrap}>
        <button type="submit" className={styles.submitBtn}>
          리뷰 등록
        </button>
      </div>
    </form>
  );
}
