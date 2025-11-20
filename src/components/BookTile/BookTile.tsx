import { useNavigate } from "react-router-dom";
import styles from "./BookTile.module.css";
import { ReactComponent as StarIcon } from "../BookRow/star.svg";
import { ReactComponent as HeartIcon } from "../BookRow/heart.svg";
import { ReactComponent as ClickHeartIcon } from "../BookRow/clickheart.svg";
import type { Book } from "../../types/books";

interface Props {
  book: Book;
  rank?: number;
  isFavorited: boolean;
  reviewAverage?: number;
  onFavorite: (isbn: string) => void;
  onAddCart: (isbn: string) => void;
  onClick?: () => void;
}

export default function BookTile({
  book,
  rank,
  isFavorited,
  reviewAverage,
  onFavorite,
  onAddCart,
  onClick,
}: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else if (book.isbn) navigate(`/book/${book.isbn}`);
  };

  return (
    <div className={styles.tile} onClick={handleClick}>
      {/* ✅ 순위 공간은 유지하되, rank가 없으면 숫자 숨기기 */}
      <h2
        className={`${styles.number} ${
          rank === undefined ? styles.hiddenRank : ""
        }`}
      >
        {rank}
      </h2>

      {/* 이미지 */}
      <div
        className={styles.imageWrapper}
        style={{ ["--bg" as unknown as string]: `url(${book.image})` }}
      >
        <img src={book.image} alt={book.title} className={styles.image} />
      </div>

      {/* 도서 정보 */}
      <div className={styles.booklist}>
        <h3 className={styles.title}>{book.title}</h3>
        <p className={styles.author}>{book.author}</p>

        {/* 가격 + 평점 */}
        <div className={styles.priceReview}>
          <div className={styles.price_review}>
            <p className={styles.price}>{book.salePrice?.toLocaleString()}원</p>
            <div className={styles.sale}>
              {book.listPrice && (
                <p className={styles.discount}>
                  {book.listPrice.toLocaleString()}원
                </p>
              )}
              {book.discountRate && book.discountRate > 0 && (
                <p className={styles.percent}>({book.discountRate}% 할인)</p>
              )}
            </div>
          </div>

          <div className={styles.review}>
            <StarIcon className={styles.starIcon} />
            {reviewAverage ?? book.rating ?? "평점 없음"}
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className={styles.button}>
        <button
          className={styles.cart}
          onClick={(e) => {
            e.stopPropagation(); // ✅ 클릭 이벤트 상위로 전파 방지
            onAddCart(book.isbn);
          }}
        >
          담기
        </button>

        <button
          className={styles.buy}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/book/${book.isbn}`); // ✅ 구매 클릭 시 상세 페이지로 이동
          }}
        >
          구매
        </button>

        <button
          className={styles.heart}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(book.isbn);
          }}
          aria-pressed={isFavorited}
          aria-label={isFavorited ? "찜 취소" : "찜하기"}
        >
          {isFavorited ? (
            <ClickHeartIcon className={styles.heartIcon} />
          ) : (
            <HeartIcon className={styles.heartIcon} />
          )}
        </button>
      </div>
    </div>
  );
}
