import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import reg_image from "../assets/reg_image.jpeg";

export default function Home() {
  const { token, user, isLoading } = useAuthStore();
  const isLoggedIn = !!token;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-xl text-gray-600 font-semibold animate-pulse">
          Loading user details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* Hero Section */}
      <section className="bg-orange-50 border border-orange-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="space-y-4 md:w-1/2">
          <span className="bg-orange-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Early Access Program
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Welcome to <span className="text-orange-600">Labdox</span> Waitlist
          </h1>
          <p className="text-gray-600 text-lg">
            Join our exclusive platform for advanced engineering and technology courses.
            Get priority access, special launch offers, and direct updates.
          </p>

          {!isLoggedIn ? (
            <div className="flex items-center gap-4 pt-2">
              <Link
                to="/register"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition"
              >
                Join Waitlist Now
              </Link>
              <Link
                to="/login"
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-bold transition"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="pt-2">
              <Link
                to={user?.role === "admin" ? "/admin/users" : "/verify"}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition inline-block"
              >
                {user?.role === "admin" ? "Open Admin Panel" : "Complete Verification"}
              </Link>
            </div>
          )}
        </div>

        <div className="md:w-1/2 flex justify-center">
          <img
            src={reg_image}
            alt="Labdox Waitlist"
            className="rounded-xl shadow-lg max-h-72 object-cover"
          />
        </div>
      </section>

      {/* Logged-in User Dashboard Status */}
      {isLoggedIn && user && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
            Your Waitlist Account Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Details Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-3">
              <h3 className="font-bold text-gray-700 text-lg border-b pb-2">
                Personal Info
              </h3>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Full Name</p>
                <p className="font-semibold text-gray-800">{user.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Email Address</p>
                <p className="font-semibold text-gray-800">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Indian Mobile</p>
                <p className="font-semibold text-gray-800">{user.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase">Auth Method</p>
                <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded font-semibold uppercase">
                  {user.authProvider || "email_password"}
                </span>
              </div>
            </div>

            {/* Verification Status Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-700 text-lg border-b pb-2">
                Verification Status
              </h3>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Email Verification</span>
                {user.isEmailVerified ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    ✕ Unverified
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Phone Verification</span>
                {user.isPhoneVerified ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold">
                    ✕ Unverified
                  </span>
                )}
              </div>

              {(!user.isEmailVerified || !user.isPhoneVerified) && (
                <Link
                  to="/verify"
                  className="block text-center bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg text-sm transition"
                >
                  Verify Ownership Now
                </Link>
              )}
            </div>

            {/* Approval Status Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-3">
              <h3 className="font-bold text-gray-700 text-lg border-b pb-2">
                Waitlist Status
              </h3>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Approval State</p>
                {user.approvalStatus === "approved" && (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm font-medium">
                    <p className="font-bold text-base text-green-900 mb-1">🎉 Application Approved</p>
                    Congratulations! You have been granted early access to Labdox.
                  </div>
                )}
                {user.approvalStatus === "pending" && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm font-medium">
                    <p className="font-bold text-base text-yellow-900 mb-1">⏳ Under Review</p>
                    Your waitlist application is pending admin approval.
                    {!user.isEmailVerified || !user.isPhoneVerified ? (
                      <p className="text-xs text-yellow-700 mt-1 font-normal">
                        Note: Both Email & Phone must be verified for approval.
                      </p>
                    ) : null}
                  </div>
                )}
                {user.approvalStatus === "rejected" && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm font-medium">
                    <p className="font-bold text-base text-red-900 mb-1">✕ Application Rejected</p>
                    Please contact support if you believe this was an error.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}