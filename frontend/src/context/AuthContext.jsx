import { createContext, useState, useEffect } from "react";
import API from "../api";
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await API.get("/admin/me"); // 👈 automatically includes cookie
      setRole(res.data.role);
      setUserId(res.data.userId);
    } catch (err) {
      setRole(null);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ role, userId, loading, fetchUser, setRole, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
