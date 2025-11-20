import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

function ProtectedAdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const API = import.meta.env.VITE_API_URL ?? "";

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, {
          withCredentials: true,
        });
        setIsAdmin(res.data.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // 아직 확인 중이면 로딩 표시
  if (isAdmin === null) return <p>⏳ 관리자 인증 중...</p>;

  // 관리자 아니면 접근 차단
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}

export default ProtectedAdminRoute;
