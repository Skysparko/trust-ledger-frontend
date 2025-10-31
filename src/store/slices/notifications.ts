"use client";

import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  date: string; // ISO
  read: boolean;
};

export type NotificationsState = {
  items: NotificationItem[];
};

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: {
      reducer(state, action: PayloadAction<NotificationItem>) {
        state.items.unshift(action.payload);
      },
      prepare(payload: Omit<NotificationItem, "id" | "read">) {
        return { payload: { id: nanoid(), read: false, ...payload } };
      },
    },
    markRead(state, action: PayloadAction<string>) {
      const n = state.items.find((i) => i.id === action.payload);
      if (n) n.read = true;
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true));
    },
  },
});

export const { addNotification, markRead, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;


