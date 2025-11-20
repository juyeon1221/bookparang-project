import { useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as MenuIcon } from "../CategoryNavBar/menu.svg";
import styles from "./CategoryNavBar.module.css";
import CategoryDropdown from "./CategoryDropdown";

export default function CategoryNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => setIsOpen(prev => !prev);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navItemWrapper}>
          <button className={`${styles.navItem} ${isOpen ? styles.active : ""}`} 
            onClick={toggleDropdown}
          >
            <MenuIcon /> 카테고리
          </button>
          {isOpen && <CategoryDropdown />}
        </div>

        <Link to="/bestseller" className={styles.navList}>베스트</Link>
        <Link to="/new" className={styles.navList}>신상품</Link>
      </nav>
    </div>
  );
}
