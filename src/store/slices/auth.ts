"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: string;
  type: "individual" | "business";
  email: string;
  name: string;
  emailVerified?: boolean;
};

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthUser & { token?: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      if (typeof document !== "undefined") {
        // Save token to cookie (for server-side and axios interceptor)
        const token = action.payload.token;
        if (token) {
          // Set cookie with max age of 7 days (adjust as needed)
          const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
          document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        }
        // Also set auth cookie for middleware
        document.cookie = "auth=1; path=/; max-age=604800; SameSite=Lax"; // 7 days
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
        if (token) {
          localStorage.setItem("auth_token", token);
        }
      }
    },
    setEmailVerified(state) {
      if (state.user) {
        state.user.emailVerified = true;
        if (typeof document !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(state.user));
        }
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      if (typeof document !== "undefined") {
        // Clear all auth cookies
        document.cookie = "auth=; Max-Age=0; path=/";
        document.cookie = "auth_token=; Max-Age=0; path=/";
        document.cookie = "token=; Max-Age=0; path=/";
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    },
    hydrateFromStorage(state) {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem("auth_user");
        if (raw) {
          const user = JSON.parse(raw);
          state.user = user;
          state.isAuthenticated = true;
          
          // Restore auth cookies if token exists
          const token = localStorage.getItem("auth_token") || user.token;
          if (token && typeof document !== "undefined") {
            const maxAge = 7 * 24 * 60 * 60; // 7 days
            document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
            document.cookie = "auth=1; path=/; max-age=604800; SameSite=Lax";
          }
        }
      } catch {}
    },
  },
});

export const { loginSuccess, logout, hydrateFromStorage, setEmailVerified } = authSlice.actions;
export default authSlice.reducer;


