"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRequestBrochure } from "@/hooks/swr";
import { useProjects } from "@/hooks/swr/useProjects";

export function BrochureForm() {
  const [submitted, setSubmitted] = useState(false);
  const { requestBrochure, isSubmitting } = useRequestBrochure();
  const { projects, isLoading: isLoadingProjects } = useProjects();

  // Extract unique project types dynamically
  const interestOptions = useMemo(() => {
    if (!projects || projects.length === 0) {
      // Fallback options if no projects are available
      return [
        { label: "Wind", value: "wind" },
        { label: "Solar", value: "solar" },
      ];
    }

    // Extract unique types from projects
    const uniqueTypes = Array.from(
      new Set(projects.map((project) => project.type).filter(Boolean))
    );

    // Convert to dropdown options format
    return uniqueTypes.map((type) => ({
      label: type,
      value: type.toLowerCase().replace(/\s+/g, "_"),
    }));
  }, [projects]);

  // Create dynamic validation schema based on available options
  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string()
          .min(2, "Name must be at least 2 characters")
          .required("Name is required"),
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
        interest: Yup.string()
          .oneOf(
            interestOptions.map((opt) => opt.value),
            "Please select a valid interest"
          )
          .required("Interest is required"),
      }),
    [interestOptions]
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      interest: interestOptions[0]?.value || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setStatus }) => {
      setSubmitted(false);

      // Map interest to API format - normalize to lowercase and replace underscores with spaces
      const apiInterest = values.interest.toLowerCase().replace(/_/g, " ");

      try {
        await requestBrochure({
          name: values.name,
          email: values.email,
          interest: apiInterest,
        });
        setSubmitted(true);
        formik.resetForm();
      } catch (err: any) {
        setStatus(err.message || "Failed to request brochure. Please try again.");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="interest">Interest</Label>
        {isLoadingProjects ? (
          <div className="h-12 rounded-xl border border-zinc-200/50 bg-white/80 dark:border-zinc-700/50 dark:bg-zinc-900/80 flex items-center justify-center">
            <span className="text-sm text-zinc-500">Loading options...</span>
          </div>
        ) : (
          <>
            <Select
              id="interest"
              name="interest"
              value={formik.values.interest}
              onValueChange={(value) => formik.setFieldValue("interest", value)}
              options={interestOptions}
              className={formik.touched.interest && formik.errors.interest ? "border-red-500" : ""}
            />
            {formik.touched.interest && formik.errors.interest && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 dark:text-red-400"
              >
                {formik.errors.interest}
              </motion.p>
            )}
          </>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || formik.isSubmitting}>
        {isSubmitting || formik.isSubmitting ? "Sending..." : "Get brochure"}
      </Button>
      {formik.status && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-medium text-red-600 dark:text-red-400"
        >
          {formik.status}
        </motion.p>
      )}
      {submitted && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-medium text-green-600 dark:text-green-400"
        >
          Brochure sent to your email.
        </motion.p>
      )}
    </form>
  );
}


