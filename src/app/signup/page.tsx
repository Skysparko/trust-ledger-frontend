"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthApi } from "@/api/auth.api";
import { fadeUp } from "@/lib/motion";
import { User, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const validationSchema = Yup.object({
  type: Yup.string()
    .oneOf(["individual", "business"], "Please select an account type")
    .required("Account type is required"),
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
});

export default function SignupPage() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      type: "individual" as "individual" | "business",
      name: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        await AuthApi.signup({
          type: values.type,
          name: values.name,
          email: values.email,
          password: values.password,
        });
        // Redirect to verify page without logging in
        router.push("/verify");
      } catch (err: any) {
        setStatus(err.message || "Signup failed. Please try again.");
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
            TrustLedger
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
          className="w-full space-y-8"
        >
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Join{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                TrustLedger
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl"
            >
              Start investing in companies across various sectors
            </motion.p>
          </div>
          <Card className="border-2 border-zinc-200/50 bg-white/90 backdrop-blur-xl shadow-2xl shadow-blue-500/10 transition-all duration-300 hover:shadow-blue-500/20 dark:border-zinc-700/50 dark:bg-zinc-900/90">
            <CardHeader className="pb-6">
              <div className="relative mb-6 flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30"
                >
                  <User className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Create account</h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Fill in your details to get started
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Account type</Label>
                <div className="relative grid grid-cols-2 rounded-xl bg-zinc-100/50 p-1.5 dark:bg-zinc-800/50">
                  <motion.div
                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-0.75rem)] rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30"
                    animate={{
                      left: formik.values.type === "individual" ? "0.75rem" : "calc(50% + 0.75rem)",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => formik.setFieldValue("type", "individual")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative z-10 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                      formik.values.type === "individual"
                        ? "text-white"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Individual
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => formik.setFieldValue("type", "business")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative z-10 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                      formik.values.type === "business"
                        ? "text-white"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    Business
                  </motion.button>
                </div>
                {formik.touched.type && formik.errors.type && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    {formik.errors.type}
                  </motion.p>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 dark:text-red-400"
                    >
                      {formik.errors.name}
                    </motion.p>
                  )}
                </div>
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
                    placeholder="Create a password"
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
                  {formik.isSubmitting ? "Creating..." : "Create account"}
                </Button>
                <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                  Already have an account?{" "}
                  <a className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" href="/login">
                    Login
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


