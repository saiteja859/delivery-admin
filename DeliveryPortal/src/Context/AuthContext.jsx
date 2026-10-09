import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import deliveryApi from "../Services/deliveryApi";

const AuthContext = createContext(null);

const TOKEN_KEY = "deliveryToken";
const USER_KEY = "deliveryUser";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Failed to read stored delivery user:",
        error
      );

      localStorage.removeItem(USER_KEY);

      return null;
    }
  });

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(Boolean(token));

  const isAuthenticated = Boolean(token && user);

  const login = (loginToken, loginUser) => {
    localStorage.setItem(TOKEN_KEY, loginToken);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(loginUser)
    );

    setToken(loginToken);
    setUser(loginUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const validateToken = async () => {
      const storedToken =
        localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const data = await deliveryApi("/auth/me");

        if (data.success && data.user) {
          setUser(data.user);

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(data.user)
          );
        } else {
          logout();
        }
      } catch (error) {
        console.error(
          "Delivery authentication validation failed:",
          error
        );

        logout();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    validateToken();
  }, []);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  }, [token, user]);

  const value = {
    token,
    user,
    isAuthenticated,
    isCheckingAuth,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}