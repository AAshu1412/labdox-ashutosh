import { create } from "zustand";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useAdminStore = create((set, get) => ({
  users: [],
  currentUser: null,
  loading: false,
  filters: {
    q: "",
    emailVerified: "",
    phoneVerified: "",
    approvalStatus: "",
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  fetchUsers: async (token) => {
    try {
      set({ loading: true });
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.q) params.append("q", filters.q);
      if (filters.emailVerified) params.append("emailVerified", filters.emailVerified);
      if (filters.phoneVerified) params.append("phoneVerified", filters.phoneVerified);
      if (filters.approvalStatus) params.append("approvalStatus", filters.approvalStatus);

      const url = `${API_URL}/api/admin/users?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      set({ loading: false });
      if (response.ok) {
        set({ users: data.users || [] });
      } else {
        console.error("fetchUsers error:", data.msg);
      }
    } catch (error) {
      console.error("fetchUsers catch error:", error);
      set({ loading: false });
    }
  },

  fetchUserById: async (id, token) => {
    try {
      set({ loading: true });
      const response = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      set({ loading: false });
      if (response.ok) {
        set({ currentUser: data.user });
        return { success: true, user: data.user };
      } else {
        return { success: false, msg: data.msg };
      }
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Failed to fetch user" };
    }
  },

  approveUser: async (id, token) => {
    try {
      set({ loading: true });
      const response = await fetch(
        `${API_URL}/api/admin/users/approve/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      set({ loading: false });
      if (response.ok) {
        await get().fetchUsers(token);
        return { success: true, msg: data.msg };
      } else {
        return { success: false, msg: data.msg };
      }
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Failed to approve user" };
    }
  },

  rejectUser: async (id, token) => {
    try {
      set({ loading: true });
      const response = await fetch(
        `${API_URL}/api/admin/users/reject/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      set({ loading: false });
      if (response.ok) {
        await get().fetchUsers(token);
        return { success: true, msg: data.msg };
      } else {
        return { success: false, msg: data.msg };
      }
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Failed to reject user" };
    }
  },

  updateUser: async (id, updateData, token) => {
    try {
      set({ loading: true });
      const response = await fetch(
        `${API_URL}/api/admin/users/update/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();
      set({ loading: false });
      if (response.ok) {
        await get().fetchUsers(token);
        return { success: true, msg: data.msg };
      } else {
        return { success: false, msg: data.msg };
      }
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Failed to update user" };
    }
  },

  deleteUser: async (id, token) => {
    try {
      set({ loading: true });
      const response = await fetch(
        `${API_URL}/api/admin/users/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      set({ loading: false });
      if (response.ok) {
        await get().fetchUsers(token);
        return { success: true, msg: data.msg };
      } else {
        return { success: false, msg: data.msg };
      }
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Failed to delete user" };
    }
  },
}));
