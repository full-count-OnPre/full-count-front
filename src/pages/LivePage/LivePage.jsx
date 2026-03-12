import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import useAuth from "@/contexts/useAuth";
import {
  getGame,
  getGameChat,
  getGameLive,
  getGameRelay,
  postGameChat,
} from "@/services/api/gameApi";
import { DEMO_GAME_ID, demoGame, demoSnapshots } from "./demoLiveData";
import "./LivePage.scss";

const TAB_ITEMS = [
  { key: "relay", label: "실시간 중계" },
  { key: "lineup", label: "라인업" },
  { key: "matchup", label: "매치업" },
];

const POLLING_INTERVAL = 5000;
const DEMO_CHAT_GAME_ID = import.meta.env.VITE_DEMO_CHAT_GAME_ID;

const BaseDiamond = ({ bases }) => {
  const baseClassName = (isActive) =>
    `diamond__base${isActive ? " diamond__base--active" : ""}`;

  return (
    <div className="diamond" aria-label="주자 현황">
      <div className="diamond__lane" />
      <div className={`${baseClassName(bases.second)} diamond__base diamond__base--second`}>
        <span>2</span>
      </div>
      <div className={`${baseClassName(bases.third)} diamond__base diamond__base--third`}>
        <span>3</span>
      </div>
      <div className={`${baseClassName(bases.first)} diamond__base diamond__base--first`}>
        <span>1</span>
      </div>
    </div>
  );
};

const CountIndicator = ({ label, count, max, variant }) => (
  <div className="count-indicator">
    <strong>{label}</strong>
    <div className="count-indicator__lights" aria-label={`${label} ${count}`}>
      {Array.from({ length: max }, (_, index) => (
        <span
          key={`${label}-${index + 1}`}
          className={index < count ? `is-on--${variant}` : ""}
        />
      ))}
    </div>
  </div>
);

const formatOccurredAt = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const formatInningLabel = (inning, half) => `${inning}회${half === "BOTTOM" ? "말" : "초"}`;

const mapRelayEvent = (event) => ({
  id: event.id,
  stamp: `${formatInningLabel(event.inning, event.inningHalf)} ${event.outs}아웃`,
  clock: formatOccurredAt(event.occurredAt),
  headline: event.headline,
  detail: event.detail || "상세 설명이 아직 없습니다.",
  score: {
    away: event.awayScore,
    home: event.homeScore,
  },
  matchup: {
    batter: event.batter || "-",
    pitcher: event.pitcher || "-",
  },
  tag: event.tag || "PLAY",
});

const mapChatMessage = (message, currentUser) => {
  const isMine = Boolean(currentUser?.id && message.user?.id === currentUser.id);

  return {
    id: message.id,
    author: isMine ? currentUser?.nickname || "나" : message.user?.nickname || "사용자",
    team: isMine ? "mine" : "other",
    text: message.message,
    time: formatOccurredAt(message.createdAt),
    isMine,
  };
};

const normalizeLineup = (lineup) => {
  if (!Array.isArray(lineup)) {
    return [];
  }

  return lineup.map((player) => {
    if (typeof player === "string") {
      return player;
    }

    const order = player.order ? `${player.order}. ` : "";
    const position = player.position ? ` (${player.position})` : "";
    return `${order}${player.name || "-" }${position}`;
  });
};

const createInningScores = (liveData, game) => {
  const awayScores = liveData?.awayInningScores || game?.awayInningScores || [];
  const homeScores = liveData?.homeInningScores || game?.homeInningScores || [];
  const maxLength = Math.max(awayScores.length, homeScores.length, 9);

  return Array.from({ length: maxLength }, (_, index) => ({
    inning: index + 1,
    away: awayScores[index] ?? "-",
    home: homeScores[index] ?? "-",
  }));
};

const getGameStatusLabel = (status, isDemoGame) => {
  if (isDemoGame || status === 1) {
    return "LIVE";
  }

  if (status === 2) {
    return "FINAL";
  }

  return "SCHEDULED";
};

