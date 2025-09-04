import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>; // or a spinner

  if (!role) return <Navigate to="/adminLogin" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;