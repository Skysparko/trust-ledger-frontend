"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store";
import { hydrateFromStorage } from "@/store/slices/auth";
import { hydrateFromAuth, setKycDocument, setProfile } from "@/store/slices/profile";

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
            Personal details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Phone</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div />
            <div className="space-y-2">
              <Label htmlFor="iban" className="text-sm font-medium text-zinc-300 dark:text-zinc-300">IBAN</Label>
              <Input 
                id="iban" 
                value={iban} 
                onChange={(e) => setIban(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName" className="text-sm font-medium text-zinc-300 dark:text-zinc-300">Account name</Label>
              <Input 
                id="accountName" 
                value={accountName} 
                onChange={(e) => setAccountName(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bic" className="text-sm font-medium text-zinc-300 dark:text-zinc-300">BIC (optional)</Label>
              <Input 
                id="bic" 
                value={bic} 
                onChange={(e) => setBic(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
            KYC document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              onChange={onUploadKyc}
              className="text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 dark:file:bg-zinc-800 dark:file:text-white"
            />
            {profile.kycDocumentName ? (
              <span className="text-sm text-zinc-400">Uploaded: {profile.kycDocumentName}</span>
            ) : (
              <span className="text-sm text-zinc-500">No document uploaded</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


