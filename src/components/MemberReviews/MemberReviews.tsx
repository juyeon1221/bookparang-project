import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./MemberReviews.module.css";
import MemberReviewCard from "./MemberReviewCard";

// ✅ rating 추가 (1~10 점)
interface DisplayReview {
  id: string;
  title: string;
  author: string;
  img: string;
  ment: string;
  reviewerName: string;
  reviewerImg: string;
  rating: number;
}

export default function MemberReviews() {
  const [reviews, setReviews] = useState<DisplayReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    const fetchRandomReviews = async () => {
      try {
        const res = await axios.get(`${API}/api/reviews/random?count=3`);

        console.log("📦 서버에서 받아온 리뷰 원본:", res.data);

        // ✅ 서버 데이터 매핑
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = res.data.map((r: any) => ({
          id: r._id,
          title: r.book?.title ?? "제목 없음",
          author: r.book?.author ?? "작자 미상",
          img: r.book?.image ?? "https://placehold.co/100x140?text=No+Image",
          ment: r.comment,
          reviewerName: r.user.nickname,
          reviewerImg: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          rating: r.rating ?? 0,
        }));

        setReviews(mapped);
      } catch (err) {
        console.error("❌ 리뷰 불러오기 실패:", err);
        setError("회원 리뷰를 불러오지 못했습니다 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchRandomReviews();
  }, []);

  return (
    <section className={styles.memberReviewSection}>
      <div className={styles.contentWrapper}>
        <p className={styles.subMent}>책파랑 회원들이 선택한 책</p>
        <h2 className={styles.mainTitle}>회원 리뷰</h2>

        <div className={styles.cardWrapper}>
          <div className={styles.cardViewport}>
            {loading ? (
              <p className={styles.loading}>📖 리뷰를 불러오는 중...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : reviews.length > 0 ? (
              reviews.map((r) => <MemberReviewCard key={r.id} review={r} />)
            ) : (
              <p className={styles.loading}>등록된 리뷰가 없습니다 😢</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
