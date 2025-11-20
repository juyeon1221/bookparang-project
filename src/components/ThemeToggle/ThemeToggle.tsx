import { useState, useEffect } from "react";
import styles from "./ThemeToggle.module.css";
import moon from "./moon.svg";
import sun from "./sun.svg";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      className={`${styles.themeToggleBtn} ${isDark ? styles.dark : styles.light}`}
      onClick={toggleTheme}
      title="테마 전환"
    >
      <img
        src={isDark ? sun : moon}
        alt={isDark ? "라이트모드" : "다크모드"}
        className={styles.icon}
      />
      <p className={styles.text}>{isDark ? "라이트모드" : "다크모드"}</p>
    </button>
  );
}
