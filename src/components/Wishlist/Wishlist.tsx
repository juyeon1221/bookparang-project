import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Wishlist.module.css";
import type { Book } from "../../types/books";

interface WishlistItem {
  bookIsbn: string;
  createdAt: string;
  book?: Book;
}

const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 찜 목록 불러오기
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await axios.get<WishlistItem[]>(`${API}/api/wishlist`, {
          withCredentials: true,
        });
        console.log("💖 WISHLIST DATA:", res.data);
        setWishlist(res.data);
      } catch (err) {
        console.error("❌ 찜 목록 불러오기 실패:", err);
      }
    };
    fetchWishlist();
  }, []);

  // ✅ 개별 삭제
  const removeItem = async (isbn: string) => {
    try {
      await axios.delete(`${API}/api/wishlist/${isbn}`, {
        withCredentials: true,
      });
      setWishlist((prev) => prev.filter((item) => item.bookIsbn !== isbn));
      setSelectedItems((prev) => prev.filter((id) => id !== isbn));
    } catch (err) {
      console.error("❌ 찜 삭제 실패:", err);
    }
  };

  // ✅ 선택 삭제
  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return alert("삭제할 도서를 선택하세요!");
    for (const isbn of selectedItems) {
      await removeItem(isbn);
    }
    alert("🗑️ 선택한 도서가 삭제되었습니다.");
  };

  // ✅ 선택 장바구니 담기
  const handleAddToCartSelected = async () => {
    if (selectedItems.length === 0) return alert("장바구니에 담을 도서를 선택하세요!");
    try {
      for (const isbn of selectedItems) {
        await axios.post(
          `${API}/api/cart/${isbn}`,
          {},
          { withCredentials: true }
        );
      }
      alert("🛒 선택한 도서가 장바구니에 추가되었습니다!");
    } catch (err) {
      console.error("❌ 장바구니 담기 실패:", err);
    }
  };

  // ✅ 전체 선택 / 해제
  const toggleSelectAll = () => {
    if (selectedItems.length === wishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.map((item) => item.bookIsbn));
    }
  };

  return (
    <>
      <h2 className={styles.title}>관심도서</h2>
      <hr className={styles.hrLine} />

      <div className={styles.container}>
        <div className={styles.cartSection}>
          {wishlist.length === 0 ? (
            <p className={styles.empty}>찜한 도서가 없습니다 😢</p>
          ) : (
            <>
              <div className={styles.actions}>
                <label className={styles.selectAll}>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === wishlist.length && wishlist.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span className={styles.checkmark}></span>
                  <span>모두 선택</span>
                </label>

                <div className={styles.bulkActions}>
                  <p>선택한 상품을 모두</p>
                  <div className={styles.btns}>
                    <button onClick={handleAddToCartSelected}>장바구니</button>
                    <button onClick={handleDeleteSelected}>삭제</button>
                  </div>
                  <p>합니다</p>
                </div>
              </div>

              <ul className={styles.list}>
                {wishlist.map((item) => (
                  <li key={item.bookIsbn} className={styles.item}>
                    {/* 체크박스 */}
                    <label className={styles.selectAll}>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.bookIsbn)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems((prev) => [...prev, item.bookIsbn]);
                          } else {
                            setSelectedItems((prev) =>
                              prev.filter((id) => id !== item.bookIsbn)
                            );
                          }
                        }}
                      />
                      <span className={styles.checkmark}></span>
                    </label>

                    {/* 도서 이미지 */}
                    <img
                      src={item.book?.image}
                      alt={item.book?.title}
                      className={styles.image}
                    />

                    {/* 도서 정보 */}
                    <div className={styles.info}>
                      <h4>{item.book?.title}</h4>
                      <p>
                        <span className={styles.salePrice}>
                          {item.book?.salePrice?.toLocaleString()}원
                        </span>
                      </p>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => removeItem(item.bookIsbn)}
                      className={styles.removeBtn}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
