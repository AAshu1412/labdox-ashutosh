import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-toastify";
import login_image from "../assets/login_image.jpeg";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      toast.success("Login successful!");
      const user = useAuthStore.getState().user;
      if (user?.role === "admin") {
        navigate("/admin/users");
      } else {
        navigate("/");
      }
    } else {
      toast.error(result.msg || "Login failed");
    }
  };

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleGoogleUserLogin = () => {
    window.location.href = `${API_URL}/api/oauth/google`;
  };

  const handleGoogleAdminLogin = () => {
    window.location.href = `${API_URL}/api/oauth/google/admin`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <main className="flex flex-col md:flex-row items-center justify-center gap-12">
        <div className="hidden md:block w-1/2">
          <img
            src={login_image}
            alt="Login"
            className="rounded-2xl shadow-xl w-full max-h-[500px] object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 bg-white p-8 border border-gray-200 rounded-2xl shadow-sm space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Log in to check your waitlist status or verify ownership
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleUserLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-lg shadow-sm transition text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold py-2 px-4 rounded-lg shadow transition text-xs"
            >
              🔒 Admin Google Login (career@labdox.com)
            </button>
          </div>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="text-xs text-gray-400 font-semibold uppercase">Or sign in with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInput}
                placeholder="name@domain.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInput}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg shadow transition text-sm disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 pt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-orange-600 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
