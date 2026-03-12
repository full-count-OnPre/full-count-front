export const AUTH_STORAGE_KEY = "full-count-auth";

export const loadAuth = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const saveAuth = (auth) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const clearAuth = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAccessToken = () => loadAuth()?.accessToken ?? null;

const decodeJwtPayload = (token) => {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getUserIdFromAccessToken = (token) => decodeJwtPayload(token)?.sub ?? null;

export const createAuthUser = ({ email, nickname, id }) => ({
  id,
  email,
  nickname: nickname || email?.split("@")[0] || "사용자",
});
