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
        // Store admin auth flag
        document.cookie = "admin_auth=1; path=/";
        
        // Store admin JWT token in cookie (separate from regular user auth_token)
        if (action.payload.token) {
          // Set cookie with 7 days expiration (adjust as needed)
          const expirationDays = 7;
          const expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + expirationDays * 24 * 60 * 60 * 1000);
          document.cookie = `admin_token=${action.payload.token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
        }
        
        // Store admin user in localStorage
        localStorage.setItem("admin_user", JSON.stringify(action.payload));
        
        // Store admin token in localStorage (separate from regular user auth_token)
        if (action.payload.token) {
          localStorage.setItem("admin_token", action.payload.token);
        }
      }
    },
    adminLogout(state) {
      state.isAuthenticated = false;
      state.user = null;
      if (typeof document !== "undefined") {
        // Clear admin auth flag
        document.cookie = "admin_auth=; Max-Age=0; path=/";
        
        // Clear admin token cookie (keep regular auth_token untouched)
        document.cookie = "admin_token=; Max-Age=0; path=/";
        
        // Clear localStorage (keep regular auth_token untouched)
        localStorage.removeItem("admin_user");
        localStorage.removeItem("admin_token");
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

