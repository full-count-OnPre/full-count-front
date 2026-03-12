import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getGames } from "@/services/api/gameApi";
import { demoScheduleGame } from "@/pages/LivePage/demoLiveData";
import { appConfig } from "@/config/runtimeConfig";
import "./SchedulePage.scss";

const dateLabelFormatter = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });
const monthLabelFormatter = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit" });
const DEFAULT_GAME_DATE = appConfig.defaultGameDate;
const DEMO_GAME_DATE = appConfig.demoGameDate;

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

const getStatusLabel = (status) => {
  if (status === 1) {
    return "진행 중";
  }

  if (status === 2) {
    return "경기 종료";
  }

  return "경기 예정";
};

const getAccentClass = (code) => {
  const normalized = String(code || "").toLowerCase();
  const accents = {
    nyy: "is-slate",
    lad: "is-blue",
    bos: "is-red",
    chc: "is-blue",
    stl: "is-red",
    sea: "is-green",
  };

  return accents[normalized] || "is-blue";
};

const formatGameTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const mapGame = (game) => ({
  id: game.id,
  rawStatus: game.status,
  time: formatGameTime(game.startTime),
  stadium: game.venue,
  status: getStatusLabel(game.status),
  homeTeam: {
    name: game.homeTeam?.name || "-",
    code: game.homeTeam?.code || "HOME",
    score: game.status === 0 ? "-" : game.homeScore,
    accent: getAccentClass(game.homeTeam?.code),
  },
  awayTeam: {
    name: game.awayTeam?.name || "-",
    code: game.awayTeam?.code || "AWAY",
    score: game.status === 0 ? "-" : game.awayScore,
    accent: getAccentClass(game.awayTeam?.code),
  },
});

const getGameActionLabel = (game) => {
  if (game.id === demoScheduleGame.id || game.rawStatus === 1) {
    return "실시간 중계";
  }

  if (game.rawStatus === 2) {
    return "경기 기록 확인";
  }

  return "경기 정보 보기";
};

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(
    DEFAULT_GAME_DATE || formatDateKey(new Date())
  );
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const calendarInputRef = useRef(null);

  const currentDate = new Date(`${selectedDate}T00:00:00`);
  const visibleDates = useMemo(() => createVisibleDates(selectedDate), [selectedDate]);
  const monthLabel = monthLabelFormatter.format(currentDate).replace(/\.\s/g, ".").replace(/\.$/, "");

  useEffect(() => {
    let cancelled = false;

    const loadGames = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getGames({ date: selectedDate });
        const nextGames = Array.isArray(response.data) ? response.data.map(mapGame) : [];

        if (selectedDate === DEMO_GAME_DATE) {
          nextGames.unshift(demoScheduleGame);
        }

        if (!cancelled) {
          setGames(nextGames);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError("경기 일정을 불러오지 못했습니다. 백엔드 서버와 DB 상태를 확인해 주세요.");
          setGames([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

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
            <p>백엔드에서 조회한 날짜별 경기 목록을 확인하고 실시간 중계 화면으로 이동할 수 있습니다.</p>
          </div>
          <span className="schedule-page__badge">{loading ? "..." : `${games.length} Games`}</span>
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

            return (
              <button
                key={dateKey}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`schedule-date${isActive ? " is-active" : ""}`}
                onClick={() => setSelectedDate(dateKey)}
              >
                <span className="schedule-date__day">{String(date.getDate()).padStart(2, "0")}</span>
                <span className="schedule-date__weekday">{dateLabelFormatter.format(date)}</span>
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="schedule-board__empty">
            <strong>API Error</strong>
            <p>{error}</p>
          </div>
        ) : null}

        {!error && loading ? (
          <div className="schedule-board__empty">
            <strong>{selectedDate}</strong>
            <p>경기 일정을 불러오는 중입니다.</p>
          </div>
        ) : null}

        {!error && !loading && games.length > 0 ? (
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
                    {getGameActionLabel(game)}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!error && !loading && games.length === 0 ? (
          <div className="schedule-board__empty">
            <strong>{selectedDate}</strong>
            <p>
              선택한 날짜에는 등록된 경기 일정이 없습니다.
              {selectedDate === DEMO_GAME_DATE
                ? " 시연용 데모 경기를 쓰려면 환경변수와 dev 서버 재시작 상태를 확인해 주세요."
                : DEFAULT_GAME_DATE
                  ? ` 시드 데이터 확인용 날짜는 ${DEFAULT_GAME_DATE} 입니다.`
                  : ""}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SchedulePage;
