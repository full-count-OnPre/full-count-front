import { Link, Outlet, useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import useAuth from "@/contexts/useAuth";

const MainLayout = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <BrandLogo />
        <nav className="main-layout__nav">
          <Link to="/" className="main-layout__nav-link">
            경기 일정
          </Link>
          {isLoggedIn ? (
            <div className="main-layout__user-menu">
              <span className="main-layout__nickname">{user.nickname}</span>
              <button type="button" className="main-layout__auth-button is-secondary" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          ) : (
            <Link to="/login" className="main-layout__auth-button">
              로그인
            </Link>
          )}
        </nav>
      </header>
      <main className="main-layout__content">
        <Outlet />
      </main>
      <footer className="main-layout__footer" />
    </div>
  );
};

export default MainLayout;
