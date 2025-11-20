import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "./ReadingCalendar.module.css";

interface PurchasedBook {
  _id: string;
  bookIsbn: string;
  price: number;
  book: {
    isbn: string;
    title: string;
    author: string;
    image: string;
  };
}

const ModalSelectView = ({ onSelect }) => {
  const [allBooks, setAllBooks] = useState<PurchasedBook[]>([]);
  const [visibleBooks, setVisibleBooks] = useState<PurchasedBook[]>([]);
  const [page, setPage] = useState(1);

  const API = import.meta.env.VITE_API_URL ?? "";

  const loaderRef = useRef(null);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    axios.get<PurchasedBook[]>(`${API}/api/purchase/my`).then((res) => {
      setAllBooks(res.data);
      setVisibleBooks(res.data.slice(0, ITEMS_PER_PAGE));
    });
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
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setPage((p) => p + 1);
    });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.selectView}>
      <h3 className={styles.modalTitle}>구매한 책 선택</h3>

      {visibleBooks.map((item) => (
        <div
          key={item._id}
          className={styles.selectItem}
          onClick={() => onSelect(item)}
        >
          <img src={item.book?.image} className={styles.selectBookImg} />
          <div className={styles.selectBookText}>
            <div className={styles.bookTitle}>{item.book?.title}</div>
            <div className={styles.bookAuthor}>{item.book?.author}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModalSelectView;
