"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-50 py-24 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <motion.div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-transparent blur-3xl"
          animate={{ x: [0, 30, -15, 0], y: [0, -20, 15, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-400/20 to-transparent blur-3xl"
          animate={{ x: [0, -25, 20, 0], y: [0, 25, -15, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="relative mx-auto max-w-6xl px-4">
        <motion.h1
          className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Invest in companies with{" "}
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            transparent returns
          </span>
        </motion.h1>
        <motion.p
          className="mt-6 max-w-2xl text-xl leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-2xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
        >
          Discover investment opportunities across various sectors. Start from $100 and build your portfolio with confidence.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
        >
          <Button size="lg" className="shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30" asChild>
            <Link href="/uitgiften">View Investment Opportunities</Link>
          </Button>
          <Button size="lg" variant="outline" className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" asChild>
            <Link href="/projects">View projects</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}


