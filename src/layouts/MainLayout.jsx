import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="main-layout">
      <header>Main Layout Header</header>
      <main>
        <Outlet />
      </main>
      <footer>Main Layout Footer</footer>
    </div>
  );
};

export default MainLayout;
