import React, { useState } from "react";
import axios from "axios";
import styles from "./ReviewSection.module.css";
import type { Review } from "../../types/review";

interface BookDetail {
  title: string;
  author?: string;
  image?: string;
  rating?: number;
}

interface ReviewSectionProps {
  isbn: string;
  book: BookDetail;
  reviews: Review[];
  fetchReviews: () => Promise<void>;
  isLoggedIn: boolean;
  currentUserNickname: string;
  currentUserId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  isbn,
  book,
  reviews,
  fetchReviews,
  isLoggedIn,
  currentUserId,
}) => {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState("");

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 리뷰 등록
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (userRating === null) {
      alert("평점을 입력해주세요!");
      return;
    }

    try {
      await axios.post(
        `${API}/api/reviews/${isbn}`,
        {
          rating: userRating,
          comment: userComment,
          title: book.title,
          author: book.author,
          image: book.image,
        },
        { withCredentials: true }
      );

      setUserRating(null);
      setUserComment("");
      await fetchReviews(); // ✅ 부모 상태 갱신
    } catch (err) {
      console.error("❌ 리뷰 등록 실패:", err);
    }
  };

  // ✅ 리뷰 수정
  const handleEdit = async (id: string) => {
    try {
      await axios.put(
        `${API}/api/reviews/${id}`,
        { comment: editingComment },
        { withCredentials: true }
      );
      setEditingId(null);
      setEditingComment("");
      await fetchReviews();
    } catch (err) {
      console.error("❌ 리뷰 수정 실패:", err);
      alert("리뷰 수정 중 오류가 발생했습니다.");
    }
  };

  // ✅ 리뷰 삭제
  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API}/api/reviews/${id}`, {
        withCredentials: true,
      });
      await fetchReviews();
    } catch (err) {
      console.error("❌ 리뷰 삭제 실패:", err);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.reviewSection}>
      <h3>💬 사용자 리뷰</h3>

      {/* ✅ 리뷰 작성 */}
      {isLoggedIn ? (
        <div className={styles.reviewForm}>
          <input
            type="number"
            min={1}
            max={10}
            placeholder="평점 (1~10)"
            value={userRating ?? ""}
            onChange={(e) => setUserRating(Number(e.target.value))}
          />
          <textarea
            placeholder="리뷰를 입력하세요"
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
          />
          <button onClick={handleSubmit}>등록</button>
        </div>
      ) : (
        <p className={styles.loginNotice}>✋ 리뷰 작성은 로그인 후 가능합니다.</p>
      )}

      {/* ✅ 리뷰 목록 */}
      <ul className={styles.reviewList}>
        {reviews.length === 0 ? (
          <p>아직 등록된 리뷰가 없습니다.</p>
        ) : (
          reviews.map((r) => (
            <li key={r._id} className={styles.reviewItem}>
              <p>
                <strong>{r.user.nickname}</strong> — ⭐ {r.rating} / 10
              </p>

              {editingId === r._id ? (
                <>
                  <textarea
                    value={editingComment}
                    onChange={(e) => setEditingComment(e.target.value)}
                  />
                  <div className={styles.buttons}>
                    <button onClick={() => handleEdit(r._id)}>저장</button>
                    <button onClick={() => setEditingId(null)}>취소</button>
                  </div>
                </>
              ) : (
                <>
                  <p>{r.comment}</p>

                  {/* ✅ 본인 리뷰만 수정/삭제 버튼 노출 */}
                  {r.user.id === currentUserId && (
                    <div className={styles.buttons}>
                      <button
                        onClick={() => {
                          setEditingId(r._id);
                          setEditingComment(r.comment);
                        }}
                      >
                        ✏️ 수정
                      </button>
                      <button onClick={() => handleDelete(r._id)}>🗑️ 삭제</button>
                    </div>
                  )}
                </>
              )}

              <small>
                {new Date(r.createdAt).toLocaleString("ko-KR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </small>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ReviewSection;
