"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UIState = {
  subscriptionOpen: boolean;
  subscriptionDefaults?: { issuance?: string };
};

const initialState: UIState = {
  subscriptionOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openSubscription(state, action: PayloadAction<{ issuance?: string } | undefined>) {
      state.subscriptionOpen = true;
      state.subscriptionDefaults = action?.payload;
    },
    closeSubscription(state) {
      state.subscriptionOpen = false;
      state.subscriptionDefaults = undefined;
    },
  },
});

export const { openSubscription, closeSubscription } = uiSlice.actions;
export default uiSlice.reducer;


