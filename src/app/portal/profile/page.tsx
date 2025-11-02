"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store";
import { hydrateFromStorage } from "@/store/slices/auth";
import { hydrateFromAuth, setKycDocument, setProfile } from "@/store/slices/profile";
import { AuthApi } from "@/api/auth.api";
import { useUserProfile, useUpdateUserProfile, useUserUploadKycDocument, useToggleTwoFactor, useUpdateWallet } from "@/hooks/swr/useUser";
import { Lock, KeyRound, ShieldCheck, Wallet, Eye, EyeOff, Copy, Check } from "lucide-react";

const profileValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^\+?[\d\s-()]+$/, "Invalid phone number format")
    .optional(),
  iban: Yup.string()
    .matches(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/, "Invalid IBAN format")
    .required("IBAN is required"),
  accountName: Yup.string()
    .min(2, "Account name must be at least 2 characters")
    .required("Account name is required"),
  bic: Yup.string()
    .matches(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/, "Invalid BIC/SWIFT format")
    .optional(),
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth.user);
  const profile = useAppSelector((s) => s.profile);
  
  // Fetch profile from API
  const { profile: apiProfile, isLoading: profileLoading, mutate: refreshProfile } = useUserProfile();
  const { updateProfile, isUpdating } = useUpdateUserProfile();
  const { uploadKycDocument, isUploading } = useUserUploadKycDocument();
  const { toggleTwoFactor, isUpdating: isTogglingTwoFactor } = useToggleTwoFactor();
  const { updateWallet, isUpdating: isUpdatingWallet } = useUpdateWallet();
  
  // Two-factor auth state - sync with API
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Wallet state - sync with API
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState<"ethereum" | "polygon" | "binance" | "arbitrum">("ethereum");
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  // Sync API profile data with local state
  useEffect(() => {
    if (apiProfile) {
      setTwoFactorEnabled(apiProfile.twoFactorEnabled || false);
      setWalletAddress(apiProfile.walletAddress || "");
      setWalletNetwork((apiProfile.walletNetwork as any) || "ethereum");
      // Update Redux store with API data
      dispatch(setProfile({
        name: apiProfile.name,
        email: apiProfile.email,
        phone: apiProfile.phone,
        bank: apiProfile.bank?.iban && apiProfile.bank?.accountName
          ? {
              iban: apiProfile.bank.iban,
              accountName: apiProfile.bank.accountName,
              bic: apiProfile.bank.bic,
            }
          : undefined,
        kycDocumentName: apiProfile.kycDocumentName,
        agreementSigned: apiProfile.agreementSigned,
      }));
    }
  }, [apiProfile, dispatch]);
  
  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      name: apiProfile?.name || profile.name || "",
      email: apiProfile?.email || profile.email || "",
      phone: apiProfile?.phone || profile.phone || "",
      iban: apiProfile?.bank?.iban || profile.bank?.iban || "",
      accountName: apiProfile?.bank?.accountName || profile.bank?.accountName || "",
      bic: apiProfile?.bank?.bic || profile.bank?.bic || "",
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await updateProfile({
          name: values.name,
          email: values.email,
          phone: values.phone,
          bank: {
            iban: values.iban,
            accountName: values.accountName,
            bic: values.bic,
          },
        });
        dispatch(
          setProfile({
            name: values.name,
            email: values.email,
            phone: values.phone,
            bank: { iban: values.iban, accountName: values.accountName, bic: values.bic },
          })
        );
        await refreshProfile(); // Refresh profile data
        setStatus("Profile updated successfully");
        setTimeout(() => setStatus(undefined), 3000);
      } catch (err: any) {
        setStatus(err.message || "Failed to update profile. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setStatus }) => {
      try {
        await AuthApi.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        resetForm();
        setStatus("Password changed successfully");
        setTimeout(() => setStatus(undefined), 3000);
      } catch (err: any) {
        setStatus(err.message || "Failed to change password. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (auth) dispatch(hydrateFromAuth({ name: auth.name, email: auth.email }));
  }, [auth, dispatch]);

  useEffect(() => {
    if (apiProfile) {
      profileFormik.setValues({
        name: apiProfile.name,
        email: apiProfile.email,
        phone: apiProfile.phone || "",
        iban: apiProfile.bank?.iban || "",
        accountName: apiProfile.bank?.accountName || "",
        bic: apiProfile.bank?.bic || "",
      });
    } else {
      profileFormik.setValues({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        iban: profile.bank?.iban || "",
        accountName: profile.bank?.accountName || "",
        bic: profile.bank?.bic || "",
      });
    }
  }, [apiProfile?.name, apiProfile?.email, apiProfile?.phone, apiProfile?.bank, profile.name, profile.email, profile.phone, profile.bank]);

  async function onUploadKyc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await uploadKycDocument(file);
        dispatch(setKycDocument(result.documentName));
        await refreshProfile(); // Refresh profile data
      } catch (err: any) {
        console.error("Failed to upload KYC document:", err);
        alert(err.message || "Failed to upload KYC document. Please try again.");
      }
    }
  }

  async function handleToggleTwoFactor() {
    try {
      const result = await toggleTwoFactor({ enabled: !twoFactorEnabled });
      setTwoFactorEnabled(result.twoFactorEnabled);
      await refreshProfile(); // Refresh profile data
    } catch (err: any) {
      console.error("Failed to toggle two-factor authentication:", err);
      alert(err.message || "Failed to toggle two-factor authentication. Please try again.");
    }
  }

  function copyWalletAddress() {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Profile Settings
        </h1>
        <p className="text-lg text-zinc-400 font-light">
          Manage your account information and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <Card className="group relative overflow-hidden border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20">
                  <Lock className="h-4 w-4 text-blue-400" />
                </div>
                <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                  Personal Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={profileFormik.handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Full Name
                    </Label>
                    <Input 
                      id="name"
                      name="name"
                      value={profileFormik.values.name} 
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        profileFormik.touched.name && profileFormik.errors.name ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your full name"
                    />
                    {profileFormik.touched.name && profileFormik.errors.name && (
                      <p className="text-xs text-red-400">{profileFormik.errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Email Address
                    </Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      value={profileFormik.values.email} 
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        profileFormik.touched.email && profileFormik.errors.email ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your email address"
                    />
                    {profileFormik.touched.email && profileFormik.errors.email && (
                      <p className="text-xs text-red-400">{profileFormik.errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Phone Number
                    </Label>
                    <Input 
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileFormik.values.phone} 
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                        profileFormik.touched.phone && profileFormik.errors.phone ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {profileFormik.touched.phone && profileFormik.errors.phone && (
                      <p className="text-xs text-red-400">{profileFormik.errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-4">
                    Banking Information
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="iban" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        IBAN
                      </Label>
                      <Input 
                        id="iban"
                        name="iban"
                        value={profileFormik.values.iban} 
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          profileFormik.touched.iban && profileFormik.errors.iban ? "border-red-500" : ""
                        }`}
                        placeholder="Enter your IBAN number"
                      />
                      {profileFormik.touched.iban && profileFormik.errors.iban && (
                        <p className="text-xs text-red-400">{profileFormik.errors.iban}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Account Name
                      </Label>
                      <Input 
                        id="accountName"
                        name="accountName"
                        value={profileFormik.values.accountName} 
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          profileFormik.touched.accountName && profileFormik.errors.accountName ? "border-red-500" : ""
                        }`}
                        placeholder="Enter account holder name"
                      />
                      {profileFormik.touched.accountName && profileFormik.errors.accountName && (
                        <p className="text-xs text-red-400">{profileFormik.errors.accountName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bic" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        BIC / SWIFT <span className="text-zinc-500 normal-case">(optional)</span>
                      </Label>
                      <Input 
                        id="bic"
                        name="bic"
                        value={profileFormik.values.bic} 
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                          profileFormik.touched.bic && profileFormik.errors.bic ? "border-red-500" : ""
                        }`}
                        placeholder="Enter BIC / SWIFT code (optional)"
                      />
                      {profileFormik.touched.bic && profileFormik.errors.bic && (
                        <p className="text-xs text-red-400">{profileFormik.errors.bic}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/50">
                  {profileFormik.status && (
                    <p className={`text-xs ${profileFormik.status.includes("success") ? "text-green-400" : "text-red-400"}`}>
                      {profileFormik.status}
                    </p>
                  )}
                  <Button 
                    type="submit" 
                    disabled={profileFormik.isSubmitting || isUpdating || profileLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 font-medium px-6"
                  >
                    {(profileFormik.isSubmitting || isUpdating) ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* KYC Document */}
          <Card className="group relative overflow-hidden border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2 ring-1 ring-amber-500/20">
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                </div>
                <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                  KYC Verification
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <input 
                    type="file" 
                    onChange={onUploadKyc}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-blue-600 file:to-cyan-600 file:text-white hover:file:from-blue-500 hover:file:to-cyan-500 transition-all cursor-pointer"
                  />
                  {isUploading ? (
                    <span className="text-sm text-zinc-400">Uploading...</span>
                  ) : apiProfile?.kycDocumentName || profile.kycDocumentName ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-zinc-300 font-medium">{apiProfile?.kycDocumentName || profile.kycDocumentName}</span>
                      {apiProfile?.kycStatus && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          apiProfile.kycStatus === "approved" ? "bg-green-500/20 text-green-400" :
                          apiProfile.kycStatus === "rejected" ? "bg-red-500/20 text-red-400" :
                          "bg-amber-500/20 text-amber-400"
                        }`}>
                          {apiProfile.kycStatus}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-500">No document uploaded</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Upload a valid government-issued ID for verification. Accepted formats: PDF, JPG, PNG (max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Security & Wallet */}
        <div className="space-y-6">

          {/* Change Password */}
          <Card className="group relative overflow-hidden border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20">
                  <KeyRound className="h-4 w-4 text-blue-400" />
                </div>
                <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                  Password
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={passwordFormik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all ${
                        passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
                    <p className="text-xs text-red-400">{passwordFormik.errors.currentPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all ${
                        passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                    <p className="text-xs text-red-400">{passwordFormik.errors.newPassword}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      className={`h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all ${
                        passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                    <p className="text-xs text-red-400">{passwordFormik.errors.confirmPassword}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={passwordFormik.isSubmitting || !passwordFormik.isValid}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 font-medium"
                >
                  {passwordFormik.isSubmitting ? "Changing..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="group relative overflow-hidden border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2 ring-1 ring-green-500/20">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                </div>
                <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                  2FA Security
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">
                      {twoFactorEnabled ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {twoFactorEnabled 
                        ? "Your account has an extra layer of protection"
                        : "Protect your account with two-factor authentication"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleTwoFactor}
                    disabled={isTogglingTwoFactor}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                      twoFactorEnabled ? "bg-green-500" : "bg-zinc-700"
                    } ${isTogglingTwoFactor ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {twoFactorEnabled && (
                  <div className="pt-4 border-t border-zinc-800/50">
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-400 font-semibold mb-1.5">Recovery Codes</p>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                        Save these codes in a secure place. You'll need them if you lose access to your authenticator.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8"
                      >
                        View Recovery Codes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wallet */}
          <Card className="group relative overflow-hidden border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2 ring-1 ring-purple-500/20">
                  <Wallet className="h-4 w-4 text-purple-400" />
                </div>
                <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                  Wallet
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="walletNetwork" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Network
                  </Label>
                  <select
                    id="walletNetwork"
                    value={walletNetwork}
                    onChange={(e) => setWalletNetwork(e.target.value as "ethereum" | "polygon" | "binance" | "arbitrum")}
                    className="h-11 w-full rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="binance">Binance Smart Chain</option>
                    <option value="arbitrum">Arbitrum</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletAddress" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="walletAddress"
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 pr-10 font-mono text-xs transition-all"
                      placeholder="Enter your wallet address (e.g., 0x...)"
                    />
                    {walletAddress && (
                      <button
                        type="button"
                        onClick={copyWalletAddress}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Your {walletNetwork} address for receiving tokens
                  </p>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      await updateWallet({
                        network: walletNetwork,
                        address: walletAddress,
                      });
                      await refreshProfile(); // Refresh profile data
                      alert("Wallet address saved successfully");
                    } catch (err: any) {
                      console.error("Failed to update wallet:", err);
                      alert(err.message || "Failed to save wallet address. Please try again.");
                    }
                  }}
                  disabled={!walletAddress || isUpdatingWallet}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 font-medium"
                >
                  {isUpdatingWallet ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


