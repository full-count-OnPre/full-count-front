import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import useAuth from "@/contexts/useAuth";
import { createAuthUser, getUserIdFromAccessToken } from "@/contexts/authStorage";
import { login } from "../../services/api/authApi";
import styles from "./LoginPage.module.scss";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: saveLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormFilled = email.trim() && password.trim();
  const redirectTo = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}${location.state.from.hash || ""}`
    : "/";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormFilled) {
      setMessage("이메일과 비밀번호를 입력하세요.");
      return;
    }

    try {
      setLoading(true);

      const data = await login({ email, password });
      saveLogin({
        user: createAuthUser({
          email,
          id: getUserIdFromAccessToken(data.accessToken),
        }),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setMessage("아이디 또는 비밀번호가 잘못되었습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link to="/" aria-label="홈으로 이동" className={styles.homeLink}>
          <BrandLogo compact />
        </Link>

        <section className={styles.card}>
          <p className={styles.eyebrow}>Sign In</p>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.copy}>실시간 문자중계와 응원 댓글에 참여하려면 계정이 필요합니다.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                이메일
              </label>
              <input
                id="email"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
            </div>

            {message ? <div className={styles.message}>{message}</div> : null}

            <button type="submit" disabled={!isFormFilled || loading} className={styles.loginButton}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className={styles.linksWrapper}>
            <span>회원이 아닌가요?</span>
            <Link to="/signup" className={styles.signupLink}>
              지금 가입하세요
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
