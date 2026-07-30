import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const { token, user, logout } = useAuthStore();
  const isLoggedIn = !!token;

  return (
    <nav className="bg-orange-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <NavLink to="/" className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <span>Labdox</span>
          <span className="text-xs bg-white text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
            Waitlist
          </span>
        </NavLink>

        <ul className="flex items-center space-x-6 text-lg font-medium">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "underline underline-offset-4 font-bold" : "hover:text-orange-200"
              }
            >
              Home
            </NavLink>
          </li>

          {isLoggedIn && user?.role === "user" && (
            <li>
              <NavLink
                to="/verify"
                className={({ isActive }) =>
                  isActive ? "underline underline-offset-4 font-bold" : "hover:text-orange-200"
                }
              >
                Verification
              </NavLink>
            </li>
          )}

          {isLoggedIn && user?.role === "admin" && (
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  isActive
                    ? "bg-orange-700 px-3 py-1 rounded-md font-bold"
                    : "bg-orange-700/60 hover:bg-orange-700 px-3 py-1 rounded-md"
                }
              >
                Admin Panel
              </NavLink>
            </li>
          )}

          {isLoggedIn ? (
            <li className="flex items-center gap-4">
              <span className="text-sm bg-orange-700 px-3 py-1 rounded-full border border-orange-400">
                Hi, {user?.fullName || "User"}
              </span>
              <NavLink
                to="/logout"
                className="bg-white text-orange-600 hover:bg-orange-100 px-4 py-1.5 rounded-md font-semibold text-sm transition"
              >
                Logout
              </NavLink>
            </li>
          ) : (
            <>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive ? "underline underline-offset-4 font-bold" : "hover:text-orange-200"
                  }
                >
                  Register
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  className="bg-white text-orange-600 hover:bg-orange-100 px-4 py-1.5 rounded-md font-semibold text-sm transition"
                >
                  Login
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
