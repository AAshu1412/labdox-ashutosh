import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-toastify";

export default function AdminUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const { fetchUserById, updateUser, loading } = useAdminStore();

  const [formData, setFormData] = useState({
    fullName: "",
    interestReason: "",
    useCase: "",
  });

  useEffect(() => {
    if (id && token) {
      fetchUserById(id, token).then((res) => {
        if (res.success && res.user) {
          setFormData({
            fullName: res.user.fullName || "",
            interestReason: res.user.interestReason || "",
            useCase: res.user.useCase || "",
          });
        } else {
          toast.error("Failed to load user details");
        }
      });
    }
  }, [id, token, fetchUserById]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateUser(id, formData, token);
    if (res.success) {
      toast.success("User profile updated successfully!");
      navigate("/admin/users");
    } else {
      toast.error(res.msg || "Failed to update user");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Edit Applicant Details</h2>
          <p className="text-xs text-gray-500">
            Update user information for ID: {id}
          </p>
        </div>
        <Link
          to="/admin/users"
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition"
        >
          ← Back to Users
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Interest Reason
          </label>
          <textarea
            name="interestReason"
            required
            rows={3}
            value={formData.interestReason}
            onChange={handleInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Use Case
          </label>
          <textarea
            name="useCase"
            required
            rows={3}
            value={formData.useCase}
            onChange={handleInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-lg shadow transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
