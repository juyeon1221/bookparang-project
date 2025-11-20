import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import logo from "../../assets/img/로고b.png";
import google from "./로그인아이콘_구글.svg";
import naver from "./로그인아이콘_네이버.svg";
import kakao from "./로그인아이콘_카톡.svg";
import bookmark from "./책갈피.png";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: "", password: "" });
  const [message, setMessage] = useState("");

  const API = import.meta.env.VITE_API_URL ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ✅ 로그인 요청
      const res = await axios.post(
        `${API}/api/users/login`,
        form,
        { withCredentials: true }
      );

      setMessage(res.data.message);
      alert("✅ 로그인 성공!");

      // ✅ 로그인 후 내 정보(role 포함) 요청
      const profileRes = await axios.get(`${API}/api/users/me`, {
        withCredentials: true,
      });

      const user = profileRes.data;

      // ✅ 관리자면 /admin, 아니면 이전 페이지로
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(-1);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.error || "로그인 실패");
      } else {
        setMessage("예상치 못한 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <img src={bookmark} alt="책갈피" className={styles.bookmark} />
          <div className={styles.logoBox}>
            <img src={logo} alt="책파랑 로고" className={styles.logoImg} />
            <h1 className={styles.logoText}>책파랑</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              name="userId"
              placeholder="아이디"
              value={form.userId}
              onChange={handleChange}
              required
              className={styles.input}
            />

            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              required
              className={styles.input}
            />

            {message && <p className={styles.message}>{message}</p>}

            <button type="submit" className={styles.loginBtn}>
              로그인
            </button>
          </form>

          <div className={styles.registerBox}>
            <p>아이디가 없으시다면?</p>
            <button
              className={styles.registerBtn}
              onClick={() => navigate("/register")}
            >
              회원가입
            </button>
          </div>

          <div className={styles.or}>
            <span>또는</span>
          </div>

          <div className={styles.snsBox}>
            <button className={styles.snsBtn}>
              <img src={google} alt="구글 로그인" />
            </button>
            <button className={styles.snsBtn}>
              <img src={naver} alt="네이버 로그인" />
            </button>
            <button className={styles.snsBtn}>
              <img src={kakao} alt="카카오 로그인" />
            </button>
          </div>
        </div>
      </div>
      <footer className={styles.footer}>© BOOKPARANG CENTER</footer>
    </>
  );
}

export default LoginPage;
