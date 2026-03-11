# MLB 실시간 문자중계 및 응원 플랫폼 - 프론트엔드

온프레미스 Kubernetes 기반 MLB 실시간 문자중계 및 응원 플랫폼의 프론트엔드 프로젝트입니다.

## 기술 스택

- **React**: UI 라이브러리
- **Vite**: 빌드 도구
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트
- **Socket.io-client**: WebSocket 클라이언트
- **Sass**: 스타일링
- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅

## 실행 방법

### 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:5173 에서 실행됩니다.

### 빌드

```bash
npm run build
```

### 미리보기

```bash
npm run preview
```

### 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

## 프로젝트 구조

```
src/
  app/
    router.jsx          # 라우터 설정
  assets/               # 정적 자산
  components/           # 재사용 가능한 컴포넌트
  layouts/              # 레이아웃 컴포넌트
    MainLayout.jsx      # 메인 레이아웃
    AuthLayout.jsx      # 인증 레이아웃
  pages/                # 페이지 컴포넌트
    LoginPage/
    SignupPage/
    SchedulePage/
    LivePage/
  services/             # API 및 소켓 서비스
    api/
      client.js         # Axios 클라이언트
      authApi.js        # 인증 API
      gameApi.js        # 경기 API
      commentApi.js     # 댓글 API
    socket/
      socket.js         # Socket.io 클라이언트
  hooks/                # 커스텀 훅
  utils/                # 유틸리티 함수
  styles/               # 스타일 파일
    abstracts/
      _variables.scss   # 변수
    base/
      _reset.scss       # 리셋 스타일
      _base.scss        # 기본 스타일
    layout/
      _layout.scss      # 레이아웃 스타일
    main.scss           # 메인 스타일 파일
```

## 실행 방법

1. 의존성 설치:

   ```bash
   npm install
   ```

2. 환경 변수 설정:
   `.env.example`을 복사하여 `.env` 파일을 생성하고 필요한 값들을 설정하세요.

3. 개발 서버 실행:

   ```bash
   npm run dev
   ```

4. 빌드:
   ```bash
   npm run build
   ```

## 라우트

- `/login`: 로그인 페이지
- `/signup`: 회원가입 페이지
- `/`: 경기 일정 목록 페이지
- `/games/:gameId/live`: 문자중계 + 실시간 댓글 페이지

## 현재 구현 상태

### 라이브 페이지 프로토타입

- MLB 문자중계 스타일의 실시간 경기 화면 구현
- 이닝 스코어보드, 베이스 현황, B/S/O 카운트, 타자/투수 매치업 표시
- 실시간 이벤트 타임라인 UI 구현
- 실시간 댓글 UI 구현
- 모바일에서는 댓글 영역을 우선 노출하고 경기 정보는 축약 표시

### 더미 데이터 기반 동작

- 백엔드 API 미연동 상태를 고려해 `src/pages/LivePage/mockLiveData.js` 기준으로 화면 구성
- 중계 이벤트와 댓글은 일정 시간 간격으로 순차 반영되도록 구성
- 실제 백엔드 연동 시 경기 상세, 중계 이벤트, 채팅 메시지를 각각 API / WebSocket으로 치환 가능

### 인증 연계 참고

- 현재 댓글 작성 UX는 로그인 상태를 고려한 구조로 작성되어 있음
- 인증 페이지 구현은 별도 작업 브랜치와 병합될 수 있어, 실제 로그인 여부 판별 방식은 추후 백엔드/인증 구현에 맞춰 조정 필요

## 라이브 데이터 예시

```json
{
  "gameId": "20260311-nyy-lad",
  "venue": "Dodger Stadium",
  "broadcastStatus": "LIVE",
  "matchup": {
    "away": {
      "name": "Yankees",
      "shortName": "NYY",
      "score": 5,
      "hits": 9,
      "errors": 0
    },
    "home": {
      "name": "Dodgers",
      "shortName": "LAD",
      "score": 4,
      "hits": 8,
      "errors": 1
    }
  }
}
```

```json
{
  "id": 5,
  "stamp": "8회초 1아웃",
  "headline": "저지 솔로 홈런",
  "detail": "높게 들어온 체인지업을 걷어 올려 좌측 담장을 넘깁니다.",
  "score": {
    "away": 5,
    "home": 6
  },
  "inningState": {
    "label": "8회초",
    "outs": 1,
    "balls": 0,
    "strikes": 0
  },
  "bases": {
    "first": false,
    "second": false,
    "third": false
  },
  "matchup": {
    "batter": "A. Judge",
    "pitcher": "E. Phillips"
  },
  "tag": "HR"
}
```

```json
{
  "id": 4,
  "author": "클러치히어로",
  "team": "away",
  "text": "저지 홈런이면 바로 다시 붙는다",
  "time": "21:27"
}
```

## 백엔드 연동

- REST API: Axios를 통해 백엔드 API와 연동
- WebSocket: 실시간 데이터 수신을 위한 Socket.io 사용

## 기여

이 프로젝트는 팀 프로젝트입니다. 변경 사항은 GitHub에 커밋하여 공유하세요.
