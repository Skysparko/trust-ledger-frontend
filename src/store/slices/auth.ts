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
    loginSuccess(state, action: PayloadAction<AuthUser>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      if (typeof document !== "undefined") {
        document.cookie = "auth=1; path=/";
        localStorage.setItem("auth_user", JSON.stringify(action.payload));
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
        document.cookie = "auth=; Max-Age=0; path=/";
        localStorage.removeItem("auth_user");
      }
    },
    hydrateFromStorage(state) {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem("auth_user");
        if (raw) {
          state.user = JSON.parse(raw);
          state.isAuthenticated = true;
        }
      } catch {}
    },
  },
});

export const { loginSuccess, logout, hydrateFromStorage, setEmailVerified } = authSlice.actions;
export default authSlice.reducer;


