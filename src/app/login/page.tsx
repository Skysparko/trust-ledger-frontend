"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store";
import { hydrateFromStorage, loginSuccess } from "@/store/slices/auth";
import { login as apiLogin } from "@/lib/mockApi";
import { fadeUp } from "@/lib/motion";
import { LogIn } from "lucide-react";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) router.push("/portal/dashboard");
  }, [isAuthenticated, router]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        const user = await apiLogin(values.email, values.password);
        dispatch(loginSuccess(user));
        router.push("/portal/dashboard");
      } catch (err) {
        setStatus("Login failed. Try again.");
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
              Welcome{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                back
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl"
            >
              Sign in to access your investor portal
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
                  <LogIn className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Login</h2>
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
                    placeholder="you@example.com"
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
                <div className="flex items-center justify-between text-sm">
                  <a className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" href="/reset">
                    Forgot password?
                  </a>
                  <a className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" href="/signup">
                    Create account
                  </a>
                </div>
                <Button type="submit" disabled={formik.isSubmitting} className="w-full shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30">
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


