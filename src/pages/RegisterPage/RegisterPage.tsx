import { useState } from "react";
import axios from "axios";
import styles from "./RegisterPage.module.css";
import logo from "../../assets/img/로고b.png";
import bookmark from "./책갈피.png";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL ?? "";

// ✅ 비밀번호 유효성 검사 함수
function validatePassword(password: string) {
  const basicRule =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,20}$/;
  if (!basicRule.test(password))
    return "비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자여야 합니다.";
  if (/\s/.test(password)) return "비밀번호에 공백은 사용할 수 없습니다.";

  const chars = password.split("");
  for (let i = 0; i < chars.length - 2; i++) {
    const c1 = chars[i].charCodeAt(0);
    const c2 = chars[i + 1].charCodeAt(0);
    const c3 = chars[i + 2].charCodeAt(0);
    if (c2 === c1 + 1 && c3 === c2 + 1)
      return "3자 이상 연속된 문자는 사용할 수 없습니다.";
    if (chars[i] === chars[i + 1] && chars[i + 1] === chars[i + 2])
      return "같은 문자를 3회 이상 반복할 수 없습니다.";
  }

  return null;
}

function RegisterPage() {
  const [form, setForm] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const [errorMessage, setErrorMessage] = useState({
    userId: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const [checked, setChecked] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  // ✅ 입력 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrorMessage((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ 전체 약관 체크
  const handleAllCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked({
      all: isChecked,
      terms: isChecked,
      privacy: isChecked,
      marketing: isChecked,
    });
  };

  // ✅ 개별 약관 체크
  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked: value } = e.target;
    const newChecked = { ...checked, [name]: value };
    newChecked.all =
      newChecked.terms && newChecked.privacy && newChecked.marketing;
    setChecked(newChecked);
  };

  // ✅ 아이디 중복 확인
  const handleCheckId = async () => {
    if (!form.userId.trim()) {
      setErrorMessage((prev) => ({
        ...prev,
        userId: "아이디를 입력해주세요.",
      }));
      return;
    }
    try {
      const res = await axios.post(
        `${API}/api/users/check-id`,
        { userId: form.userId }
      );
      setErrorMessage((prev) => ({ ...prev, userId: res.data.message }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMessage((prev) => ({
          ...prev,
          userId: err.response?.data?.error || "중복 확인 실패",
        }));
      } else {
        setErrorMessage((prev) => ({
          ...prev,
          userId: "예상치 못한 오류가 발생했습니다.",
        }));
      }
    }
  };

  // ✅ 회원가입 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...errorMessage };

    // 비밀번호 유효성 검사
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      newErrors.password = passwordError;
      hasError = true;
    }

    // 비밀번호 확인
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
      hasError = true;
    }

    // 이름 확인
    if (!form.username.trim()) {
      newErrors.username = "이름을 입력해주세요.";
      hasError = true;
    }

    // 약관 확인
    if (!checked.terms || !checked.privacy) {
      alert("필수 약관에 동의해주세요.");
      hasError = true;
    }

    if (hasError) {
      setErrorMessage(newErrors);
      return;
    }

    try {
      const res = await axios.post(`${API}/api/users/register`, {
        username: form.username,
        userId: form.userId,
        password: form.password,
      });
      alert(res.data.message);
      window.location.href = "/login";
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || "회원가입 실패");
      } else {
        alert("예상치 못한 오류가 발생했습니다.");
      }
    }
  };

  const navigate = useNavigate();

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <img
            src={bookmark}
            alt="장식용 책갈피"
            className={styles.bookmark}
          />

          {/* 로고 */}
          <div className={styles.logoBox}>
            <img src={logo} alt="책파랑 로고" className={styles.logoImg} />
            <h1 className={styles.logoText}>책파랑</h1>
          </div>

          <h2 className={styles.title}>회원가입</h2>

          <hr />

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* 아이디 */}
            <div className={styles.labelRow}>
              <label className={styles.label}>아이디</label>
              {errorMessage.userId && (
                <span className={styles.error}>{errorMessage.userId}</span>
              )}
            </div>
            <div className={styles.idRow}>
              <input
                type="text"
                name="userId"
                placeholder="아이디를 입력하세요"
                value={form.userId}
                onChange={handleChange}
                required
                className={styles.input}
              />
              <button
                type="button"
                onClick={handleCheckId}
                className={styles.checkBtn}
              >
                중복 확인
              </button>
            </div>

            {/* 비밀번호 */}
            <div className={styles.labelRow}>
              <label className={styles.label}>비밀번호</label>
              {errorMessage.password && (
                <span className={styles.error}>{errorMessage.password}</span>
              )}
            </div>
            <input
              type="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={handleChange}
              required
              className={styles.input}
            />

            {/* 비밀번호 확인 */}
            <div className={styles.labelRow}>
              <label className={styles.label}>비밀번호 확인</label>
              {errorMessage.confirmPassword && (
                <span className={styles.error}>
                  {errorMessage.confirmPassword}
                </span>
              )}
            </div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className={styles.input}
            />

            {/* 이름 */}
            <div className={styles.labelRow}>
              <label className={styles.label}>이름</label>
              {errorMessage.username && (
                <span className={styles.error}>{errorMessage.username}</span>
              )}
            </div>
            <input
              type="text"
              name="username"
              placeholder="이름을 입력해주세요"
              value={form.username}
              onChange={handleChange}
              required
              className={styles.input}
            />

            {/* 이용약관 */}
            <div className={styles.agreeTitle}>이용약관</div>
            <div className={styles.agreeBox}>
              <label>
                <input
                  type="checkbox"
                  name="all"
                  checked={checked.all}
                  onChange={handleAllCheck}
                />{" "}
                이용 약관에 모두 동의합니다
              </label>

              <label>
                <input
                  type="checkbox"
                  name="terms"
                  checked={checked.terms}
                  onChange={handleCheck}
                />{" "}
                책파랑 이용약관 (필수)
                <span
                  className={styles.link}
                  onClick={() => navigate("/terms")}
                >
                  보기 &gt;
                </span>
              </label>

              <label>
                <input
                  type="checkbox"
                  name="privacy"
                  checked={checked.privacy}
                  onChange={handleCheck}
                />{" "}
                개인정보 수집 및 이용 동의 (필수)
                <span
                  className={styles.link}
                  onClick={() => navigate("/privacy")}
                >
                  보기 &gt;
                </span>
              </label>

              <label>
                <input
                  type="checkbox"
                  name="marketing"
                  checked={checked.marketing}
                  onChange={handleCheck}
                />{" "}
                책파랑 마케팅 수신 동의 (선택)
                <span
                  className={styles.link}
                  onClick={() => navigate("/marketing")}
                >
                  보기 &gt;
                </span>
              </label>
            </div>

            <button type="submit" className={styles.submitBtn}>
              회원가입
            </button>
          </form>
        </div>
      </div>
      <footer className={styles.footer}>© BOOKPARANG CENTRE</footer>
    </>
  );
}

export default RegisterPage;
