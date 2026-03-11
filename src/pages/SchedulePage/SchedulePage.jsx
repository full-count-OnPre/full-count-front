import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./SchedulePage.scss";

const scheduleByDate = {
  "2025-03-10": [
    {
      id: 101,
      time: "18:30",
      stadium: "T-Mobile Park",
      status: "경기 종료",
      homeTeam: { name: "시애틀", code: "SEA", score: 112, accent: "is-green" },
      awayTeam: { name: "텍사스", code: "TEX", score: 106, accent: "is-blue" },
    },
    {
      id: 102,
      time: "19:00",
      stadium: "Kauffman Stadium",
      status: "경기 종료",
      homeTeam: { name: "캔자스시티", code: "KC", score: 101, accent: "is-royal" },
      awayTeam: { name: "미네소타", code: "MIN", score: 97, accent: "is-navy" },
    },
  ],
  "2025-03-11": [
    {
      id: 103,
      time: "18:00",
      stadium: "Fenway Park",
      status: "경기 종료",
      homeTeam: { name: "보스턴", code: "BOS", score: 119, accent: "is-red" },
      awayTeam: { name: "뉴욕 양키스", code: "NYY", score: 114, accent: "is-slate" },
    },
    {
      id: 104,
      time: "20:30",
      stadium: "Dodger Stadium",
      status: "경기 종료",
      homeTeam: { name: "LA 다저스", code: "LAD", score: 108, accent: "is-blue" },
      awayTeam: { name: "샌디에이고", code: "SD", score: 102, accent: "is-gold" },
    },
  ],
  "2025-03-12": [
    {
      id: 105,
      time: "18:30",
      stadium: "Busch Stadium",
      status: "경기 종료",
      homeTeam: { name: "세인트루이스", code: "STL", score: 117, accent: "is-red" },
      awayTeam: { name: "밀워키", code: "MIL", score: 109, accent: "is-gold" },
    },
    {
      id: 106,
      time: "20:00",
      stadium: "Wrigley Field",
      status: "경기 종료",
      homeTeam: { name: "시카고 컵스", code: "CHC", score: 115, accent: "is-blue" },
      awayTeam: { name: "신시내티", code: "CIN", score: 111, accent: "is-red" },
    },
  ],
  "2025-03-13": [
    {
      id: 1,
      time: "18:30",
      stadium: "Jamsil Baseball Stadium",
      status: "경기 종료",
      homeTeam: { name: "화스스", code: "HWS", score: 123, accent: "is-red" },
      awayTeam: { name: "충헤츠", code: "CHZ", score: 110, accent: "is-blue" },
    },
    {
      id: 2,
      time: "19:00",
      stadium: "Gocheok Sky Dome",
      status: "경기 종료",
      homeTeam: { name: "셰노스", code: "SHN", score: 112, accent: "is-green" },
      awayTeam: { name: "레더", code: "RED", score: 118, accent: "is-blue" },
    },
    {
      id: 3,
      time: "19:30",
      stadium: "Sajik Baseball Stadium",
      status: "경기 종료",
      homeTeam: { name: "맥스스", code: "MXS", score: 118, accent: "is-red" },
      awayTeam: { name: "세트비너스", code: "SVN", score: 105, accent: "is-royal" },
    },
    {
      id: 4,
      time: "20:00",
      stadium: "Incheon SSG Landers Field",
      status: "경기 종료",
      homeTeam: { name: "히트", code: "HIT", score: 104, accent: "is-red" },
      awayTeam: { name: "큐레즈스", code: "QRS", score: 119, accent: "is-violet" },
    },
  ],
  "2025-03-14": [
    {
      id: 107,
      time: "18:30",
      stadium: "Truist Park",
      status: "경기 예정",
      homeTeam: { name: "애틀랜타", code: "ATL", score: "-", accent: "is-red" },
      awayTeam: { name: "필라델피아", code: "PHI", score: "-", accent: "is-maroon" },
    },
    {
      id: 108,
      time: "21:00",
      stadium: "LoanDepot Park",
      status: "경기 예정",
      homeTeam: { name: "마이애미", code: "MIA", score: "-", accent: "is-cyan" },
      awayTeam: { name: "워싱턴", code: "WSH", score: "-", accent: "is-red" },
    },
  ],
  "2025-03-15": [
    {
      id: 109,
      time: "18:00",
      stadium: "Oracle Park",
      status: "경기 예정",
      homeTeam: { name: "샌프란시스코", code: "SF", score: "-", accent: "is-gold" },
      awayTeam: { name: "애리조나", code: "ARI", score: "-", accent: "is-maroon" },
    },
    {
      id: 110,
      time: "20:00",
      stadium: "Citi Field",
      status: "경기 예정",
      homeTeam: { name: "뉴욕 메츠", code: "NYM", score: "-", accent: "is-blue" },
      awayTeam: { name: "토론토", code: "TOR", score: "-", accent: "is-cyan" },
    },
  ],
  "2025-03-16": [
    {
      id: 111,
      time: "17:30",
      stadium: "Camden Yards",
      status: "경기 예정",
      homeTeam: { name: "볼티모어", code: "BAL", score: "-", accent: "is-orange" },
      awayTeam: { name: "탬파베이", code: "TB", score: "-", accent: "is-cyan" },
    },
    {
      id: 112,
      time: "19:30",
      stadium: "Progressive Field",
      status: "경기 예정",
      homeTeam: { name: "클리블랜드", code: "CLE", score: "-", accent: "is-red" },
      awayTeam: { name: "디트로이트", code: "DET", score: "-", accent: "is-navy" },
    },
  ],
};

