import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "./ReadingCalendar.module.css";

interface BookSelectModalProps {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (purchase: any) => void;
}

const BookSelectModal: React.FC<BookSelectModalProps> = ({ onClose, onSelect }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allBooks, setAllBooks] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visibleBooks, setVisibleBooks] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const API = import.meta.env.VITE_API_URL ?? "";

  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 20;

  // 전체 데이터 한번만 로드
  const fetchAllBooks = async () => {
    const res = await axios.get(`${API}/api/purchase/my`);
    setAllBooks(res.data);
    setVisibleBooks(res.data.slice(0, ITEMS_PER_PAGE));
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  useEffect(() => {
    if (page === 1) return;

    const start = (page - 1) * ITEMS_PER_PAGE;
    const newItems = allBooks.slice(start, start + ITEMS_PER_PAGE);

    if (newItems.length > 0) {
      setVisibleBooks((prev) => [...prev, ...newItems]);
    }
  }, [page]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) setPage((prev) => prev + 1);
      },
      { threshold: 1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.modalBackground}>
      <div className={styles.modal}>
        <h3>구매한 책 선택</h3>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          닫기
        </button>

        <div className={styles.bookList}>
          {visibleBooks.map((item) => (
            <div
              key={item._id}
              className={styles.bookItem}
              onClick={() => onSelect(item)}
            >
              <img src={item.book?.image} alt="" className={styles.bookImage} />
              <div className={styles.bookText}>
                <div>{item.book?.title}</div>
                <div className={styles.bookAuthor}>{item.book?.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookSelectModal;
