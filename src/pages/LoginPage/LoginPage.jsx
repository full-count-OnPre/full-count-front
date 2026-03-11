import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/api/authApi";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormFilled = email.trim() && password.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormFilled) {
      setMessage("이메일과 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const data = await login({ email, password });

      const accessToken = data.accessToken;

      localStorage.setItem("accessToken", accessToken);

      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("아이디 또는 비밀번호가 잘못되었습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#111", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      
      <img src="/logo.png" alt="logo" style={{ width: 140, marginBottom: 30 }} />

      <form onSubmit={handleSubmit} style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
        
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            height: 45,
            padding: "0 10px",
            borderRadius: 6,
            border: "1px solid #666",
            background: "#111",
            color: "#fff"
          }}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            height: 45,
            padding: "0 10px",
            borderRadius: 6,
            border: "1px solid #666",
            background: "#111",
            color: "#fff"
          }}
        />

        {message && (
          <div style={{ color: "#ff4d4d", fontSize: 14 }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormFilled || loading}
          style={{
            height: 45,
            background: "#ff7f2a",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

      </form>

      <div style={{ marginTop: 20 }}>
        <span>회원이 아닌가요? </span>
        <a href="/signup" style={{ color: "#fff", fontWeight: "bold" }}>
          지금 가입하세요
        </a>
      </div>

    </main>
  );
};

export default LoginPage;