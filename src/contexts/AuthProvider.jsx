import { useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import { clearAuth, loadAuth, saveAuth } from "./authStorage";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(loadAuth);
  const user = auth?.user ?? null;

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      login: (nextAuth) => {
        setAuth(nextAuth);
        saveAuth(nextAuth);
      },
      logout: () => {
        setAuth(null);
        clearAuth();
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
