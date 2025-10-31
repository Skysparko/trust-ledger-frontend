"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function BrochureForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" placeholder="you@example.com" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="interest">Interest</Label>
        <Select
          id="interest"
          name="interest"
          defaultValue="wind"
          options={[
            { label: "Wind", value: "wind" },
            { label: "Solar", value: "solar" },
          ]}
        />
      </div>
      <Button type="submit" size="lg" className="w-full">Get brochure</Button>
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


