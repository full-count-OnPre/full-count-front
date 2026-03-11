import { Link } from "react-router-dom";

const SchedulePage = () => {
  return (
    <section className="schedule-page">
      <div className="schedule-page__intro">
        <p className="schedule-page__eyebrow">Today&apos;s Feature</p>
        <h1>MLB 실시간 중계 프로토타입</h1>
        <p>
          백엔드 연동 전 단계라 현재는 더미 데이터로 실시간 문자중계와 채팅 흐름을 확인할 수 있습니다.
        </p>
      </div>

      <article className="schedule-card">
        <div>
          <span className="schedule-card__status">LIVE PREVIEW</span>
          <h2>New York Yankees at Los Angeles Dodgers</h2>
          <p>9회 초 · 문자중계 / 실시간 댓글 / 이닝 스코어보드 / 베이스 현황 포함</p>
        </div>
        <Link to="/games/20260311-nyy-lad/live" className="schedule-card__link">
          라이브 페이지 보기
        </Link>
      </article>
    </section>
  );
};

export default SchedulePage;
