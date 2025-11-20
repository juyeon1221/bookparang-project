import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MobileSearch.module.css";
import useBookSearchWithAutoComplete from "../../hooks/useBookSearchWithAutoComplete";
import searchIcon from "../Header/search.svg";

interface MobileSearchProps {
  onClose: () => void;
}

export default function MobileSearch({ onClose }: MobileSearchProps) {
  const [query, setQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [hoveredTitle, setHoveredTitle] = useState<string | null>(null); // 이 줄을 삭제합니다.
  const navigate = useNavigate();

  const { books, suggestions, loading, fetchSuggestions } =
    useBookSearchWithAutoComplete();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  const handleSuggestionClick = (title: string) => {
    const matched = books.find((b) => b.title === title);
    if (matched) {
      navigate(`/book/${matched.id}`);
      onClose();
    }
  };

  const displayedBook = books[0];

  return (
    <>
      {/* 🔹 반투명 배경 */}
      <div className={styles.backdrop} onClick={onClose}></div>

      {/* 🔹 아래에서 올라오는 시트 */}
      <div className={styles.sheet}>
        <div className={styles.header}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <img src={searchIcon} alt="검색" className={styles.icon} />
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="책 제목을 검색해보세요"
              className={styles.input}
            />
          </form>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.results}>
          {query ? (
            <div className={styles.resultContainer}>
              <ul className={styles.suggestions}>
                {suggestions.length > 0 ? (
                  suggestions.map((title, idx) => (
                    <li
                      key={idx}
                      className={styles.item}
                      onClick={() => handleSuggestionClick(title)}
                    >
                      {title}
                    </li>
                  ))
                ) : (
                  <li className={styles.empty}>검색 결과가 없습니다.</li>
                )}
              </ul>

              <div className={styles.preview}>
                {loading && <p>검색 중...</p>}
                {!loading && displayedBook && (
                  <div className={styles.card}>
                    <img
                      src={displayedBook.thumbnail}
                      alt={displayedBook.title}
                      className={styles.thumbnail}
                    />
                    <div className={styles.bookInfo}>
                      <h3>{displayedBook.title}</h3>
                      <p>{displayedBook.authors}</p>
                      <p>
                        정가: <span>{displayedBook.listPrice}</span> / 판매가:{" "}
                        <b>{displayedBook.salePrice}</b>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className={styles.placeholder}>검색어를 입력해보세요 🔍</p>
          )}
        </div>
      </div>
    </>
  );
}
