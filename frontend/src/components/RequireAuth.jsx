import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingState } from "./ui";

export default function RequireAuth({ children }) {
  const { user, loading, token } = useAuth();
  if (loading) return <LoadingState label="Checking session…" />;
  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
}
