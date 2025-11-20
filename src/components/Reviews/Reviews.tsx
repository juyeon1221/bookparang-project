import { useEffect, useState } from "react";
import StarRating from "../StarRating/StarRating";
import styles from "./Reviews.module.css";
import type { Review } from "../../types/review";

interface Props {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  averageRating: number;
  onAddReview: (reviewData: { rating: number; content: string }) => Promise<void> | void;
  currentUser?: string;
}

export default function Reviews({
  reviews,
  setReviews,
  averageRating,
  onAddReview,
  currentUser = "사용자",
}: Props) {
  const [sortBy, setSortBy] = useState<"latest" | "rating" | "helpful">("latest");
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());

  const API = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    const stored = localStorage.getItem("likedReviews");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        const validLiked = parsed.filter((id) =>
          reviews.some((r) => r._id === id)
        );
        // ✅ setTimeout으로 렌더 후 반영 (렌더 타이밍 문제 해결)
        setTimeout(() => setLikedReviewIds(new Set(validLiked)), 0);
      } catch {
        console.warn("likedReviews 복원 실패");
      }
    }
  }, [reviews]);

  /* ✅ likedReviewIds 변경 시 localStorage 저장 */
  useEffect(() => {
    localStorage.setItem("likedReviews", JSON.stringify(Array.from(likedReviewIds)));
  }, [likedReviewIds]);

  // ✅ 리뷰 정렬
  const getSortedReviews = (): Review[] => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "helpful") return (b.helpful ?? 0) - (a.helpful ?? 0);
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
  };

  // ✅ 리뷰 등록
  const handleSubmitReview = async () => {
    if (!reviewText.trim() || userRating === 0) {
      alert("리뷰 내용과 평점을 모두 입력해주세요.");
      return;
    }

    try {
      const serverRating = userRating * 2;
      await onAddReview({
        rating: serverRating,
        content: reviewText.trim(),
      });

      const newReview: Review = {
        _id: crypto.randomUUID(),
        isbn: "",
        rating: serverRating,
        comment: reviewText.trim(),
        user: { id: "me", nickname: currentUser },
        helpful: 0,
        createdAt: new Date().toISOString(),
      };

      setReviews([newReview, ...reviews]);
      setReviewText("");
      setUserRating(0);
      alert("리뷰가 등록되었습니다!");
    } catch (err) {
      console.error("❌ 리뷰 등록 실패:", err);
      alert("리뷰 등록 중 오류가 발생했습니다.");
    }
  };

  // ✅ 좋아요 토글
  const toggleLikeReview = async (reviewId: string) => {
    try {
      const res = await fetch(`${API}/api/reviews/${reviewId}/helpful`, {
        method: "POST",
        credentials: "include",   // ⭐ 쿠키 포함
      });

      if (!res.ok) throw new Error("좋아요 반영 실패");

      const data: { helpful: number; liked: boolean } = await res.json();

      setReviews(reviews.map((r) =>
        r._id === reviewId ? { ...r, helpful: data.helpful } : r
      ));

      setLikedReviewIds((prev) => {
        const updated = new Set(prev);
        if (data.liked) updated.add(reviewId);
        else updated.delete(reviewId);
        return updated;
      });

    } catch (err) {
      console.error("❌ 좋아요 반영 실패:", err);
    }
  };


  // ✅ 리뷰 삭제
  const handleDeleteReview = async (reviewId: string, authorNickname: string) => {
    if (authorNickname !== currentUser) {
      alert("본인 리뷰만 삭제할 수 있습니다.");
      return;
    }
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("삭제 실패");

      setReviews(reviews.filter((r) => r._id !== reviewId));
      setLikedReviewIds((prev) => {
        const updated = new Set(prev);
        updated.delete(reviewId);
        return updated;
      });

      alert("리뷰가 삭제되었습니다.");
    } catch (err) {
      console.error("❌ 리뷰 삭제 실패:", err);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 신고 (UI용)
  const handleReportReview = () => alert("리뷰가 신고되었습니다.");

  // ✅ 날짜 포맷
  const formatDate = (dateString: string) => ({
    full: new Date(dateString).toLocaleDateString("ko-KR"),
    short: new Date(dateString)
      .toLocaleDateString("ko-KR")
      .replace(/^(\d{4})/, (match) => match.slice(-2)),
  });

  return (
    <div className={styles.container}>
      {/* ✅ 리뷰 요약 */}
      <div className={styles.reviewSummary}>
        <h3>리뷰 요약</h3>
        <div className={styles.ratingInfo}>
          <StarRating rating={averageRating} />
          <span className={styles.averageScore}>
            평균 {averageRating.toFixed(1)}점
          </span>
        </div>
      </div>

      {/* ✅ 리뷰 작성 */}
      <div className={styles.writeReview}>
        <textarea
          className={styles.reviewTextarea}
          placeholder="이 책에 대한 리뷰를 작성해주세요."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <div className={styles.reviewActions}>
          <div className={styles.starRatingWrapper}>
            <StarRating rating={userRating} onClick={setUserRating} />
          </div>
          <span className={styles.ratingLabel}>
            이 책은 어떠셨나요? 별점을 남겨주세요
          </span>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmitReview}
          >
            리뷰 등록
          </button>
        </div>
      </div>

      {/* ✅ 정렬 */}
      <div className={styles.sortBar}>
        <label>정렬: </label>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "latest" | "rating" | "helpful")
          }
        >
          <option value="latest">최신순</option>
          <option value="rating">평점순</option>
          <option value="helpful">도움순</option>
        </select>
      </div>

      {/* ✅ 리뷰 목록 */}
      <div className={styles.reviewList}>
        {getSortedReviews().map((review) => {
          const formattedDate = formatDate(review.createdAt);
          const isMine = review.user.nickname === currentUser;
          const liked = likedReviewIds.has(review._id);

          return (
            <div key={review._id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.authorWrapper}>
                  <span className={styles.author}>{review.user.nickname}</span>
                </div>
                <div className={styles.ratingAndMeta}>
                  <div className={styles.rating}>
                    <StarRating rating={review.rating / 2} />
                    <span>({(review.rating / 2).toFixed(1)})</span>
                  </div>
                  <div className={styles.reviewMeta}>
                    <span className={styles.date}>
                      <span className={styles.dateDesktop}>{formattedDate.full}</span>
                      <span className={styles.dateMobile}>{formattedDate.short}</span>
                    </span>
                    <span className={styles.divider}>|</span>
                    {isMine ? (
                      <button
                        className={styles.actionBtn}
                        onClick={() =>
                          handleDeleteReview(review._id, review.user.nickname)
                        }
                      >
                        삭제
                      </button>
                    ) : (
                      <button
                        className={styles.actionBtn}
                        onClick={handleReportReview}
                      >
                        신고
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.reviewContent}>{review.comment}</div>

              <div className={styles.reviewFooter}>
                <button
                  className={`${styles.helpfulBtn} ${liked ? styles.liked : ""}`}
                  onClick={() => toggleLikeReview(review._id)}
                >
                  좋아요 ({review.helpful})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
