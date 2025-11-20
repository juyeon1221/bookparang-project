import { useState } from "react";
import axios from "axios";
import styles from "./ReviewItem.module.css";
import StarRating from "../../StarRating/StarRating";

export default function ReviewItem({ review, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(review.comment);
  const [rating, setRating] = useState(review.rating);

  const API = import.meta.env.VITE_API_URL ?? "";

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API}/api/reviews/${review._id}`,
        { comment, rating },
        { withCredentials: true }
      );
      alert("리뷰가 수정되었습니다!");
      setEditing(false);
      onUpdated();
    } catch (err) {
      console.error("❌ 리뷰 수정 실패:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(
        `${API}/api/reviews/${review._id}`,
        { withCredentials: true }
      );
      alert("리뷰가 삭제되었습니다!");
      onUpdated();
    } catch (err) {
      console.error("❌ 리뷰 삭제 실패:", err);
    }
  };

  return (
    <div className={styles.reviewItem}>
      {editing ? (
        <div className={styles.editing}>
          <div className={styles.starRating}>
            <StarRating rating={rating} onClick={(val) => setRating(val)} />
          </div>

          <textarea
            className={styles.textarea}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className={styles.buttons}>
            <button className={styles.editBtn} onClick={handleUpdate}>
              저장
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => setEditing(false)}
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.starRating}>
            <StarRating rating={review.rating} />
          </div>
          <p className={styles.comment}>{review.comment}</p>

          <div className={styles.buttons}>
            <button className={styles.editBtn} onClick={() => setEditing(true)}>
              수정
            </button>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
