"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthApi } from "@/api/auth.api";
import { fadeUp } from "@/lib/motion";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store";
import { setEmailVerified, hydrateFromStorage } from "@/store/slices/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState(user?.email || "");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setVerifying(true);
      AuthApi.verifyEmail({ token })
        .then(() => {
          setVerified(true);
          setVerifying(false);
          // Update auth state to mark email as verified
          dispatch(setEmailVerified());
          // Refresh auth state from storage to ensure it's updated
          dispatch(hydrateFromStorage());
        })
        .catch((err: any) => {
          setError(err.message || "Failed to verify email. Please try again.");
          setVerifying(false);
        });
    } else {
      setError("No verification token provided. Please check your email link.");
    }
  }, [searchParams, dispatch]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      setError("Please enter your email address.");
      return;
    }

    setResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await AuthApi.resendVerification({ email: resendEmail });
      setResendSuccess(true);
      setShowResendForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to send verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/globe.svg" alt="Logo" width={32} height={32} />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
            RWA
          </span>
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <motion.div
          className="absolute top-20 right-10 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-blue-400/10 via-cyan-400/10 to-transparent blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-transparent blur-3xl"
          animate={{ x: [0, -25, 20, 0], y: [0, 30, -15, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="relative mx-auto flex min-h-screen max-w-lg items-center justify-center px-4 py-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          <Card className="border-2 border-zinc-200/50 bg-white/90 backdrop-blur-xl shadow-2xl shadow-blue-500/10 dark:border-zinc-700/50 dark:bg-zinc-900/90">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                    verified
                      ? "bg-green-100 dark:bg-green-900/20"
                      : error
                      ? "bg-red-100 dark:bg-red-900/20"
                      : "bg-blue-100 dark:bg-blue-900/20"
                  }`}
                >
                  {verified ? (
                    <svg
                      className="h-8 w-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : error ? (
                    <svg
                      className="h-8 w-8 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </motion.div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  {verified ? "Email verified!" : verifying ? "Verifying email..." : error ? "Verification failed" : "Verifying email"}
                </h1>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  {verified
                    ? "Your email has been successfully verified. You can now log in to your account."
                    : verifying
                    ? "Please wait while we verify your email address..."
                    : error
                    ? error
                    : "Processing your verification request..."}
                </p>
              </div>
              {error && !verifying && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/10"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </motion.div>
              )}
              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/10"
                >
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Verification email sent! Please check your inbox.
                  </p>
                </motion.div>
              )}
              {showResendForm && !verified && !verifying && (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleResendVerification}
                  className="mb-6 space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
                >
                  <div className="space-y-2">
                    <Label htmlFor="resend-email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="resend-email"
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={resending}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={resending}
                      className="flex-1 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      {resending ? "Sending..." : "Send Verification Link"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowResendForm(false);
                        setError(null);
                        setResendSuccess(false);
                      }}
                      disabled={resending}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.form>
              )}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Back to login
                </Button>
                {verified && (
                  <Button
                    onClick={() => {
                      // Wait a bit for state to update, then redirect
                      setTimeout(() => {
                        router.push("/portal/dashboard");
                      }, 100);
                    }}
                    className="shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    Continue to dashboard
                  </Button>
                )}
                {error && !showResendForm && !verified && (
                  <Button
                    onClick={() => setShowResendForm(true)}
                    variant="outline"
                    className="flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <Mail className="h-4 w-4" />
                    Resend verification email
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

