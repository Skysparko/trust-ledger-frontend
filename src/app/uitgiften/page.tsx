"use client";

import { useMemo, useState } from "react";
import { useIssuances } from "@/hooks/swr";
import { IssuanceCard } from "@/components/cards/IssuanceCard";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { staggerContainer, fadeUp } from "@/lib/motion";

export default function UitgiftenPage() {
  const [type, setType] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [minRate, setMinRate] = useState<string>("");

  // Build API filters
  const apiFilters = useMemo(() => {
    const filters: any = {};
    if (type !== "all") filters.type = type;
    if (location !== "all") filters.location = location;
    return filters;
  }, [type, location]);

  const { issuances, isLoading } = useIssuances(Object.keys(apiFilters).length > 0 ? apiFilters : undefined);

  const uniqueLocations = useMemo(() => {
    const set = new Set(issuances.map((i) => i.location));
    return Array.from(set);
  }, [issuances]);

  const filtered = useMemo(() => {
    return issuances.filter((i) => {
      if (minRate && i.rate < Number(minRate)) return false;
      return true;
    });
  }, [issuances, minRate]);

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
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="Issuances" subtitle="Filter and explore active offerings" className="mb-8" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <Select
            options={[
              { label: "All types", value: "all" },
              { label: "Technology", value: "Technology" },
              { label: "Healthcare", value: "Healthcare" },
              { label: "Manufacturing", value: "Manufacturing" },
              { label: "Financial Services", value: "Financial Services" },
              { label: "Energy", value: "Energy" },
              { label: "Real Estate", value: "Real Estate" },
            ]}
            defaultValue="all"
            onValueChange={setType}
          />
          <Select
            options={[{ label: "All locations", value: "all" }, ...uniqueLocations.map((l) => ({ label: l, value: l }))]}
            defaultValue="all"
            onValueChange={setLocation}
          />
          <Input
            type="number"
            placeholder="Min. rate (%)"
            value={minRate}
            onChange={(e) => setMinRate(e.target.value)}
          />
        </motion.div>
        {isLoading ? (
          <div className="text-center py-12 text-zinc-500">Loading issuances...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No issuances found matching your filters.</div>
        ) : (
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((i) => (
              <motion.div key={i.id} variants={fadeUp}>
                <IssuanceCard issuance={i} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}


