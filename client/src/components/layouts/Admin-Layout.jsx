import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

export default function AdminLayout() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600 font-semibold animate-pulse">
          Verifying admin credentials...
        </p>
      </div>
    );
  }

  // Strict Admin RBAC Guard
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <header className="bg-gray-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">
            Waitlist User Management & Verification Controls
          </p>
        </div>

        <nav className="flex items-center space-x-4">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive
                ? "bg-orange-600 text-white font-bold text-sm px-4 py-2 rounded-lg"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm px-4 py-2 rounded-lg"
            }
          >
            User Management
          </NavLink>
        </nav>
      </header>

      <main className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <Outlet />
      </main>
    </div>
  );
}
