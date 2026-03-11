import { useMemo, useState } from "react";
import AuthContext from "./AuthContext";

const AUTH_STORAGE_KEY = "full-count-auth-user";

const getInitialUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      login: (nickname) => {
        const nextUser = {
          nickname,
        };

        setUser(nextUser);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      },
      logout: () => {
        setUser(null);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
