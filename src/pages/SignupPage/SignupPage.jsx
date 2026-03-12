import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';
import useAuth from '@/contexts/useAuth';
import { createAuthUser, getUserIdFromAccessToken } from '@/contexts/authStorage';
import { signup } from '../../services/api/authApi';
import styles from './SignupPage.module.scss';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const isFormFilled = Object.values(formData).every((value) => value.trim());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      setMessage('모든 항목을 입력해 주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 8) {
      setMessage('비밀번호는 8자 이상으로 입력해 주세요.');
      return;
    }

    try {
      setPending(true);

      const data = await signup({
        email,
        password,
      });

      login({
        user: createAuthUser({
          email,
          id: getUserIdFromAccessToken(data.accessToken),
        }),
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      navigate('/');
    } catch (error) {
      console.error('회원가입 실패:', error);
      setMessage('회원가입에 실패했습니다. 입력값 또는 서버 상태를 확인해 주세요.');
    } finally {
      setPending(false);
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.srOnly}>회원가입</h1>

      <Link to="/" aria-label="홈으로 이동" className={styles.homeLink}>
        <BrandLogo compact />
      </Link>

      <section className={styles.card}>
        <p className={styles.eyebrow}>Create Account</p>
        <h2 className={styles.title}>회원가입</h2>
        <p className={styles.copy}>응원 댓글과 개인화 기능을 사용하려면 계정을 생성하세요.</p>

        <form onSubmit={handleSubmit} aria-label="회원가입" className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="이메일"
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
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="비밀번호"
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="비밀번호 확인"
              className={styles.input}
            />
          </div>

          {message && (
            <div role="alert" className={styles.message}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormFilled || pending}
            className={styles.signupButton}
          >
            {pending ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className={styles.divider} />

        <p className={styles.loginText}>
          이미 계정이 있나요?
          <Link
            to="/login"
            aria-label="로그인 페이지로 이동"
            className={styles.loginLink}
          >
            로그인하기
          </Link>
        </p>
      </section>
    </main>
  );
};

export default SignupPage;
