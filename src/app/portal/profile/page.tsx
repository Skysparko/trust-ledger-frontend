"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store";
import { hydrateFromStorage } from "@/store/slices/auth";
import { hydrateFromAuth, setKycDocument, setProfile } from "@/store/slices/profile";
import { Lock, KeyRound, ShieldCheck, Wallet, Eye, EyeOff, Copy, Check } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth.user);
  const profile = useAppSelector((s) => s.profile);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || "");
  const [iban, setIban] = useState(profile.bank?.iban || "");
  const [accountName, setAccountName] = useState(profile.bank?.accountName || "");
  const [bic, setBic] = useState(profile.bank?.bic || "");
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Two-factor auth state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [enablingTwoFactor, setEnablingTwoFactor] = useState(false);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("ethereum");
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (auth) dispatch(hydrateFromAuth({ name: auth.name, email: auth.email }));
  }, [auth, dispatch]);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
  }, [profile.name, profile.email]);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      dispatch(
        setProfile({
          name,
          email,
          phone,
          bank: { iban, accountName, bic },
        })
      );
      setSaving(false);
    }, 500);
  }

  function onUploadKyc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) dispatch(setKycDocument(file.name));
  }

  function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    setTimeout(() => {
      // Placeholder for password change API call
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
      alert("Password changed successfully");
    }, 1000);
  }

  function toggleTwoFactor() {
    setEnablingTwoFactor(true);
    setTimeout(() => {
      setTwoFactorEnabled(!twoFactorEnabled);
      setEnablingTwoFactor(false);
    }, 1000);
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
              <form onSubmit={onSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Full Name
                    </Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Phone Number
                    </Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Enter your phone number"
                    />
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
                        value={iban} 
                        onChange={(e) => setIban(e.target.value)}
                        className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Enter your IBAN number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Account Name
                      </Label>
                      <Input 
                        id="accountName" 
                        value={accountName} 
                        onChange={(e) => setAccountName(e.target.value)}
                        className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Enter account holder name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bic" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        BIC / SWIFT <span className="text-zinc-500 normal-case">(optional)</span>
                      </Label>
                      <Input 
                        id="bic" 
                        value={bic} 
                        onChange={(e) => setBic(e.target.value)}
                        className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="Enter BIC / SWIFT code (optional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/50">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 font-medium px-6"
                  >
                    {saving ? "Saving..." : "Save Changes"}
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
                  {profile.kycDocumentName ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-zinc-300 font-medium">{profile.kycDocumentName}</span>
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
              <form onSubmit={onChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all"
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all"
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 bg-zinc-800/40 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 pr-10 transition-all"
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
                </div>
                <Button
                  type="submit"
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 font-medium"
                >
                  {changingPassword ? "Changing..." : "Update Password"}
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
                    onClick={toggleTwoFactor}
                    disabled={enablingTwoFactor}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                      twoFactorEnabled ? "bg-green-500" : "bg-zinc-700"
                    } ${enablingTwoFactor ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    onChange={(e) => setWalletNetwork(e.target.value)}
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
                  onClick={() => {
                    alert("Wallet address saved");
                  }}
                  disabled={!walletAddress}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-500 hover:to-purple-400 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 font-medium"
                >
                  Save Address
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


