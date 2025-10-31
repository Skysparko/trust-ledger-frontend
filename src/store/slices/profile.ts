"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type BankDetails = {
  iban: string;
  accountName: string;
  bic?: string;
};

export type ProfileState = {
  name: string;
  email: string;
  phone?: string;
  bank?: BankDetails;
  kycDocumentName?: string;
  agreementSigned?: boolean;
};

const initialState: ProfileState = {
  name: "",
  email: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Partial<ProfileState>>) {
      return { ...state, ...action.payload };
    },
    setKycDocument(state, action: PayloadAction<string | undefined>) {
      state.kycDocumentName = action.payload;
    },
    setAgreementSigned(state, action: PayloadAction<boolean>) {
      state.agreementSigned = action.payload;
    },
    hydrateFromAuth(state, action: PayloadAction<{ name: string; email: string }>) {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
  },
});

export const { setProfile, setKycDocument, setAgreementSigned, hydrateFromAuth } = profileSlice.actions;
export default profileSlice.reducer;


