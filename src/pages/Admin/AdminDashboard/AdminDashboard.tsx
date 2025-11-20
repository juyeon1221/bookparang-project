import { Link, Routes, Route } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import Inquiries from "../Inquiries/Inquiries";
import Reports from "../Reports/Reports";

function AdminDashboard() {
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>관리자 대시보드</h1>
        <nav>
          <Link to="/admin/inquiries">📨 문의 관리</Link>
          <Link to="/admin/reports">🚨 신고 관리</Link>
        </nav>
      </header>

      <main className={styles.content}>
        <Routes>
          <Route
            index
            element={
              <div>
                <h2>관리자님, 환영합니다 👋</h2>
                <p>우측 메뉴에서 관리 항목을 선택해주세요.</p>
              </div>
            }
          />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;
