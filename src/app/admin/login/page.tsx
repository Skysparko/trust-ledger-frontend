"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store";
import { hydrateAdminFromStorage, adminLoginSuccess } from "@/store/slices/adminAuth";
import { AdminApi } from "@/api/admin.api";
import { fadeUp } from "@/lib/motion";
import { Shield } from "lucide-react";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.adminAuth.isAuthenticated);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    dispatch(hydrateAdminFromStorage());
    // Mark hydration as complete after state update
    setTimeout(() => {
      setIsHydrating(false);
    }, 0);
  }, [dispatch]);

  useEffect(() => {
    // Wait for hydration to complete before redirecting
    if (isHydrating) return;
    
    if (isAuthenticated) {
      // Redirect to admin dashboard (not a specific page to avoid loops)
      router.push("/admin");
    }
  }, [isAuthenticated, router, isHydrating]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const admin = await AdminApi.login({
          email: values.email,
          password: values.password,
        });
        dispatch(adminLoginSuccess(admin));
        router.push("/admin");
      } catch (err: any) {
        setStatus(err.message || "Login failed. Try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
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
      </motion.div>
      <div className="relative mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-12">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="w-full">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4 flex justify-center"
            >
              <Shield className="h-12 w-12 text-zinc-900 dark:text-zinc-100" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Admin Panel
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-3 text-base text-zinc-600 dark:text-zinc-400"
            >
              Sign in to access the admin dashboard
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
                  <Shield className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Login</h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Enter your credentials to continue
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 dark:text-red-400"
                    >
                      {formik.errors.email}
                    </motion.p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.password && formik.errors.password ? "border-red-500" : ""}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 dark:text-red-400"
                    >
                      {formik.errors.password}
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
                  {formik.isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

