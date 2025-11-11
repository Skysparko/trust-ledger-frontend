"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthApi } from "@/api/auth.api";
import { fadeUp } from "@/lib/motion";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const validationSchema = Yup.object({
  token: Yup.string().required("Token is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
});

function ResetPasswordConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      token: searchParams.get("token") || "",
      newPassword: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await AuthApi.confirmPasswordReset({
          token: values.token,
          newPassword: values.newPassword,
        });
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err: any) {
        setStatus(err.message || "Failed to reset password. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

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
      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Reset{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                password
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl"
            >
              Enter your new password
            </motion.p>
          </div>
          <Card className="border-2 border-zinc-200/50 bg-white/90 backdrop-blur-xl shadow-2xl shadow-blue-500/10 transition-all duration-300 hover:shadow-blue-500/20 dark:border-zinc-700/50 dark:bg-zinc-900/90">
            <CardHeader className="pb-6">
              <div className="relative flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30"
                >
                  <KeyRound className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Reset password</h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Enter your new password to complete the reset
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
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
                  </div>
                  <h3 className="text-xl font-semibold">Password reset successful!</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Redirecting to login page...
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={formik.handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="token">Reset Token</Label>
                    <Input
                      id="token"
                      name="token"
                      placeholder="Enter reset token"
                      value={formik.values.token}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={formik.touched.token && formik.errors.token ? "border-red-500" : ""}
                    />
                    {formik.touched.token && formik.errors.token && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 dark:text-red-400"
                      >
                        {formik.errors.token}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      name="newPassword"
                      placeholder="Enter your new password"
                      value={formik.values.newPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={formik.touched.newPassword && formik.errors.newPassword ? "border-red-500" : ""}
                    />
                    {formik.touched.newPassword && formik.errors.newPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 dark:text-red-400"
                      >
                        {formik.errors.newPassword}
                      </motion.p>
                    )}
                  </div>
                  {formik.status && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 dark:text-red-400"
                    >
                      {formik.status}
                    </motion.p>
                  )}
                  <Button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    {formik.isSubmitting ? "Resetting..." : "Reset password"}
                  </Button>
                  <div className="text-center">
                    <a className="text-sm text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" href="/login">
                      Back to login
                    </a>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
          <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordConfirmForm />
    </Suspense>
  );
}

