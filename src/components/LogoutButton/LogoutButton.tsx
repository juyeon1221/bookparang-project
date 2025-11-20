import React from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  const API = import.meta.env.VITE_API_URL ?? "";

  const handleLogout = async () => {
    if (window.confirm("정말 로그아웃하시겠습니까?")) {
      try {
        await axios.post(`${API}/api/users/logout`, {}, { withCredentials: true });
        logout();
        alert("로그아웃되었습니다!");
        window.location.href = "/";
      } catch (err) {
        console.error("❌ 로그아웃 실패:", err);
        alert("로그아웃 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <button onClick={handleLogout} style={{ cursor: "pointer" }}>
      로그아웃
    </button>
  );
};

export default LogoutButton;
