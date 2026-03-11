import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import useAuth from "@/contexts/useAuth";
import {
  incomingChatQueue,
  incomingRelayQueue,
  initialChatMessages,
  initialRelayEvents,
  liveGameMock,
} from "./mockLiveData";
import "./LivePage.scss";

const TAB_ITEMS = [
  { key: "relay", label: "실시간 중계" },
  { key: "lineup", label: "라인업" },
  { key: "matchup", label: "매치업" },
];

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

const LivePage = () => {
  const { gameId } = useParams();
  const [activeTab, setActiveTab] = useState("relay");
  const [relayEvents, setRelayEvents] = useState(initialRelayEvents);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [chatInput, setChatInput] = useState("");
  const [relayIndex, setRelayIndex] = useState(0);
  const [chatIndex, setChatIndex] = useState(0);
  const messageAnchorRef = useRef(null);
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  const latestEvent = relayEvents[relayEvents.length - 1];
  const currentScore = latestEvent?.score ?? {
    away: liveGameMock.matchup.away.score,
    home: liveGameMock.matchup.home.score,
  };
  const currentState = latestEvent?.inningState ?? {
    label: "9회초",
    balls: 1,
    strikes: 2,
    outs: 2,
  };
  const currentBases = latestEvent?.bases ?? {
    first: false,
    second: true,
    third: false,
  };
  const currentMatchup = latestEvent?.matchup ?? {
    batter: "A. Rizzo",
    pitcher: "B. Treinen",
  };
  const matchupTitle = `${liveGameMock.matchup.away.name} vs ${liveGameMock.matchup.home.name}`;

  useEffect(() => {
    if (relayIndex >= incomingRelayQueue.length) {
      return undefined;
    }

    const relayTimer = window.setTimeout(() => {
      setRelayEvents((current) => [...current, incomingRelayQueue[relayIndex]]);
      setRelayIndex((current) => current + 1);
    }, 4200);

    return () => window.clearTimeout(relayTimer);
  }, [relayIndex]);

  useEffect(() => {
    if (chatIndex >= incomingChatQueue.length) {
      return undefined;
    }

    const chatTimer = window.setTimeout(() => {
      setChatMessages((current) => [...current, incomingChatQueue[chatIndex]]);
      setChatIndex((current) => current + 1);
    }, 3100);

    return () => window.clearTimeout(chatTimer);
  }, [chatIndex]);

  useEffect(() => {
    messageAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages]);

  const handleSubmitMessage = (event) => {
    event.preventDefault();

    const nextMessage = chatInput.trim();

    if (!nextMessage) {
      return;
    }

    setChatMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        author: "나",
        team: "neutral",
        text: nextMessage,
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      },
    ]);
    setChatInput("");
  };

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
            <span className="live-page__eyebrow">{liveGameMock.broadcastStatus}</span>
            <h1 className="live-page__title">{matchupTitle}</h1>
            <p className="live-page__subtext">
              실시간 문자중계 + 댓글 · {liveGameMock.venue} · 경기 ID {gameId ?? liveGameMock.gameId}
            </p>
          </div>

          <div className="live-page__status-grid">
            <div className="live-page__status-card">
              <span className="live-page__status-label">관중</span>
              <strong className="live-page__status-value">{liveGameMock.attendance}</strong>
            </div>
            <div className="live-page__status-card">
              <span className="live-page__status-label">MVP 흐름</span>
              <strong className="live-page__status-value">{liveGameMock.summary.probableMvp}</strong>
            </div>
            <div className="live-page__status-card">
              <span className="live-page__status-label">승리 확률</span>
              <strong className="live-page__status-value">
                NYY {liveGameMock.summary.winProbability.away}% / LAD{" "}
                {liveGameMock.summary.winProbability.home}%
              </strong>
            </div>
          </div>
        </div>

        <div className="live-page__scoreboard">
          <article className="team-card">
            <div className="team-card__top">
              <div className="team-card__identity">
                <div
                  className="team-card__badge"
                  style={{
                    background: liveGameMock.matchup.away.color,
                    color: liveGameMock.matchup.away.accent,
                  }}
                >
                  {liveGameMock.matchup.away.shortName}
                </div>
                <div>
                  <span className="team-card__city">{liveGameMock.matchup.away.city}</span>
                  <span className="team-card__name">{liveGameMock.matchup.away.name}</span>
                </div>
              </div>
              <strong className="team-card__score">{currentScore.away}</strong>
            </div>
            <div className="team-card__statline">
              <span>H {liveGameMock.matchup.away.hits}</span>
              <span>E {liveGameMock.matchup.away.errors}</span>
            </div>
          </article>

          <div className="live-page__center-panel">
            <div className="live-page__inning">
              <span className="live-page__inning-arrow">▲</span>
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
                <strong>{liveGameMock.summary.lastPitch}</strong>
              </div>
            </div>
            <div className="live-page__mobile-compact">
              <span>{liveGameMock.attendance}</span>
              <span>{liveGameMock.summary.probableMvp}</span>
              <span>{currentMatchup.batter} vs {currentMatchup.pitcher}</span>
            </div>
          </div>

          <article className="team-card">
            <div className="team-card__top">
              <div className="team-card__identity">
                <div
                  className="team-card__badge"
                  style={{
                    background: liveGameMock.matchup.home.color,
                    color: liveGameMock.matchup.home.accent,
                  }}
                >
                  {liveGameMock.matchup.home.shortName}
                </div>
                <div>
                  <span className="team-card__city">{liveGameMock.matchup.home.city}</span>
                  <span className="team-card__name">{liveGameMock.matchup.home.name}</span>
                </div>
              </div>
              <strong className="team-card__score">{currentScore.home}</strong>
            </div>
            <div className="team-card__statline">
              <span>H {liveGameMock.matchup.home.hits}</span>
              <span>E {liveGameMock.matchup.home.errors}</span>
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
                <p>주자 출루와 볼 · 스트라이크 · 아웃 카운트를 한눈에 볼 수 있게 정리했습니다.</p>
              </div>
              <span className="live-page__pulse">실시간 업데이트 반영 중</span>
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
                  <CountIndicator
                    label="Strikes"
                    count={currentState.strikes}
                    max={3}
                    variant="strikes"
                  />
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
                      {liveGameMock.inningScores.map(({ inning }) => (
                        <th key={`inning-${inning}`}>{inning}</th>
                      ))}
                      <th>R</th>
                      <th>H</th>
                      <th>E</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="score-table__team">{liveGameMock.matchup.away.shortName}</td>
                      {liveGameMock.inningScores.map(({ inning, away }) => (
                        <td key={`away-${inning}`}>{away}</td>
                      ))}
                      <td className="score-table__sum">{currentScore.away}</td>
                      <td>{liveGameMock.matchup.away.hits}</td>
                      <td>{liveGameMock.matchup.away.errors}</td>
                    </tr>
                    <tr>
                      <td className="score-table__team">{liveGameMock.matchup.home.shortName}</td>
                      {liveGameMock.inningScores.map(({ inning, home }) => (
                        <td key={`home-${inning}`}>{home}</td>
                      ))}
                      <td className="score-table__sum">{currentScore.home}</td>
                      <td>{liveGameMock.matchup.home.hits}</td>
                      <td>{liveGameMock.matchup.home.errors}</td>
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
                <p>백엔드 API가 들어오면 이 영역은 WebSocket / REST 응답 구조에 맞춰 바로 치환할 수 있습니다.</p>
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
                {relayEvents
                  .slice()
                  .reverse()
                  .map((event) => (
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
                  ))}
              </div>
            ) : null}

            {activeTab === "lineup" ? (
              <div className="lineup-grid">
                <section className="lineup-card">
                  <h3>{liveGameMock.matchup.away.name} 선발 라인업</h3>
                  <ul>
                    {liveGameMock.lineup.away.map((player) => (
                      <li key={player}>{player}</li>
                    ))}
                  </ul>
                </section>
                <section className="lineup-card">
                  <h3>{liveGameMock.matchup.home.name} 선발 라인업</h3>
                  <ul>
                    {liveGameMock.lineup.home.map((player) => (
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
                    현재 더미 데이터 기준 핵심 매치업은 {currentMatchup.batter}와 {currentMatchup.pitcher}
                    입니다. 타석별 예상 데이터가 정해지면 OPS, 구종별 결과, 최근 5타석 로그를 이 카드에
                    연결할 수 있습니다.
                  </p>
                </section>
                <section className="matchup-note">
                  <h3>UI 확장 포인트</h3>
                  <p>
                    백엔드 데이터 형태가 확정되면 투구 추적, WPA 변화, 타구 속도, 수비 위치까지 카드 단위로
                    확장할 수 있게 구조를 분리해두었습니다.
                  </p>
                </section>
              </div>
            ) : null}
          </article>
        </section>

        <aside className="live-page__panel chat-panel">
          <div className="chat-panel__status">
            <div>
              <h3>실시간 댓글</h3>
              <p>
                {isLoggedIn
                  ? `${user.nickname} 님으로 참여 중입니다.`
                  : "댓글 작성은 로그인 후 가능합니다."}
              </p>
            </div>
            <span className="chat-panel__status-badge">Socket Mock Connected</span>
          </div>

          <div className="chat-panel__messages" aria-live="polite">
            {chatMessages.map((message) => (
              <article key={message.id} className="chat-message">
                <div className="chat-message__meta">
                  <strong className={`chat-message__author chat-message__author--${message.team}`}>
                    {message.author}
                  </strong>
                  <span className="chat-message__time">{message.time}</span>
                </div>
                <p>{message.text}</p>
              </article>
            ))}
            <div ref={messageAnchorRef} />
          </div>

          <form className="chat-form" onSubmit={handleSubmitMessage}>
            <textarea
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder={
                isLoggedIn
                  ? "응원 메시지나 중계 반응을 입력하세요."
                  : "로그인 후 댓글을 입력할 수 있습니다."
              }
              maxLength={180}
              disabled={!isLoggedIn}
            />
            <div className="chat-form__actions">
              {isLoggedIn ? (
                <>
                  <span className="chat-form__hint">{chatInput.length}/180</span>
                  <button type="submit">메시지 보내기</button>
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
