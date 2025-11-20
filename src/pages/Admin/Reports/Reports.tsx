// src/pages/Admin/Reports.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Reports.module.css";

interface Report {
  _id: string;
  reviewId: string;
  reporterId: string;
  reason: string;
  createdAt: string;
  resolved: boolean;
}

function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL ?? "";

  // 🔹 신고 목록 불러오기
  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API}/api/reports`, {
        withCredentials: true,
      });
      setReports(res.data);
    } catch (err) {
      console.error("❌ 신고 목록 불러오기 실패:", err);
      alert("신고 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 🔹 신고 처리
  const handleResolve = async (id: string) => {
    try {
      await axios.put(
        `${API}/api/reports/${id}/resolve`,
        {},
        { withCredentials: true }
      );
      alert("✅ 신고가 처리되었습니다.");
      fetchReports();
    } catch (err) {
      console.error("❌ 신고 처리 실패:", err);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <p>⏳ 신고 목록을 불러오는 중...</p>;

  return (
    <div className={styles.container}>
      <h2>🚨 신고 관리</h2>

      {reports.length === 0 ? (
        <p>현재 접수된 신고가 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>번호</th>
              <th>리뷰 ID</th>
              <th>신고자</th>
              <th>사유</th>
              <th>신고일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((rep, idx) => (
              <tr key={rep._id}>
                <td>{idx + 1}</td>
                <td>{rep.reviewId}</td>
                <td>{rep.reporterId}</td>
                <td className={styles.reason}>{rep.reason}</td>
                <td>{new Date(rep.createdAt).toLocaleString()}</td>
                <td
                  className={
                    rep.resolved ? styles.statusDone : styles.statusPending
                  }
                >
                  {rep.resolved ? "처리 완료" : "대기 중"}
                </td>
                <td>
                  {!rep.resolved && (
                    <button
                      onClick={() => handleResolve(rep._id)}
                      className={styles.btnResolve}
                    >
                      처리 완료
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Reports;
