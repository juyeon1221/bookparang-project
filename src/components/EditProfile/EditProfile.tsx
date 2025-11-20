import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";
import styles from "./EditProfile.module.css";
import defaultProfile from "../Header/profile.svg";

interface UserProfile {
  userId: string;
  nickname: string;
  profileImage: string;
}

export default function EditProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [newNickname, setNewNickname] = useState("");
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const API = import.meta.env.VITE_API_URL ?? "";

  // ✅ 토스트 메시지
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "" }>({
    message: "",
    type: "",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2500);
  };

  // ✅ 유저 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, {
          withCredentials: true,
        });
        setUser(res.data);
        setNewNickname(res.data.nickname);
      } catch (err) {
        console.error("❌ 유저 정보 불러오기 실패:", err);
        showToast("유저 정보를 불러오지 못했습니다.", "error");
      }
    };
    fetchUser();
  }, []);

  // ✅ 프로필 미리보기
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileFile(file);
      const previewURL = URL.createObjectURL(file);
      setProfilePreview(previewURL);
    }
  };

  // ✅ 닉네임 중복 확인
  const checkNickname = async () => {
    if (!newNickname.trim()) {
      showToast("닉네임을 입력해주세요!", "error");
      return;
    }
    if (newNickname === user?.nickname) {
      setNicknameChecked(true);
      setNicknameMessage("현재 닉네임과 동일합니다 ✅");
      return;
    }

    try {
      const res = await axios.get(
        `${API}/api/users/check-nickname?nickname=${encodeURIComponent(
          newNickname
        )}`
      );

      // 서버가 단순 메시지 반환 시
      if (res.status === 200) {
        setNicknameChecked(true);
        setNicknameMessage("사용 가능한 닉네임입니다 ✅");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 409) {
        setNicknameChecked(false);
        setNicknameMessage("이미 사용 중인 닉네임입니다 ❌");
      } else {
        showToast("닉네임 확인 중 오류가 발생했습니다.", "error");
      }
    }
  };

  // ✅ 저장하기
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    // 비밀번호 확인
    if (password && password !== passwordCheck) {
      showToast("비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    // 닉네임 중복 확인 필수
    if (newNickname !== user?.nickname && !nicknameChecked) {
      showToast("닉네임 중복 확인을 완료해주세요.", "error");
      return;
    }

    const formData = new FormData();
    if (newNickname && newNickname !== user?.nickname)
      formData.append("nickname", newNickname);
    if (password) formData.append("password", password);
    if (profileFile) formData.append("profileImage", profileFile);

    try {
      await axios.put(`${API}/api/users/update`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("회원정보가 성공적으로 수정되었습니다!", "success");

      const refreshed = await axios.get("${API}/api/users/me", {
        withCredentials: true,
      });
      setUser(refreshed.data);
      setPassword("");
      setPasswordCheck("");
      setProfileFile(null);
      setProfilePreview(null);
      setNicknameChecked(false);
      setNicknameMessage("");
    } catch (err) {
      console.error("❌ 회원정보 수정 실패:", err);
      showToast("회원정보 수정에 실패했습니다.", "error");
    }
  };

  // ✅ 로그아웃
  const handleLogout = async () => {
    if (!window.confirm("로그아웃 하시겠습니까?")) return;
    try {
      await axios.post(`${API}/api/users/logout`, {}, { withCredentials: true });
      showToast("로그아웃 되었습니다.", "success");
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch {
      showToast("로그아웃 중 문제가 발생했습니다.", "error");
    }
  };

  // ✅ 회원탈퇴
  const handleDelete = async () => {
    if (!user) return;
    const confirmDelete = window.confirm("정말 탈퇴하시겠습니까? 복구할 수 없습니다!");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API}/api/users/delete/${user.userId}`, {
        withCredentials: true,
      });
      showToast("회원 탈퇴가 완료되었습니다.", "success");
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch {
      showToast("회원 탈퇴에 실패했습니다.", "error");
    }
  };

  if (!user) return <p className={styles.loading}>회원 정보를 불러오는 중...</p>;

  return (
    <section className={styles.editProfileSection}>
      {/* ✅ 토스트 메시지 */}
      {toast.message && (
        <div
          className={`${styles.toast} ${
            toast.type === "success" ? styles.success : styles.error
          }`}
        >
          {toast.message}
        </div>
      )}

      <h3 className={styles.title}>회원정보</h3>
      <hr className={styles.titleLine} />

      <form onSubmit={handleSave} className={styles.profileContainer}>
        {/* 왼쪽 */}
        <div className={styles.leftSection}>
          <div className={styles.profileBox}>
            <p className={styles.label}>프로필 사진</p>
            <img
              src={profilePreview || user.profileImage || defaultProfile}
              alt="프로필 사진"
              className={styles.profileImg}
            />
          </div>

          <div className={styles.profileActions}>
            <label htmlFor="profileUpload" className={styles.plusButton}>
              프로필 사진 추가
              <input
              id="profileUpload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleProfileChange}
              className={styles.hiddenInput}
            />
            </label>
            <p className={styles.desc}>jpg, png만 사용 가능합니다.</p>
          </div>
        </div>

        {/* 오른쪽 */}
        <div className={styles.rightSection}>
          <div className={styles.inputGroup}>
            <label htmlFor="id">아이디</label>
            <input type="text" id="id" value={user.userId} readOnly className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="nickname">닉네임</label>
            <div className={styles.row}>
              <input
                type="text"
                id="nickname"
                value={newNickname}
                onChange={(e) => {
                  setNewNickname(e.target.value);
                  setNicknameChecked(false);
                  setNicknameMessage("");
                }}
                className={styles.input}
              />
              <button type="button" className={styles.checkButton} onClick={checkNickname}>
                중복확인
              </button>
            </div>
            {nicknameMessage && (
              <p
                className={
                  nicknameChecked ? styles.nicknameSuccess : styles.nicknameError
                }
              >
                {nicknameMessage}
              </p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호 변경 (선택)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 변경하지 않으려면 비워두세요"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="passwordCheck">비밀번호 확인</label>
            <input
              type="password"
              id="passwordCheck"
              value={passwordCheck}
              onChange={(e) => setPasswordCheck(e.target.value)}
              placeholder="비밀번호를 변경하지 않으려면 비워두세요"
              className={styles.input}
            />
          </div>

          <div className={styles.buttons}>
            <div className={styles.buttonRow}>
              <button type="submit" className={styles.saveButton}>
                저장하기
              </button>
            </div>

            <div className={styles.buttonLeave}>
              <button type="button" className={styles.leaveButton} onClick={handleLogout}>
                로그아웃
              </button>
              <button type="button" className={styles.leaveButton} onClick={handleDelete}>
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