const LivePage = () => {
  const { gameId } = useParams();
  const isDemoGame = gameId === DEMO_GAME_ID;
  const chatGameId = isDemoGame ? DEMO_CHAT_GAME_ID : gameId;
  const [activeTab, setActiveTab] = useState("relay");
  const [game, setGame] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [relayEvents, setRelayEvents] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [demoIndex, setDemoIndex] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const chatMessagesRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);
  const isPinnedToBottomRef = useRef(true);
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  useLayoutEffect(() => {
    const container = chatMessagesRef.current;

    if (!container) {
      return;
    }

    if (isPinnedToBottomRef.current || shouldScrollToBottomRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
      shouldScrollToBottomRef.current = false;
    }
  }, [chatMessages]);

  const handleChatScroll = (event) => {
    const container = event.currentTarget;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    isPinnedToBottomRef.current = distanceFromBottom < 80;
  };

  useEffect(() => {
    if (!gameId) {
      return undefined;
    }

    if (isDemoGame) {
      setGame(demoGame);
      setLiveData(demoSnapshots[0].liveData);
      setRelayEvents(demoSnapshots[0].relayEvents);
      setLoading(false);
      setError("");
      return undefined;
    }

    let cancelled = false;

    const loadLivePage = async ({ silent } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        const [gameData, nextLiveData, relayData, chatData] = await Promise.all([
          getGame(gameId),
          getGameLive(gameId),
          getGameRelay(gameId, { limit: 30 }),
          getGameChat(gameId, { limit: 50 }),
        ]);

        if (cancelled) {
          return;
        }

        setGame(gameData);
        setLiveData(nextLiveData);
        setRelayEvents(Array.isArray(relayData) ? relayData.map(mapRelayEvent) : []);
        setChatMessages(
          Array.isArray(chatData)
            ? chatData.slice().reverse().map((message) => mapChatMessage(message, user))
            : []
        );
        setError("");
      } catch (loadError) {
        if (!cancelled) {
          setError("라이브 데이터를 불러오지 못했습니다. 백엔드 서버와 시드 데이터를 확인해 주세요.");
        }
      } finally {
        if (!cancelled && !silent) {
          setLoading(false);
        }
      }
    };

    loadLivePage();
    return () => {
      cancelled = true;
    };
  }, [gameId, isDemoGame]);

  useEffect(() => {
    if (isDemoGame) {
      const intervalId = window.setInterval(() => {
        setDemoIndex((current) => (current + 1) % demoSnapshots.length);
      }, POLLING_INTERVAL);

      return () => {
        window.clearInterval(intervalId);
      };
    }

    if (!gameId || !game) {
      return undefined;
    }

    let cancelled = false;

    const pollLivePage = async () => {
      try {
        if (game.status === 1) {
          const [gameData, nextLiveData, relayData] = await Promise.all([
            getGame(gameId),
            getGameLive(gameId),
            getGameRelay(gameId, { limit: 30 }),
          ]);

          if (cancelled) {
            return;
          }

          setGame(gameData);
          setLiveData(nextLiveData);
          setRelayEvents(Array.isArray(relayData) ? relayData.map(mapRelayEvent) : []);
          return;
        }

        const gameData = await getGame(gameId);

        if (cancelled) {
          return;
        }

        setGame(gameData);
      } catch (loadError) {
        if (!cancelled) {
          setError("라이브 데이터를 불러오지 못했습니다. 백엔드 서버와 시드 데이터를 확인해 주세요.");
        }
      }
    };

    const intervalId = window.setInterval(() => {
      pollLivePage();
    }, POLLING_INTERVAL);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [game, gameId, isDemoGame]);

  useEffect(() => {
    if (!isDemoGame) {
      return;
    }

    const snapshot = demoSnapshots[demoIndex];
    setGame({
      ...demoGame,
      awayScore: snapshot.liveData.awayScore,
      homeScore: snapshot.liveData.homeScore,
    });
    setLiveData(snapshot.liveData);
    setRelayEvents(snapshot.relayEvents);
  }, [demoIndex, isDemoGame]);

  useEffect(() => {
    if (!chatGameId) {
      if (isDemoGame) {
        setError("시연용 댓글을 연결하려면 VITE_DEMO_CHAT_GAME_ID에 실제 경기 ID를 넣어야 합니다.");
      }
      return undefined;
    }

    let cancelled = false;

    const loadChat = async () => {
      try {
        const chatData = await getGameChat(chatGameId, { limit: 50 });

        if (cancelled) {
          return;
        }

        setChatMessages(
          Array.isArray(chatData)
            ? chatData.slice().reverse().map((message) => mapChatMessage(message, user))
            : []
        );
        if (!isDemoGame) {
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError("실시간 댓글을 불러오지 못했습니다. 백엔드 chat API 상태를 확인해 주세요.");
        }
      }
    };

    loadChat();

    const intervalId = window.setInterval(loadChat, POLLING_INTERVAL);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [chatGameId, isDemoGame, user]);

  const handleSubmitMessage = async (event) => {
    event.preventDefault();

    const nextMessage = chatInput.trim();

    if (!nextMessage || !chatGameId) {
      return;
    }

    try {
      setSubmitting(true);
      shouldScrollToBottomRef.current = true;
      await postGameChat(chatGameId, nextMessage);
      setChatInput("");
      const chatData = await getGameChat(chatGameId, { limit: 50 });
      setChatMessages(
        Array.isArray(chatData)
          ? chatData.slice().reverse().map((message) => mapChatMessage(message, user))
          : []
      );
    } catch (submitError) {
      setError("댓글 등록에 실패했습니다. 로그인 상태와 백엔드 인증 설정을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChatKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const inningScores = useMemo(() => createInningScores(liveData, game), [game, liveData]);
  const awayLineup = useMemo(() => normalizeLineup(game?.awayLineup), [game?.awayLineup]);
  const homeLineup = useMemo(() => normalizeLineup(game?.homeLineup), [game?.homeLineup]);

  const currentScore = {
    away: liveData?.awayScore ?? game?.awayScore ?? 0,
    home: liveData?.homeScore ?? game?.homeScore ?? 0,
  };
  const currentState = {
    label: formatInningLabel(liveData?.currentInning ?? game?.currentInning ?? 1, liveData?.inningHalf ?? game?.inningHalf ?? "TOP"),
    balls: liveData?.balls ?? 0,
    strikes: liveData?.strikes ?? 0,
    outs: liveData?.outs ?? 0,
  };
  const currentBases = {
    first: liveData?.base1b ?? false,
    second: liveData?.base2b ?? false,
    third: liveData?.base3b ?? false,
  };
  const currentMatchup = {
    batter: liveData?.currentBatter || "-",
    pitcher: liveData?.currentPitcher || "-",
  };
  const isLiveGame = isDemoGame || game?.status === 1;
  const heroSummary = isLiveGame ? "문자중계 + 댓글" : "경기 결과 + 댓글";
  const livePanelDescription = isLiveGame
    ? "백엔드 live API 기준으로 주자 현황과 카운트를 표시합니다."
    : "종료된 경기의 최종 문자중계와 경기 상황을 표시합니다.";
  const livePanelBadge = isLiveGame ? "5초 주기 갱신" : "경기 종료";
  const relaySectionDescription = isLiveGame
    ? "현재 백엔드가 제공하는 relay/chat API를 기준으로 연동했습니다."
    : "종료된 경기의 문자중계 기록과 댓글을 확인할 수 있습니다.";
  const chatStatusBadge = isDemoGame
    ? "Demo Live + Real Chat"
    : isLiveGame
      ? "댓글 자동 갱신"
      : "댓글 유지 중";
  const matchupTitle = game
    ? `${game.awayTeam?.name || "Away"} vs ${game.homeTeam?.name || "Home"}`
    : "경기 정보 로딩 중";

  if (loading) {
    return (
      <div className="live-page">
        <div className="schedule-board__empty">
          <strong>Loading</strong>
          <p>라이브 데이터를 불러오는 중입니다.</p>
        </div>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="live-page">
        <div className="schedule-board__empty">
          <strong>API Error</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-page">
      <section className="live-page__hero">
        <div className="live-page__topbar">
          <Link to="/" className="live-page__back-link">
            경기 일정목록으로
          </Link>
        </div>
        <div className="live-page__hero-top">
          <div className="live-page__meta">
            <span className="live-page__eyebrow">
              {getGameStatusLabel(game?.status, isDemoGame)}
            </span>
            <h1 className="live-page__title">{matchupTitle}</h1>
            <p className="live-page__subtext">
              {heroSummary} · {game?.venue || "-"} · 경기 ID {gameId}
            </p>
          </div>

          <div className="live-page__status-grid">
            <div className="live-page__status-card">
              <span className="live-page__status-label">관중</span>
              <strong className="live-page__status-value">{game?.attendance || "-"}</strong>
            </div>
            <div className="live-page__status-card">
              <span className="live-page__status-label">날씨</span>
              <strong className="live-page__status-value">{game?.weather || "-"}</strong>
            </div>
            <div className="live-page__status-card">
              <span className="live-page__status-label">최근 투구</span>
              <strong className="live-page__status-value">{liveData?.lastPitch || "-"}</strong>
            </div>
          </div>
        </div>

        <div className="live-page__scoreboard">
          <article className="team-card">
            <div className="team-card__top">
              <div className="team-card__identity">
                <div className="team-card__badge">
                  {game?.awayTeam?.code || "AWAY"}
                </div>
                <div>
                  <span className="team-card__city">{game?.awayTeam?.city || ""}</span>
                  <span className="team-card__name">{game?.awayTeam?.name || "Away"}</span>
                </div>
              </div>
              <strong className="team-card__score">{currentScore.away}</strong>
            </div>
            <div className="team-card__statline">
              <span>H {game?.awayHits ?? 0}</span>
              <span>E {game?.awayErrors ?? 0}</span>
            </div>
          </article>

          <div className="live-page__center-panel">
            <div className="live-page__inning">
              <span className="live-page__inning-arrow">
                {(liveData?.inningHalf ?? game?.inningHalf) === "BOTTOM" ? "▼" : "▲"}
              </span>
              <span>{currentState.label}</span>
            </div>
            <div className="live-page__matchup">
              <div className="live-page__matchup-row">
                <span>타석</span>
                <strong>{currentMatchup.batter}</strong>
              </div>
              <div className="live-page__matchup-row">
                <span>투수</span>
                <strong>{currentMatchup.pitcher}</strong>
              </div>
              <div className="live-page__matchup-row">
                <span>최근 투구</span>
                <strong>{liveData?.lastPitch || "-"}</strong>
              </div>
            </div>
            <div className="live-page__mobile-compact">
              <span>{game?.attendance || "-"}</span>
              <span>{game?.weather || "-"}</span>
              <span>{currentMatchup.batter} vs {currentMatchup.pitcher}</span>
            </div>
          </div>

          <article className="team-card">
            <div className="team-card__top">
              <div className="team-card__identity">
                <div className="team-card__badge">
                  {game?.homeTeam?.code || "HOME"}
                </div>
                <div>
                  <span className="team-card__city">{game?.homeTeam?.city || ""}</span>
                  <span className="team-card__name">{game?.homeTeam?.name || "Home"}</span>
                </div>
              </div>
              <strong className="team-card__score">{currentScore.home}</strong>
            </div>
            <div className="team-card__statline">
              <span>H {game?.homeHits ?? 0}</span>
              <span>E {game?.homeErrors ?? 0}</span>
            </div>
          </article>
        </div>
      </section>

      <div className="live-page__content">
        <section className="live-page__left">
          <article className="live-page__panel">
            <div className="live-page__section-head">
              <div>
                <h2>현재 경기 상황</h2>
                <p>{livePanelDescription}</p>
              </div>
              <span className="live-page__pulse">{livePanelBadge}</span>
            </div>

            <div className="live-page__game-strip">
              <section className="diamond-card">
                <h3>베이스 현황</h3>
                <BaseDiamond bases={currentBases} />
                <div className="diamond-card__legend">
                  <span>1루 {currentBases.first ? "점유" : "비어있음"}</span>
                  <span>2루 {currentBases.second ? "점유" : "비어있음"}</span>
                  <span>3루 {currentBases.third ? "점유" : "비어있음"}</span>
                </div>
              </section>

              <section className="count-card">
                <h3>B / S / O 카운트</h3>
                <div className="count-card__row">
                  <CountIndicator label="Balls" count={currentState.balls} max={4} variant="balls" />
                  <CountIndicator label="Strikes" count={currentState.strikes} max={3} variant="strikes" />
                  <CountIndicator label="Outs" count={currentState.outs} max={3} variant="outs" />
                </div>
                <div className="count-card__pitch">
                  <strong>현재 상황:</strong> {currentState.label} · {currentMatchup.batter} vs{" "}
                  {currentMatchup.pitcher}
                </div>
              </section>

              <section className="score-table" aria-label="이닝 스코어보드">
                <table>
                  <thead>
                    <tr>
                      <th>TEAM</th>
                      {inningScores.map(({ inning }) => (
                        <th key={`inning-${inning}`}>{inning}</th>
                      ))}
                      <th>R</th>
                      <th>H</th>
                      <th>E</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="score-table__team">{game?.awayTeam?.code || "AWAY"}</td>
                      {inningScores.map(({ inning, away }) => (
                        <td key={`away-${inning}`}>{away}</td>
                      ))}
                      <td className="score-table__sum">{currentScore.away}</td>
                      <td>{game?.awayHits ?? 0}</td>
                      <td>{game?.awayErrors ?? 0}</td>
                    </tr>
                    <tr>
                      <td className="score-table__team">{game?.homeTeam?.code || "HOME"}</td>
                      {inningScores.map(({ inning, home }) => (
                        <td key={`home-${inning}`}>{home}</td>
                      ))}
                      <td className="score-table__sum">{currentScore.home}</td>
                      <td>{game?.homeHits ?? 0}</td>
                      <td>{game?.homeErrors ?? 0}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>
          </article>

          <article className="live-page__panel">
            <div className="live-page__section-head">
              <div>
                <h3>중계 정보</h3>
                <p>{relaySectionDescription}</p>
              </div>
              <div className="live-page__tabs" role="tablist" aria-label="라이브 정보 탭">
                {TAB_ITEMS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={activeTab === tab.key ? "is-active" : ""}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "relay" ? (
              <div className="relay-feed">
                {relayEvents.length > 0 ? (
                  relayEvents.map((event) => (
                    <article key={event.id} className="relay-item">
                      <div className="relay-item__stamp">
                        <strong>{event.stamp}</strong>
                        <span>{event.clock}</span>
                      </div>
                      <div className="relay-item__body">
                        <h3>{event.headline}</h3>
                        <p>{event.detail}</p>
                        <p className="relay-item__mobile-summary">{event.headline}</p>
                        <div className="relay-item__sub">
                          <span>
                            스코어 {event.score.away}:{event.score.home}
                          </span>
                          <span>
                            매치업 {event.matchup.batter} / {event.matchup.pitcher}
                          </span>
                        </div>
                      </div>
                      <span className="relay-item__tag">{event.tag}</span>
                    </article>
                  ))
                ) : (
                  <div className="schedule-board__empty">
                    <strong>중계 데이터 없음</strong>
                    <p>현재 등록된 relay 이벤트가 없습니다.</p>
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "lineup" ? (
              <div className="lineup-grid">
                <section className="lineup-card">
                  <h3>{game?.awayTeam?.name || "Away"} 선발 라인업</h3>
                  <ul>
                    {awayLineup.map((player) => (
                      <li key={player}>{player}</li>
                    ))}
                  </ul>
                </section>
                <section className="lineup-card">
                  <h3>{game?.homeTeam?.name || "Home"} 선발 라인업</h3>
                  <ul>
                    {homeLineup.map((player) => (
                      <li key={player}>{player}</li>
                    ))}
                  </ul>
                </section>
              </div>
            ) : null}

            {activeTab === "matchup" ? (
              <div className="matchup-grid">
                <section className="matchup-note">
                  <h3>타자 vs 투수</h3>
                  <p>
                    현재 매치업은 {currentMatchup.batter}와 {currentMatchup.pitcher} 입니다. live API에서
                    내려오는 현재 타석 정보를 그대로 사용합니다.
                  </p>
                </section>
                <section className="matchup-note">
                  <h3>확장 포인트</h3>
                  <p>
                    지금은 REST polling 기반입니다. 백엔드에서 소켓 이벤트를 추가하면 같은 화면에 실시간 push로
                    교체할 수 있습니다.
                  </p>
                </section>
              </div>
            ) : null}
          </article>
        </section>

        <aside className="live-page__panel chat-panel">
          <div className="chat-panel__status">
            <div>
              <h3>{isLiveGame ? "실시간 댓글" : "경기 댓글"}</h3>
              <p>
                {isLoggedIn ? `${user.nickname} 님으로 참여 중입니다.` : "댓글 작성은 로그인 후 가능합니다."}
              </p>
            </div>
            <span className="chat-panel__status-badge">{chatStatusBadge}</span>
          </div>

          {error ? <p className="chat-form__hint">{error}</p> : null}

          <div
            ref={chatMessagesRef}
            className="chat-panel__messages"
            aria-live="polite"
            onScroll={handleChatScroll}
          >
            {chatMessages.map((message) => (
              <article
                key={message.id}
                className={`chat-message ${message.isMine ? "chat-message--mine" : "chat-message--other"}`}
              >
                <div className="chat-message__meta">
                  <strong className={`chat-message__author chat-message__author--${message.team}`}>
                    {message.author}
                  </strong>
                  <span className="chat-message__time">{message.time}</span>
                </div>
                <p>{message.text}</p>
              </article>
            ))}
          </div>

          <form className="chat-form" onSubmit={handleSubmitMessage}>
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder={
                isLoggedIn ? "응원 메시지나 중계 반응을 입력하세요." : "로그인 후 댓글을 입력할 수 있습니다."
              }
              maxLength={180}
              disabled={!isLoggedIn || submitting}
            />
            <div className="chat-form__actions">
              {isLoggedIn ? (
                <>
                  <span className="chat-form__hint">{chatInput.length}/180</span>
                  <button type="submit" disabled={submitting}>
                    {submitting ? "전송 중..." : "메시지 보내기"}
                  </button>
                </>
              ) : (
                <Link to="/login" state={{ from: location }} className="chat-form__login-link">
                  로그인하고 댓글 달기
                </Link>
              )}
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default LivePage;
