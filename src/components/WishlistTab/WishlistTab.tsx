import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./WishlistTab.module.css";

interface Book {
  isbn: string;
  title: string;
  author?: string;
  image?: string;
  salePrice?: number;
}

interface WishlistItem {
  bookIsbn: string;
  createdAt: string;
  book?: Book; // ✅ book이 없을 수도 있으니 optional로
}

const WishlistTab: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [confirmBook, setConfirmBook] = useState<Book | null>(null);

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 찜 목록 불러오기
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        console.log("📨 /api/wishlist 요청 시작");
        const res = await axios.get(`${API}/api/wishlist`, {
          withCredentials: true,
        });
        console.log("📥 /api/wishlist 응답:", res.data);

        // ✅ 배열인지 확인 후 저장
        const data = Array.isArray(res.data) ? res.data : [];
        setWishlist(data);
      } catch (err) {
        console.error("❌ 찜 목록 불러오기 실패:", err);
      }
    };

    fetchWishlist();
  }, []);

  // ✅ 찜 해제
  const removeFromWishlist = async (isbn: string) => {
    try {
      await axios.delete(`${API}/api/wishlist/${isbn}`, {
        withCredentials: true,
      });
      setWishlist((prev) => prev.filter((w) => w.book?.isbn !== isbn));
    } catch (err) {
      console.error("❌ 찜 해제 실패:", err);
    }
  };

  // ✅ 장바구니 담기
  const addToCart = async (isbn: string) => {
    try {
      await axios.post(
        `${API}/api/cart/${isbn}`,
        {},
        { withCredentials: true }
      );
      alert("🛒 장바구니에 추가되었습니다!");
    } catch (err) {
      console.error("❌ 장바구니 추가 실패:", err);
      alert("장바구니 추가 중 오류가 발생했습니다 😢");
    }
  };

  // ✅ 바로 결제 (모달 오픈)
  const handleInstantPurchase = (book: Book) => {
    setConfirmBook(book);
  };

  // ✅ 모달 내 “예” 클릭 → 결제 처리
  const confirmPurchase = async () => {
    if (!confirmBook) return;

    try {
      await axios.post(
        `${API}/api/purchase`,
        { books: [{ isbn: confirmBook.isbn, price: confirmBook.salePrice || 0 }] },
        { withCredentials: true }
      );

      await axios.delete(
        `${API}/api/wishlist/${confirmBook.isbn}`,
        { withCredentials: true }
      );

      setWishlist((prev) =>
        prev.filter((w) => w.book?.isbn !== confirmBook.isbn)
      );

      alert(`✅ "${confirmBook.title}" 결제가 완료되었습니다!`);
      setConfirmBook(null);
    } catch (err) {
      console.error("❌ 결제 실패:", err);
      alert("결제 중 오류가 발생했습니다 😢");
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>💖 찜 목록</h3>

      {wishlist.length === 0 ? (
        <p className={styles.empty}>찜한 도서가 없습니다 😢</p>
      ) : (
        <ul className={styles.list}>
          {wishlist.map((w) => {
            if (!w.book) return null; // ✅ book 없는 항목 skip

            return (
              <li key={w.book.isbn} className={styles.item}>
                <img
                  src={w.book.image}
                  alt={w.book.title}
                  className={styles.image}
                />
                <div className={styles.info}>
                  <h4>{w.book.title}</h4>
                  <p>{w.book.author}</p>
                  <p className={styles.price}>
                    {w.book.salePrice?.toLocaleString()}원
                  </p>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => addToCart(w.book!.isbn)}>
                    🛒 장바구니
                  </button>
                  <button onClick={() => handleInstantPurchase(w.book!)}>
                    💳 바로결제
                  </button>
                  <button onClick={() => removeFromWishlist(w.book!.isbn)}>
                    ❌ 찜 취소
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* 💳 결제 확인 모달 */}
      {confirmBook && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>💳 {confirmBook.title}</h3>
            <p>이 도서를 결제하시겠습니까?</p>
            <div className={styles.modalBtns}>
              <button onClick={confirmPurchase}>예, 결제할게요</button>
              <button onClick={() => setConfirmBook(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistTab;
