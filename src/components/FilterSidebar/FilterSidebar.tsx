import styles from "./FilterSidebar.module.css";

export default function FilterSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.section}>
        <h4>검색조건</h4>
        <ul>
          <li>상품명</li>
          <li>저자명</li>
          <li>출판사</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h4>카테고리</h4>
        <ul>
          <li>만화</li>
          <li>사회과학</li>
          <li>소설/시</li>
          <li>인문학</li>
          <li>자기계발</li>
        </ul>
      </div>
    </aside>
  );
}
