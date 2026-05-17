import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../lib/api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const savedToken = localStorage.getItem("peblo_token");
    const savedUser = localStorage.getItem("peblo_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("peblo_token", data.token);
    localStorage.setItem("peblo_user", JSON.stringify(data.user));
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("peblo_token", data.token);
    localStorage.setItem("peblo_user", JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("peblo_token");
    localStorage.removeItem("peblo_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
