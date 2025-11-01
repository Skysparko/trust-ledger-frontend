"use client";

import { useWebinars } from "@/hooks/swr";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { staggerContainer, fadeUp } from "@/lib/motion";

export default function WebinarsPage() {
  const { webinars, isLoading } = useWebinars();

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
          className="absolute top-20 right-10 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-indigo-400/10 via-purple-400/10 to-transparent blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/10 via-rose-400/10 to-transparent blur-3xl"
          animate={{ x: [0, -25, 20, 0], y: [0, 30, -15, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="Webinars" subtitle="Join upcoming educational sessions" />
        {isLoading ? (
          <div className="text-center py-12 text-zinc-500">Loading webinars...</div>
        ) : webinars.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No webinars found.</div>
        ) : (
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-6"
          >
            {webinars.map((w) => (
              <motion.div 
                key={w.id} 
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 dark:border-zinc-700/50 dark:bg-zinc-900/80 dark:shadow-zinc-900/50"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold sm:text-xl">{w.title}</h3>
                    <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">{w.speaker}</p>
                  </div>
                  <div className="text-base font-semibold text-zinc-700 dark:text-zinc-300">{new Date(w.date).toLocaleDateString()}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}