const dateLabelFormatter = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });
const monthLabelFormatter = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit" });

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createVisibleDates = (selectedDate) => {
  const baseDate = new Date(`${selectedDate}T00:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - 3 + index);
    return formatDateKey(date);
  });
};

const SchedulePage = () => {
  const availableDateKeys = useMemo(() => Object.keys(scheduleByDate), []);
  const [selectedDate, setSelectedDate] = useState("2025-03-13");
  const calendarInputRef = useRef(null);

  const games = scheduleByDate[selectedDate] ?? [];
  const currentDate = new Date(`${selectedDate}T00:00:00`);
  const visibleDates = useMemo(() => createVisibleDates(selectedDate), [selectedDate]);
  const monthLabel = monthLabelFormatter.format(currentDate).replace(/\.\s/g, ".").replace(/\.$/, "");

  const handleMoveDate = (direction) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(formatDateKey(nextDate));
  };

  const handleMoveMonth = (direction) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + direction);
    setSelectedDate(formatDateKey(nextDate));
  };

  const handleOpenCalendar = () => {
    if (typeof calendarInputRef.current?.showPicker === "function") {
      calendarInputRef.current.showPicker();
      return;
    }

    calendarInputRef.current?.click();
  };

  return (
    <section className="schedule-page">
      <div className="schedule-page__hero">
        <p className="schedule-page__eyebrow">Game Schedule</p>
        <div className="schedule-page__hero-row">
          <div>
            <h1>경기 일정 조회</h1>
            <p>날짜별로 오늘의 매치업을 확인하고 하이라이트, 선수 기록, 실시간 중계 화면으로 빠르게 이동할 수 있습니다.</p>
          </div>
          <span className="schedule-page__badge">{games.length} Games</span>
        </div>
      </div>

      <div className="schedule-board">
        <div className="schedule-board__toolbar">
          <button
            type="button"
            className="schedule-board__arrow"
            onClick={() => handleMoveDate(-1)}
            aria-label="이전 날짜"
          >
            &#8249;
          </button>
          <div className="schedule-board__month">
            <button
              type="button"
              className="schedule-board__month-button"
              onClick={() => handleMoveMonth(-1)}
              aria-label="이전 달"
            >
              &#8249;
            </button>
            <span>{monthLabel}</span>
            <button
              type="button"
              className="schedule-board__calendar"
              onClick={handleOpenCalendar}
              aria-label="날짜 선택"
            >
              📅
            </button>
            <button
              type="button"
              className="schedule-board__month-button"
              onClick={() => handleMoveMonth(1)}
              aria-label="다음 달"
            >
              &#8250;
            </button>
            <input
              ref={calendarInputRef}
              type="date"
              className="schedule-board__date-input"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="schedule-board__arrow"
            onClick={() => handleMoveDate(1)}
            aria-label="다음 날짜"
          >
            &#8250;
          </button>
        </div>

        <div className="schedule-board__dates" role="tablist" aria-label="경기 날짜 목록">
          {visibleDates.map((dateKey) => {
            const date = new Date(`${dateKey}T00:00:00`);
            const isActive = dateKey === selectedDate;
            const hasGames = availableDateKeys.includes(dateKey);

            return (
              <button
                key={dateKey}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`schedule-date${isActive ? " is-active" : ""}${hasGames ? "" : " is-empty"}`}
                onClick={() => setSelectedDate(dateKey)}
              >
                <span className="schedule-date__day">{String(date.getDate()).padStart(2, "0")}</span>
                <span className="schedule-date__weekday">{dateLabelFormatter.format(date)}</span>
              </button>
            );
          })}
        </div>

        {games.length > 0 ? (
          <div className="schedule-board__grid">
            {games.map((game) => (
              <article key={game.id} className="match-card">
                <div className="match-card__meta">
                  <span>{game.time}</span>
                  <span>{game.stadium}</span>
                </div>

                <div className="match-card__teams">
                  <div className="team-block">
                    <div className={`team-block__logo ${game.awayTeam.accent}`}>{game.awayTeam.code}</div>
                    <strong>{game.awayTeam.name}</strong>
                  </div>

                  <div className="match-card__score">
                    <span>{game.awayTeam.score}</span>
                    <em>{game.status}</em>
                    <span>{game.homeTeam.score}</span>
                  </div>

                  <div className="team-block team-block--home">
                    <div className={`team-block__logo ${game.homeTeam.accent}`}>{game.homeTeam.code}</div>
                    <strong>{game.homeTeam.name}</strong>
                  </div>
                </div>

                <div className="match-card__actions">
                  <button type="button" className="match-card__button">
                    영상
                  </button>
                  <button type="button" className="match-card__button">
                    선수 기록
                  </button>
                  <Link to={`/games/${game.id}/live`} className="match-card__button is-primary">
                    실시간 중계
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="schedule-board__empty">
            <strong>{selectedDate}</strong>
            <p>선택한 날짜에는 등록된 경기 일정이 없습니다. 월 이동 버튼이나 캘린더로 다른 날짜를 선택해 주세요.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SchedulePage;
