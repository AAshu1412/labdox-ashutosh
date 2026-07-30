import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-toastify";

export default function Logout() {
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    logout();
    toast.info("Logged out successfully");
  }, [logout]);

  return <Navigate to="/login" replace />;
}
