import { useEffect, useState } from "react";
import styles from "./BookInformation.module.css";
import type { Book } from "../../types/books";

export default function BookInformation({ isbn }: { isbn: string }) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const response = await fetch(`${API}/api/books/detail/${isbn}`);
        if (!response.ok) throw new Error("도서 정보를 불러올 수 없습니다.");
        const data: Book = await response.json();
        setBook(data);
      } catch (err) {
        if (err instanceof Error) {
          console.error("❌ 책 정보 로드 실패:", err.message);
          setError(err.message);
        } else {
          console.error("❌ 알 수 없는 오류:", err);
          setError("예기치 못한 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (isbn) fetchBookDetail();
  }, [isbn]);


  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;
  if (!book) return <p>책 정보를 찾을 수 없습니다.</p>;

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>책 소개</h3>
        <p className={styles.content}>{book.summary || "책 소개 정보가 없습니다."}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>저자 소개</h3>
        <p className={styles.content}>{book.author || "저자 정보가 없습니다."}</p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>출판 정보</h3>
        <div className={styles.content}>
          <p>출판사: {book.publisher}</p>
          <p>출판일: {book.pubDate}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>상세 정보</h3>
        <div className={styles.content}>
          <p>정가: {book.listPrice?.toLocaleString()}원</p>
          <p>판매가: {book.salePrice?.toLocaleString()}원</p>
          <p>할인율: {book.discountRate}%</p>
        </div>
      </div>
    </div>
  );
}
