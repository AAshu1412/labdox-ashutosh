import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-toastify";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const getUser = useAuthStore((state) => state.getUser);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      getUser().then(() => {
        toast.success("Google authentication successful!");
        const user = useAuthStore.getState().user;
        if (user?.role === "admin") {
          navigate("/admin/users");
        } else {
          navigate("/");
        }
      });
    } else {
      toast.error("Authentication token missing");
      navigate("/login");
    }
  }, [searchParams, navigate, setToken, getUser]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-semibold">Completing authentication...</p>
    </div>
  );
}
