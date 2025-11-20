import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./SearchFilter.module.css";

interface ApiCategory {
  categoryId: number;
  categoryName: string;
  categoryPath: string;
}

interface Category {
  id: number;
  name: string;
}

interface SearchFilterProps {
  onFilterChange?: (filters: {
    conditions: string[];
    categories: number[];
    keyword: string;
  }) => void;
  onCategoryLoad?: (categories: Category[]) => void;
}

export default function SearchFilter({ onFilterChange, onCategoryLoad }: SearchFilterProps) {
  const [searchFilters, setSearchFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keyword] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<ApiCategory[]>(
          `${API}/api/books/categories`
        );
        const formatted = res.data.map((c) => ({
          id: c.categoryId,
          name: c.categoryName,
        }));
        setCategories(formatted);
      } catch (err) {
        console.error("❌ 카테고리 불러오기 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) onCategoryLoad?.(categories);
  }, [categories, onCategoryLoad]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange?.({
        conditions: searchFilters,
        categories: categoryFilters,
        keyword,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchFilters, categoryFilters, keyword]);

  const handleSearchFilterToggle = (filter: string) => {
    setSearchFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const handleCategoryFilterToggle = (id: number) => {
    setCategoryFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const searchConditions = ["상품명", "저자명", "출판사명"];

  return (
    <>
      {/* ✅ 모바일에서만 보임 */}
      <button
        className={styles.filterToggleBtn}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      >
        {isSidebarOpen ? "필터 열기 ▲" : "필터 닫기 ▼"}
      </button>

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.active : ""}`}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>검색조건</h4>
          <div className={styles.optionGroup}>
            {searchConditions.map((condition) => (
              <label
                key={condition}
                className={`${styles.optionLabel} ${
                  searchFilters.includes(condition) ? styles.active : ""
                }`}
              >
                <input
                  type="checkbox"
                  className={styles.hiddenCheckbox}
                  checked={searchFilters.includes(condition)}
                  onChange={() => handleSearchFilterToggle(condition)}
                />
                <span className={styles.customCheckbox}></span>
                <span className={styles.optionText}>{condition}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>카테고리</h4>
          <div className={styles.optionGroup}>
            {categories.map((category) => (
              <label
                key={category.id}
                className={`${styles.optionLabel} ${
                  categoryFilters.includes(category.id) ? styles.active : ""
                }`}
              >
                <input
                  type="checkbox"
                  className={styles.hiddenCheckbox}
                  checked={categoryFilters.includes(category.id)}
                  onChange={() => handleCategoryFilterToggle(category.id)}
                />
                <span className={styles.customCheckbox}></span>
                <span className={styles.optionText}>{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
