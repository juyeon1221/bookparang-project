import React from "react";
import styles from "./BookInfo.module.css";
import type { Review } from "../../types/review";

interface BookDetail {
  title: string;
  author?: string;
  summary?: string;
  image?: string;
  salePrice?: number;
  listPrice?: number;
  discountRate?: number;
  rating?: number; // 알라딘 평점
  category?: string;
}

interface BookInfoProps {
  book: BookDetail;
  reviews: Review[];
}

const BookInfo: React.FC<BookInfoProps> = ({ book, reviews }) => {
  const avgUserRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null;

  const combinedRating = avgUserRating
    ? ((book.rating ?? 0) + avgUserRating) / 2
    : book.rating;


  console.log("📊 리뷰 갯수:", reviews.length);
  console.log("📊 평균 사용자 평점:", avgUserRating);
  console.log("📊 최종 표시 평점:", combinedRating);

  return (
    <div className={styles.infoContainer}>
      <img src={book.image} alt={book.title} className={styles.cover} />

      <div className={styles.info}>
        <h2>{book.title}</h2>
        <p className={styles.author}>✍️ {book.author}</p>

        {combinedRating && (
          <p className={styles.rating}>
            ⭐ 평점: {combinedRating.toFixed(1)} / 10{" "}
            <span className={styles.sub}>
              (알라딘 평점 {book.rating?.toFixed(1)} + 사용자 평점 반영)
            </span>
          </p>
        )}

        {book.summary && <p className={styles.summary}>{book.summary}</p>}

        {book.salePrice && (
          <p className={styles.price}>
            💸 <b>{book.salePrice.toLocaleString()}원</b>
            {book.discountRate && (
              <span className={styles.discount}> (-{book.discountRate}%)</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookInfo;
