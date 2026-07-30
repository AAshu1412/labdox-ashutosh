import { create } from "zustand";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("token") || "",
  user: null,
  isLoading: true,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: "", user: null, isLoading: false });
  },

  getUser: async () => {
    const { token } = get();
    if (!token) {
      set({ user: null, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await fetch(`${API_URL}/api/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        set({ user: data.msg, isLoading: false });
      } else {
        localStorage.removeItem("token");
        set({ token: "", user: null, isLoading: false });
      }
    } catch (error) {
      console.error("getUser error:", error);
      set({ isLoading: false });
    }
  },

  login: async (loginDetails) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginDetails),
      });

      const data = await response.json();
      if (response.ok) {
        get().setToken(data.token);
        await get().getUser();
        return { success: true, msg: data.msg };
      } else {
        return { success: false, msg: data.extraDetails || data.msg };
      }
    } catch (error) {
      console.error("Login fetch error:", error);
      return { success: false, msg: "Failed to connect to server" };
    }
  },

  register: async (registrationDetails) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationDetails),
      });

      const data = await response.json();
      if (response.ok) {
        get().setToken(data.token);
        await get().getUser();
        return { success: true, msg: data.msg };
      } else {
        return { success: false, msg: data.extraDetails || data.msg };
      }
    } catch (error) {
      console.error("Register fetch error:", error);
      return { success: false, msg: "Failed to connect to server" };
    }
  },

  completeGoogleRegistration: async (details) => {
    try {
      const response = await fetch(
        `${API_URL}/api/oauth/google/complete-registration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(details),
        }
      );

      const data = await response.json();
      if (response.ok) {
        get().setToken(data.token);
        await get().getUser();
        return { success: true, msg: data.msg };
      } else {
        return { success: false, msg: data.extraDetails || data.msg };
      }
    } catch (error) {
      console.error("Complete Google Reg error:", error);
      return { success: false, msg: "Failed to complete registration" };
    }
  },
}));
