import { useState } from "react";
import styles from "./BookDetailTop.module.css";
import type { Book } from "../../types/books";
import { useNavigate } from "react-router-dom";

type Props = {
  book: Book;
  averageRating: number;
  reviewCount: number;
  isFavorited: boolean;
  toggleFavorite: () => Promise<void> | void;
  addToCart: (isbn: string) => Promise<void> | void;
};

export default function BookDetailTop({
  book,
  averageRating,
  reviewCount,
  isFavorited,
  toggleFavorite,
  addToCart,
}: Props) {
  const [isHeartFilled, setIsHeartFilled] = useState(isFavorited);
  const navigate = useNavigate();

  const handleBuyNow = () => {
    // 1️⃣ 구매 정보 구성
    const purchasedBook = {
      id: Number(book.isbn),
      title: book.title,
      price: book.salePrice,
      image: book.image,
      tag: "전자책",
    };

    // 2️⃣ 내 서재에 추가
    const library = JSON.parse(localStorage.getItem("myLibrary") || "[]");
    const exists = library.some((b: { id: number }) => b.id === purchasedBook.id);
    if (!exists) {
      library.push(purchasedBook);
      localStorage.setItem("myLibrary", JSON.stringify(library));
    }

    // 3️⃣ 결제 완료 페이지로 이동
    navigate("/purchase", {
      state: {
        purchasedBooks: [purchasedBook],
        totalPrice: purchasedBook.price,
      },
    });
  };

  return (
    <div className={styles.top_wrap}>
      <div className={styles.cover_area}>
        <img
          src={book.image || "/북커버.png"}
          alt={book.title}
          width="400"
          height="600"
        />
      </div>

      <div className={styles.basic_info}>
        <div className={styles.title_area}>
          <h1 className={styles.book_name}>{book.title}</h1>
          <div className={styles.pubArea}>
            <span>{book.author}</span>
            <span className={styles.divi}>|</span>
            <span>{book.publisher}</span>
            <span className={styles.divi}>|</span>
            <span>{book.pubDate?.slice(0, 10)}</span>
          </div>
        </div>

        <div className={styles.price_area}>
          <table className={styles.price_table}>
            <tbody>
              <tr className={styles.priceRow}>
                <th>정가</th>
                <td className={styles.original_price}>
                  {book.listPrice?.toLocaleString()}원
                </td>
              </tr>
              <tr className={styles.priceRowAccent}>
                <th>판매가</th>
                <td className={styles.sale_price}>
                  {book.salePrice?.toLocaleString()}원{" "}
                  <span className={styles.discountNote}>
                    ({book.discountRate}% 할인)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.star_rating}>
          ⭐{averageRating.toFixed(1)} ({reviewCount})
        </div>

        <div className={styles.btn_area}>
          <button
            className={styles.btn_cart}
            onClick={() => addToCart(book.isbn)}
          >
            장바구니
          </button>
          <button className={styles.btn_buy} onClick={handleBuyNow}>
            바로구매
          </button>
          <button
            className={styles.btn_heart}
            onClick={() => {
              toggleFavorite();
              setIsHeartFilled(!isHeartFilled);
            }}
          >
            <img
              src={isHeartFilled ? "/하트.svg" : "/하트(라인).svg"}
              alt="찜하기"
              width="20"
              height="20"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
