import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Inquiries.module.css";

interface Inquiry {
  _id: string;
  userId: string;
  title: string;
  content: string;
  answer: string;
  status: "pending" | "answered";
  createdAt: string;
}

function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [answer, setAnswer] = useState("");

  const API = import.meta.env.VITE_API_URL ?? "";

  const fetchInquiries = async () => {
    const res = await axios.get(`${API}/api/inquiries`, { withCredentials: true });
    setInquiries(res.data);
  };

  const handleAnswer = async (id: string) => {
    await axios.put(
      `${API}/api/inquiries/${id}/answer`,
      { answer },
      { withCredentials: true }
    );
    setAnswer("");
    setSelected(null);
    fetchInquiries();
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className={styles.container}>
      <h2>문의 관리</h2>
      <div className={styles.list}>
        {inquiries.map((inq) => (
          <div key={inq._id} className={styles.card}>
            <h4>{inq.title}</h4>
            <p>{inq.content}</p>
            <p>작성자: {inq.userId}</p>
            <p>상태: {inq.status === "answered" ? "✅ 답변 완료" : "⏳ 대기 중"}</p>
            <button onClick={() => setSelected(inq)}>답변하기</button>
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.modal}>
          <div className={styles.modalContent}> {/* ✅ 새로 이름 붙여서 깔끔하게 */}
            <h3>답변 등록</h3>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변 내용을 입력하세요"
            />
            {/* ✅ 버튼은 이 div 안에 있어야 해요 */}
            <div className={styles.modalButtons}>
              <button onClick={() => handleAnswer(selected._id)}>등록</button>
              <button
                onClick={() => setSelected(null)}
                className={styles.cancel}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inquiries;
