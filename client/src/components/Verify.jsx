import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useVerificationStore } from "../store/useVerificationStore";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Verify() {
  const { user, token, getUser } = useAuthStore();
  const { sendEmailOtp, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp, loading } =
    useVerificationStore();

  const navigate = useNavigate();

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");

  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  useEffect(() => {
    let timer;
    if (phoneCooldown > 0) {
      timer = setInterval(() => setPhoneCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phoneCooldown]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-600 font-semibold">Please log in to verify your account details.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-orange-600 text-white font-bold px-6 py-2 rounded-lg"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Handle Email OTP Send
  const handleSendEmailOtp = async () => {
    const res = await sendEmailOtp(user.email, token);
    if (res.success) {
      toast.success(res.msg || "OTP sent to your email!");
      setEmailCooldown(60);
    } else {
      toast.error(res.msg || "Failed to send email OTP");
    }
  };

  // Handle Email OTP Verify
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!emailOtp || emailOtp.length !== 5) {
      toast.error("Please enter a valid 5-digit OTP");
      return;
    }

    const res = await verifyEmailOtp(user.email, emailOtp, token);
    if (res.success) {
      toast.success("Email verified successfully!");
      setEmailOtp("");
      await getUser();
    } else {
      toast.error(res.msg || "Invalid email OTP");
    }
  };

  // Handle Phone OTP Send
  const handleSendPhoneOtp = async () => {
    const res = await sendPhoneOtp(user.phone, token);
    if (res.success) {
      toast.success(res.msg || "OTP sent to your phone via Fast2SMS!");
      setPhoneCooldown(60);
    } else {
      toast.error(res.msg || "Failed to send phone OTP");
    }
  };

  // Handle Phone OTP Verify
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!phoneOtp || phoneOtp.length !== 5) {
      toast.error("Please enter a valid 5-digit OTP");
      return;
    }

    const res = await verifyPhoneOtp(user.phone, phoneOtp, token);
    if (res.success) {
      toast.success("Phone number verified successfully!");
      setPhoneOtp("");
      await getUser();
    } else {
      toast.error(res.msg || "Invalid phone OTP");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Ownership Verification
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Verify both your email address and Indian mobile number to complete your waitlist application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EMAIL VERIFICATION BOX */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Email Verification</h2>
              {user.isEmailVerified ? (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Verified
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✕ Pending
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Registered Email</p>
              <p className="font-semibold text-gray-800">{user.email}</p>
            </div>

            {user.isEmailVerified ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm">
                <p className="font-bold">Email Ownership Confirmed</p>
                Your email address has been verified successfully.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={loading || emailCooldown > 0}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {emailCooldown > 0
                      ? `Resend in ${emailCooldown}s`
                      : "Send Email OTP"}
                  </button>
                  <span className="text-xs text-gray-400">Expires in 5 min</span>
                </div>

                <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter 5-Digit Email OTP
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.trim())}
                      placeholder="e.g. 54321"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !emailOtp}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    Verify Email OTP
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* PHONE VERIFICATION BOX */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Phone SMS Verification</h2>
              {user.isPhoneVerified ? (
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✓ Verified
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                  ✕ Pending
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Indian Mobile Number</p>
              <p className="font-semibold text-gray-800">{user.phone}</p>
            </div>

            {user.isPhoneVerified ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm">
                <p className="font-bold">Phone Ownership Confirmed</p>
                Your phone number has been verified via SMS.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={loading || phoneCooldown > 0}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {phoneCooldown > 0
                      ? `Resend in ${phoneCooldown}s`
                      : "Send Phone OTP"}
                  </button>
                  <span className="text-xs text-gray-400">Expires in 5 min</span>
                </div>

                {useVerificationStore.getState().mockPhoneOtp && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-lg text-xs font-mono flex items-center justify-between">
                    <span>
                      <strong>Test Delivery OTP:</strong> {useVerificationStore.getState().mockPhoneOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhoneOtp(useVerificationStore.getState().mockPhoneOtp)}
                      className="bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded font-sans text-xs font-semibold"
                    >
                      Fill OTP
                    </button>
                  </div>
                )}

                <form onSubmit={handleVerifyPhoneOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Enter 5-Digit Phone OTP
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.trim())}
                      placeholder="e.g. 98765"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phoneOtp}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2 rounded-lg text-sm transition disabled:opacity-50"
                  >
                    Verify Phone OTP
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
