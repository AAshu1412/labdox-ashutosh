import { create } from "zustand";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const useVerificationStore = create((set) => ({
  loading: false,
  mockPhoneOtp: "",

  sendEmailOtp: async (email, token) => {
    try {
      set({ loading: true });
      const response = await fetch(`${API_URL}/api/verify/sendemailotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      set({ loading: false });
      return { success: response.ok, msg: data.msg };
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Server error sending email OTP" };
    }
  },

  verifyEmailOtp: async (email, otp, token) => {
    try {
      set({ loading: true });
      const response = await fetch(`${API_URL}/api/verify/verifyemailotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      set({ loading: false });
      return { success: response.ok, msg: data.msg };
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Server error verifying email OTP" };
    }
  },

  sendPhoneOtp: async (phone, token) => {
    try {
      set({ loading: true });
      const response = await fetch(`${API_URL}/api/verify/sendphoneotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      set({ loading: false, mockPhoneOtp: data.mockOtp || "" });
      return { success: response.ok, msg: data.msg, mockOtp: data.mockOtp };
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Server error sending phone OTP" };
    }
  },

  verifyPhoneOtp: async (phone, otp, token) => {
    try {
      set({ loading: true });
      const response = await fetch(`${API_URL}/api/verify/verifyphoneotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      set({ loading: false });
      return { success: response.ok, msg: data.msg };
    } catch (error) {
      set({ loading: false });
      return { success: false, msg: "Server error verifying phone OTP" };
    }
  },
}));
