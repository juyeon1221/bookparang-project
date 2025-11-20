import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./BookRow.module.css";
import { ReactComponent as StarIcon } from "../BookRow/star.svg";
import { ReactComponent as FireIcon } from "../BookRow/fire.svg";
import { ReactComponent as HeartIcon } from "../BookRow/heart.svg";
import { ReactComponent as ClickHeartIcon } from "../BookRow/clickheart.svg";
import type { Book } from "../../types/books";
import LoginPromptModal from "../LoginPromptModal/LoginPromptModal";

interface Props {
  book: Book;
  rank?: number;
  showRank?: boolean;
  isFavorited: boolean;
  reviewAverage?: number;
  onFavorite: (isbn: string) => void;
  onAddCart: (isbn: string) => void;
  onClick?: () => void;
}

export default function BookRow({
  book,
  rank,
  showRank = true,
  isFavorited,
  reviewAverage,
  onFavorite,
  onAddCart,
  onClick,
}: Props) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 로그인 상태 확인
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, {
          withCredentials: true,
        });
        setIsLoggedIn(!!res.data);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  const handleRowClick = () => {
    if (onClick) onClick();
    else if (book.isbn) navigate(`/book/${book.isbn}`);
  };

  // ✅ 로그인 확인 후 실행 함수
  const requireLogin = (callback: () => void) => {
    if (!isLoggedIn) {
      setShowModal(true);
    } else {
      callback();
    }
  };

  return (
    <>
      <div className={styles.row} onClick={handleRowClick}>
        {showRank ? (
          <h2 className={styles.number}>{rank ?? 1}</h2>
        ) : (
          <div className={styles.numberPlaceholder}></div>
        )}

        <div
          className={styles.imageWrapper}
          style={{ ["--bg" as unknown as string]: `url(${book.image})` }}
        >
          <img src={book.image} alt={book.title} className={styles.image} />
        </div>

        <div className={styles.info}>
          <h4 className={styles.title}>{book.title}</h4>

          <div className={styles.list}>
            <p className={styles.author}>{book.author}</p>
            <p className={styles.publisher}>{book.publisher}</p>
            <p className={styles.publishDate}>{book.pubDate}</p>
          </div>

          <div className={styles.price}>
            {book.salePrice?.toLocaleString()}원
            {book.listPrice && (
              <p className={styles.discount}>
                {book.listPrice.toLocaleString()}원
              </p>
            )}
            {book.discountRate && book.discountRate > 0 && (
              <p className={styles.percent}>({book.discountRate}% 할인)</p>
            )}
          </div>

          <div className={styles.review}>
            <StarIcon className={styles.starIcon} />
            {reviewAverage ?? book.rating ?? "평점 없음"}
          </div>

          {book.comment && (
            <div className={styles.ment}>
              <FireIcon className={styles.fireIcon} />
              <p className={styles.comment}>{book.comment}</p>
            </div>
          )}
        </div>

        <div className={styles.button}>
          <button
            className={styles.cart}
            onClick={(e) => {
              e.stopPropagation();
              requireLogin(() => onAddCart(book.isbn));
            }}
          >
            장바구니
          </button>

          <button
            className={styles.buy}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/book/${book.isbn}`);
            }}
          >
            바로구매
          </button>

          <button
            className={styles.heart}
            onClick={(e) => {
              e.stopPropagation();
              requireLogin(() => onFavorite(book.isbn));
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

      {/* 로그인 모달 */}
      {showModal && <LoginPromptModal onClose={() => setShowModal(false)} />}
    </>
  );
}
