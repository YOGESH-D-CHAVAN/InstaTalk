import { createContext, useContext, useState, useEffect } from "react";
import API, { setToken } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setToken(token);
        try {
          const res = await API.get("/auth/me");
          setUser(res.data);
        } catch (err) {
          console.error("Auth check failed:", err);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (form) => {
    const res = await API.post("/auth/login", form);
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    return user;
  };

  const register = async (form) => {
    const res = await API.post("/auth/register", form);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>

      {!loading && children}
    </AuthContext.Provider>
  );
};
