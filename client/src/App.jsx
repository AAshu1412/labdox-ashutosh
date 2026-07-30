import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Verify from "./components/Verify";
import CompleteGoogleReg from "./components/CompleteGoogleReg";
import AuthSuccess from "./components/AuthSuccess";
import AuthError from "./components/AuthError";
import ErrorPage from "./components/Error";
import Footer from "./components/Footer";

import AdminLayout from "./components/layouts/Admin-Layout";
import AdminUsers from "./components/Admin-Users";
import AdminUpdate from "./components/Admin-Update";

import { useAuthStore } from "./store/useAuthStore";

function App() {
  const getUser = useAuthStore((state) => state.getUser);

  useEffect(() => {
    getUser();
  }, [getUser]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <BrowserRouter>
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/complete-registration" element={<CompleteGoogleReg />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/auth-error" element={<AuthError />} />

            {/* Admin OAuth redirect routes */}
            <Route path="/admin/auth-success" element={<AuthSuccess />} />
            <Route path="/admin/auth-error" element={<AuthError />} />

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id/edit" element={<AdminUpdate />} />
            </Route>

            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
