"use client";

import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export type Investment = {
  id: string;
  issuance: string;
  date: string; // ISO
  amount: number;
  status: "pending" | "confirmed" | "cancelled";
  documentUrl?: string;
  bonds?: number;
};

export type InvestmentsState = {
  items: Investment[];
};

const initialState: InvestmentsState = {
  items: [],
};

const investmentsSlice = createSlice({
  name: "investments",
  initialState,
  reducers: {
    addInvestment: {
      reducer(state, action: PayloadAction<Investment>) {
        state.items.unshift(action.payload);
      },
      prepare(payload: Omit<Investment, "id">) {
        return { payload: { id: nanoid(), ...payload } };
      },
    },
    setInvestments(state, action: PayloadAction<Investment[]>) {
      state.items = action.payload.map((item) => ({
        ...item,
        id: item.id || nanoid(),
      }));
    },
  },
});

export const { addInvestment, setInvestments } = investmentsSlice.actions;
export default investmentsSlice.reducer;


