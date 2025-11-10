"use client";

import { useMemo, useState } from "react";
import { useProjects } from "@/hooks/swr";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { staggerContainer, fadeUp } from "@/lib/motion";

export default function ProjectenPage() {
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");

  // Fetch all projects for dropdown options (always fetch this)
  const { projects: allProjects, isLoading: isLoadingAll } = useProjects(undefined);

  // Build API filters
  const apiFilters = useMemo(() => {
    const filters: any = {};
    if (type !== "all") filters.type = type;
    if (status !== "all") filters.status = status;
    if (location !== "all") filters.location = location;
    return filters;
  }, [type, status, location]);

  // Determine if we should fetch filtered projects
  const hasFilters = Object.keys(apiFilters).length > 0;
  
  // Fetch filtered projects only when filters are applied
  // Use a special key when no filters to avoid cache conflicts
  const { projects: filteredProjects, isLoading: isLoadingFiltered } = useProjects(
    hasFilters ? apiFilters : undefined
  );

  // Use filtered projects when filters are applied, otherwise use all projects
  // Explicitly check hasFilters to ensure we use the right data source
  const projects = useMemo(() => {
    if (hasFilters) {
      return filteredProjects || [];
    }
    return allProjects || [];
  }, [hasFilters, filteredProjects, allProjects]);
  
  const isLoading = hasFilters ? isLoadingFiltered : isLoadingAll;

  const uniqueTypes = useMemo(() => {
    const set = new Set(allProjects.map((p) => p.type));
    return Array.from(set);
  }, [allProjects]);

  const uniqueLocations = useMemo(() => {
    const set = new Set(allProjects.map((p) => p.location));
    return Array.from(set);
  }, [allProjects]);

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
          className="absolute top-20 left-10 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-transparent blur-3xl"
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/10 via-purple-400/10 to-transparent blur-3xl"
          animate={{ x: [0, -25, 20, 0], y: [0, 30, -15, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="Projects" subtitle="Track development and live assets" className="mb-8" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <Select
            options={[{ label: "All types", value: "all" }, ...uniqueTypes.map((t) => ({ label: t, value: t }))]}
            value={type}
            onValueChange={setType}
          />
          <Select
            options={[
              { label: "All statuses", value: "all" },
              { label: "Active", value: "ACTIVE" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Completed", value: "COMPLETED" },
            ]}
            value={status}
            onValueChange={setStatus}
          />
          <Select
            options={[{ label: "All locations", value: "all" }, ...uniqueLocations.map((l) => ({ label: l, value: l }))]}
            value={location}
            onValueChange={setLocation}
          />
        </motion.div>
        {isLoading ? (
          <div className="text-center py-12 text-zinc-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No projects found matching your filters.</div>
        ) : (
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {projects.map((p) => (
              <motion.div key={p.id} variants={fadeUp}>
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}


