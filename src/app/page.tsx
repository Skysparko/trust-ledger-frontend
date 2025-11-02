"use client";

import { Hero } from "@/components/sections/Hero";
import { InvestmentOpportunityCard } from "@/components/cards/InvestmentOpportunityCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { BrochureForm } from "@/components/forms/BrochureForm";
import { useFeaturedInvestmentOpportunities } from "@/hooks/swr/useInvestmentOpportunities";
import { useProjects } from "@/hooks/swr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/motion";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Ambient } from "@/components/sections/Ambient";

export default function Home() {
  const { opportunities, isLoading: opportunitiesLoading } = useFeaturedInvestmentOpportunities(3);
  const { projects, isLoading: projectsLoading } = useProjects();

  return (
    <div className="font-sans">
      <Hero />
      <section className="relative -mt-12 overflow-hidden bg-gradient-to-b from-white/0 via-zinc-50/60 to-white py-20 dark:from-transparent dark:via-zinc-900/60 dark:to-zinc-950">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent to-white/80 dark:to-zinc-950/80" />
        <Ambient variant="blue" />
        <div className="relative mx-auto max-w-7xl px-4">
          <SectionHeader title="Featured Investment Opportunities" subtitle="Curated opportunities with transparent terms" />
          {opportunitiesLoading ? (
            <div className="text-center py-12 text-zinc-500">Loading investment opportunities...</div>
          ) : (
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {opportunities.slice(0, 3).map((i) => (
                <motion.div key={i.id} variants={fadeUp}>
                  <InvestmentOpportunityCard opportunity={i} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <section className="relative -mt-16 overflow-hidden bg-gradient-to-b from-white/0 via-zinc-50/60 to-white py-20 dark:from-transparent dark:via-zinc-900/60 dark:to-zinc-950">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent to-white/80 dark:to-zinc-950/80" />
        <Ambient variant="blue" />
        <div className="relative mx-auto max-w-7xl px-4">
          <SectionHeader title="Projects" subtitle="See where your capital drives impact" />
          {projectsLoading ? (
            <div className="text-center py-12 text-zinc-500">Loading projects...</div>
          ) : (
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {projects.slice(0, 3).map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProjectCard project={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 py-24 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <motion.div
            className="absolute top-1/2 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-400/15 via-cyan-400/15 to-transparent blur-3xl"
            animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-purple-400/15 via-pink-400/15 to-transparent blur-3xl"
            animate={{ x: [0, -30, 25, 0], y: [0, 30, -20, 0], scale: [1, 1.15, 0.9, 1] }}
            transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <div className="relative mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Card className="border-2 border-zinc-200/50 bg-white/90 backdrop-blur-xl shadow-2xl shadow-blue-500/10 dark:border-zinc-700/50 dark:bg-zinc-900/90">
              <CardHeader className="pb-4">
                <h2 className="text-3xl font-bold sm:text-4xl">Get the brochure</h2>
                <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                  Leave your details to receive the brochure instantly.
                </p>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <BrochureForm />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
