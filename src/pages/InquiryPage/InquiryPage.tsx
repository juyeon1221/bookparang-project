import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./InquiryPage.module.css";
import FAQSection from "../../components/FAQSection/FAQSection";

interface Inquiry {
  _id: string;
  title: string;
  content: string;
  answer: string;
  status: "pending" | "answered";
  createdAt: string;
}

function InquiryPage() {
  const [form, setForm] = useState({ title: "", content: "" });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const API = import.meta.env.VITE_API_URL ?? "";

  const fetchInquiries = async () => {
    const res = await axios.get(`${API}/api/inquiries/my`, { withCredentials: true });
    setInquiries(res.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API}/api/inquiries`, form, { withCredentials: true });
    setForm({ title: "", content: "" });
    fetchInquiries();
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.container}>
      <FAQSection />

      <h2 className={styles.title}>문의하기</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="제목"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <button type="submit">등록</button>
      </form>

      <h3>내 문의 내역</h3>

      <div className={styles.list}>
        {inquiries.length === 0 ? (
          <p className={styles.empty}>문의 내역이 없습니다.</p>
        ) : (
          inquiries.map((inq) => (
            <div key={inq._id} className={styles.inquiryCard}>
              <h4>{inq.title}</h4>
              <p>{inq.content}</p>
              <p className={styles.meta}>
                📅 {new Date(inq.createdAt).toLocaleString()}
              </p>

              {inq.answer ? (
                <p className={styles.answer}>💬 답변: {inq.answer}</p>
              ) : (
                <p className={styles.pending}>⏳ 답변 대기 중</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InquiryPage;
