"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AdminUser } from "@/lib/mockApi";

type AdminAuthState = {
  isAuthenticated: boolean;
  user: AdminUser | null;
};

const initialState: AdminAuthState = {
  isAuthenticated: false,
  user: null,
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    adminLoginSuccess(state, action: PayloadAction<AdminUser>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      if (typeof document !== "undefined") {
        document.cookie = "admin_auth=1; path=/";
        localStorage.setItem("admin_user", JSON.stringify(action.payload));
      }
    },
    adminLogout(state) {
      state.isAuthenticated = false;
      state.user = null;
      if (typeof document !== "undefined") {
        document.cookie = "admin_auth=; Max-Age=0; path=/";
        localStorage.removeItem("admin_user");
      }
    },
    hydrateAdminFromStorage(state) {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem("admin_user");
        if (raw) {
          state.user = JSON.parse(raw);
          state.isAuthenticated = true;
        }
      } catch {}
    },
  },
});

export const { adminLoginSuccess, adminLogout, hydrateAdminFromStorage } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;

