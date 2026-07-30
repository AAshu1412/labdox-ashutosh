import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-toastify";

export default function CompleteGoogleReg() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const completeGoogleRegistration = useAuthStore(
    (state) => state.completeGoogleRegistration
  );

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    interestReason: "",
    useCase: "",
    google_id: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rawData = searchParams.get("googleData");
    if (rawData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rawData));
        setFormData((prev) => ({
          ...prev,
          email: parsed.email || "",
          fullName: parsed.fullName || "",
          google_id: parsed.google_id || "",
        }));
      } catch (err) {
        console.error("Error parsing googleData:", err);
      }
    }
  }, [searchParams]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await completeGoogleRegistration(formData);
    setLoading(false);

    if (res.success) {
      toast.success("Google signup complete! Please verify your phone number.");
      navigate("/verify");
    } else {
      toast.error(res.msg || "Failed to complete registration");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Almost Done!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Complete your profile details to join the Labdox waitlist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Full Name (from Google)
            </label>
            <input
              type="text"
              name="fullName"
              readOnly
              value={formData.fullName}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email (Verified by Google)
            </label>
            <input
              type="email"
              name="email"
              readOnly
              value={formData.email}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Indian Mobile Number (+91)
            </label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInput}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Interest Reason
            </label>
            <input
              type="text"
              name="interestReason"
              required
              value={formData.interestReason}
              onChange={handleInput}
              placeholder="Why are you interested in Labdox?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Use Case
            </label>
            <input
              type="text"
              name="useCase"
              required
              value={formData.useCase}
              onChange={handleInput}
              placeholder="What is your primary use case?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-lg shadow transition text-sm disabled:opacity-50"
          >
            {loading ? "Completing Profile..." : "Complete Waitlist Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}
