"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrochureForm } from "@/components/forms/BrochureForm";
import { SectionHeader } from "@/components/sections/SectionHeader";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <motion.div
          className="absolute top-1/4 left-1/4 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-blue-400/10 via-cyan-400/10 to-transparent blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-transparent blur-3xl"
          animate={{ x: [0, -30, 25, 0], y: [0, 30, -20, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="Contact & Newsletter" subtitle="Stay connected and get updates" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 md:grid-cols-2"
        >
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Newsletter</h2>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">Get updates on new issuances and projects.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
              <Button type="submit">Subscribe</Button>
            </form>
            {submitted && <p className="mt-2 text-base font-medium text-green-600">Thanks for subscribing!</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Request brochure</h2>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">We will send the brochure to your email.</p>
          </CardHeader>
          <CardContent>
            <BrochureForm />
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}


