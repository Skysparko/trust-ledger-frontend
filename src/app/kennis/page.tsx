"use client";

import { posts } from "@/data/posts";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { staggerContainer, fadeUp } from "@/lib/motion";

export default function KennisPage() {
  const knowledge = posts.filter((p) => p.category === "Knowledge");
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
          className="absolute top-20 left-10 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-green-400/10 via-emerald-400/10 to-transparent blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-transparent blur-3xl"
          animate={{ x: [0, -25, 20, 0], y: [0, 30, -15, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="Knowledge" subtitle="Learn from expert insights and guides" />
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
        {knowledge.map((p) => (
          <motion.article 
            key={p.id} 
            variants={fadeUp}
            className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg shadow-zinc-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/20 dark:border-zinc-700/50 dark:bg-zinc-900/80 dark:shadow-zinc-900/50"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-emerald-500/0 to-teal-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
            <div className="relative">
              <h3 className="text-lg font-bold sm:text-xl">{p.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">{p.excerpt}</p>
              <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-500">{new Date(p.date).toLocaleDateString()}</p>
            </div>
          </motion.article>
        ))}
        </motion.div>
      </div>
    </div>
  );
}


