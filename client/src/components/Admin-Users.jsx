import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-toastify";

export default function AdminUsers() {
  const { token } = useAuthStore();
  const {
    users,
    loading,
    filters,
    setFilter,
    fetchUsers,
    approveUser,
    rejectUser,
    deleteUser,
  } = useAdminStore();

  useEffect(() => {
    if (token) {
      fetchUsers(token);
    }
  }, [token, filters.q, filters.emailVerified, filters.phoneVerified, filters.approvalStatus]);

  const handleApprove = async (id, name) => {
    const res = await approveUser(id, token);
    if (res.success) {
      toast.success(`Approved ${name}`);
    } else {
      toast.error(res.msg || "Failed to approve user");
    }
  };

  const handleReject = async (id, name) => {
    const res = await rejectUser(id, token);
    if (res.success) {
      toast.info(`Rejected ${name}`);
    } else {
      toast.error(res.msg || "Failed to reject user");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}?`)) return;
    const res = await deleteUser(id, token);
    if (res.success) {
      toast.warn(`Deleted user ${name}`);
    } else {
      toast.error(res.msg || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Waitlist Applicants</h2>
          <p className="text-xs text-gray-500">
            Total registered users: {users.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={filters.q}
            onChange={(e) => setFilter("q", e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 w-48"
          />

          <select
            value={filters.emailVerified}
            onChange={(e) => setFilter("emailVerified", e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">All Email States</option>
            <option value="true">Email Verified</option>
            <option value="false">Email Unverified</option>
          </select>

          <select
            value={filters.phoneVerified}
            onChange={(e) => setFilter("phoneVerified", e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">All Phone States</option>
            <option value="true">Phone Verified</option>
            <option value="false">Phone Unverified</option>
          </select>

          <select
            value={filters.approvalStatus}
            onChange={(e) => setFilter("approvalStatus", e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">All Approval States</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-xs uppercase font-bold text-gray-600">
              <th className="p-3">Applicant</th>
              <th className="p-3">Contact Details</th>
              <th className="p-3">Reason & Use Case</th>
              <th className="p-3">Verifications</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-500 font-semibold">
                  Loading users data...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-500">
                  No applicants matching criteria found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-semibold text-gray-900">
                    <div>{user.fullName}</div>
                    <span className="text-[10px] text-gray-400 font-normal uppercase">
                      Provider: {user.authProvider || "email"}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="text-xs text-gray-800">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.phone}</div>
                  </td>

                  <td className="p-3 max-w-xs text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-semibold text-gray-700">Reason: </span>
                      {user.interestReason || "N/A"}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Use Case: </span>
                      {user.useCase || "N/A"}
                    </div>
                  </td>

                  <td className="p-3 space-y-1 text-xs">
                    <div>
                      {user.isEmailVerified ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Email ✓
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Email ✕
                        </span>
                      )}
                    </div>
                    <div>
                      {user.isPhoneVerified ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Phone ✓
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Phone ✕
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    {user.approvalStatus === "approved" && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                        Approved
                      </span>
                    )}
                    {user.approvalStatus === "pending" && (
                      <span className="bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                        Pending
                      </span>
                    )}
                    {user.approvalStatus === "rejected" && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                        Rejected
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center space-x-2 whitespace-nowrap">
                    {user.approvalStatus !== "approved" && (
                      <button
                        onClick={() => handleApprove(user._id, user.fullName)}
                        title="Approve User (Requires both Email & Phone Verified)"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded transition"
                      >
                        Approve
                      </button>
                    )}

                    {user.approvalStatus !== "rejected" && (
                      <button
                        onClick={() => handleReject(user._id, user.fullName)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-2.5 py-1 rounded transition"
                      >
                        Reject
                      </button>
                    )}

                    <Link
                      to={`/admin/users/${user._id}/edit`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-2.5 py-1 rounded inline-block transition"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(user._id, user.fullName)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
