const runtimeConfig =
  typeof window !== "undefined" && window.__APP_CONFIG__
    ? window.__APP_CONFIG__
    : {};

const envConfig = import.meta.env;

export const getRuntimeConfig = (key, fallback = "") =>
  runtimeConfig[key] ?? envConfig[key] ?? fallback;

export const appConfig = {
  apiBaseUrl: getRuntimeConfig("VITE_API_BASE_URL", "/api"),
  wsUrl: getRuntimeConfig("VITE_WS_URL", ""),
  wsPath: getRuntimeConfig("VITE_WS_PATH", "/socket.io"),
  defaultGameDate: getRuntimeConfig("VITE_DEFAULT_GAME_DATE", ""),
  demoGameDate: getRuntimeConfig("VITE_DEMO_GAME_DATE", ""),
  demoChatGameId: getRuntimeConfig("VITE_DEMO_CHAT_GAME_ID", ""),
};
