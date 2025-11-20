import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./CartPage.module.css";
import { useNavigate } from "react-router-dom";
import type { Book } from "../../types/books";

interface CartItem {
  bookIsbn: string;
  quantity: number;
  book?: Book;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const API = import.meta.env.VITE_API_URL ?? "";

  const navigate = useNavigate();

  // ✅ 장바구니 목록 불러오기
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get<CartItem[]>(`${API}/api/cart`, {
          withCredentials: true,
        });
        console.log("🛒 CART DATA:", res.data);
        setCart(res.data);
      } catch (err) {
        console.error("❌ 장바구니 불러오기 실패:", err);
      }
    };
    fetchCart();
  }, []);

  // ✅ 개별 아이템 삭제
  const removeItem = async (isbn: string) => {
    try {
      await axios.delete(`${API}/api/cart/${isbn}`, {
        withCredentials: true,
      });
      setCart((prev) => prev.filter((item) => item.bookIsbn !== isbn));
      setSelectedItems((prev) => prev.filter((id) => id !== isbn));
    } catch (err) {
      console.error("❌ 장바구니 삭제 실패:", err);
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

  // ✅ 선택 찜하기
  const handleWishlistSelected = async () => {
    if (selectedItems.length === 0) return alert("찜할 도서를 선택하세요!");
    try {
      for (const isbn of selectedItems) {
        await axios.post(
          `${API}/api/wishlist/${isbn}`,
          {},
          { withCredentials: true }
        );
      }
      alert("💖 선택한 도서가 찜 목록에 추가되었습니다!");
    } catch (err) {
      console.error("❌ 찜하기 실패:", err);
    }
  };

  // ✅ 결제
  const handleCheckoutSelected = async () => {
    if (selectedItems.length === 0) {
      alert("결제할 도서를 선택하세요!");
      return;
    }

    const selectedBooks = cart
      .filter((item) => selectedItems.includes(item.bookIsbn))
      .map((item) => ({
        id: item.book?.isbn,
        title: item.book?.title || "",
        price: item.book?.salePrice || 0,
        image: item.book?.image || "",
        tag:
          item.book?.listPrice && item.book?.salePrice &&
            item.book?.salePrice < item.book?.listPrice
            ? "정가"
            : "",
      }));

    const totalPrice = selectedBooks.reduce((sum, b) => sum + b.price, 0);

    try {
      await axios.post(
        `${API}/api/purchase`,
        { books: selectedBooks.map((b) => ({ isbn: b.id, price: b.price })) },
        { withCredentials: true }
      );

      setCart((prev) => prev.filter((item) => !selectedItems.includes(item.bookIsbn)));
      setSelectedItems([]);

      // ✅ 결제 완료 페이지로 이동하면서 데이터 전달
      navigate("/purchase", {
        state: {
          purchasedBooks: selectedBooks,
          totalPrice,
        },
      });
    } catch (err) {
      console.error("❌ 결제 실패:", err);
      alert("결제 중 오류가 발생했습니다 😢");
    }
  };

  // ✅ 전체 선택 / 해제
  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.bookIsbn));
    }
  };

  // ✅ 가격 계산
  const selectedBooks = cart.filter((item) => selectedItems.includes(item.bookIsbn));

  const totalListPrice = selectedBooks.reduce(
    (sum, item) => sum + (item.book?.listPrice ?? 0),
    0
  );

  const totalSalePrice = selectedBooks.reduce(
    (sum, item) => sum + (item.book?.salePrice ?? 0),
    0
  );

  const totalDiscount = totalListPrice - totalSalePrice;

  return (
    <>
      <h2 className={styles.title}>장바구니</h2>
      <hr className={styles.hrLine} />

      <div className={styles.container}>
        {/* 왼쪽 장바구니 */}
        <div className={styles.cartSection}>
          {cart.length === 0 ? (
            <p className={styles.empty}>장바구니가 비어 있습니다 😢</p>
          ) : (
            <>
              <div className={styles.actions}>
                {/* 전체 선택 체크박스 */}
                <label className={styles.selectAll}>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cart.length && cart.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span className={styles.checkmark}></span>
                  <span>모두 선택</span>
                </label>

                <div className={styles.bulkActions}>
                  <p>선택한 상품을 모두</p>
                  <div className={styles.btns}>
                    <button onClick={handleWishlistSelected}>관심도서</button>
                    <button onClick={handleDeleteSelected}>삭제</button>
                  </div>
                  <p>합니다</p>
                </div>
              </div>

              <ul className={styles.list}>
                {cart.map((item) => {
                  const salePrice = item.book?.salePrice ?? 0;
                  const listPrice = item.book?.listPrice ?? 0;
                  const discountRate =
                    listPrice > 0
                      ? Math.round(((listPrice - salePrice) / listPrice) * 100)
                      : 0;

                  return (
                    <li key={item.bookIsbn} className={styles.item}>
                      {/* 개별 체크박스 */}
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
                            {salePrice.toLocaleString()}원
                          </span>
                          {listPrice > 0 && salePrice < listPrice && (
                            <>
                              <span className={styles.listPrice}>
                                {listPrice.toLocaleString()}원
                              </span>
                              <span className={styles.discountRate}>
                                ({discountRate}% 할인)
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.bookIsbn)}
                        className={styles.removeBtn}
                      >
                        삭제
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* 오른쪽 주문 요약 */}
        <div className={styles.summarySection}>
          <h3>주문 합계</h3>

          <div className={styles.summaryRow}>
            <span>상품수</span>
            <span>{selectedItems.length}개</span>
          </div>

          <div className={styles.summaryRow}>
            <span>상품 할인</span>
            <span>{totalDiscount.toLocaleString()}원</span>
          </div>

          <div className={styles.summaryRow}>
            <span>총 금액</span>
            <span>{totalListPrice.toLocaleString()}원</span>
          </div>

          <hr className={styles.hrLine} />

          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>최종 결제 금액</span>
            <span>{totalSalePrice.toLocaleString()}원</span>
          </div>

          <button className={styles.checkoutBtn} onClick={handleCheckoutSelected}>
            결제하기
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPage;
