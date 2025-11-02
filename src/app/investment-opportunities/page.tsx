"use client";

import { useMemo, useState } from "react";
import { useInvestmentOpportunities, useAllInvestmentOpportunitiesForDropdowns, useInvestmentOpportunitiesDropdown } from "@/hooks/swr/useInvestmentOpportunities";
import { InvestmentOpportunityCard } from "@/components/cards/InvestmentOpportunityCard";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { staggerContainer, fadeUp } from "@/lib/motion";

export default function InvestmentOpportunitiesPage() {
  const [type, setType] = useState<string>("all");
  const [sector, setSector] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [riskLevel, setRiskLevel] = useState<string>("all");
  const [minRate, setMinRate] = useState<string>("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Build dropdown API filters (only include selected filters, exclude "all" values)
  const dropdownFilters = useMemo(() => {
    const filters: any = {};
    
    // Only add status if it's not "all"
    if (status !== "all") {
      filters.status = status;
    }
    
    // Add search if there's a query
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }
    
    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [status, searchQuery]);

  // Fetch opportunities for dropdown based on filters
  const { opportunities: dropdownOpportunities, isLoading: isLoadingDropdown } = useInvestmentOpportunitiesDropdown(dropdownFilters);

  // Get selected opportunity title for filtering
  const selectedOpportunityTitle = useMemo(() => {
    if (selectedOpportunity === "all") return null;
    const opp = dropdownOpportunities.find(o => o.id === selectedOpportunity);
    return opp?.title || null;
  }, [selectedOpportunity, dropdownOpportunities]);

  // Build API filters for main list
  const apiFilters = useMemo(() => {
    const filters: any = {
      page: currentPage,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    
    if (type !== "all") filters.type = type;
    if (sector !== "all") filters.sector = sector;
    if (location !== "all") filters.location = location;
    if (status !== "all") filters.status = status;
    if (riskLevel !== "all") filters.riskLevel = riskLevel;
    if (minRate) filters.minRate = parseFloat(minRate);
    
    // Combine search query and selected opportunity title
    const searchTerms: string[] = [];
    if (searchQuery.trim()) searchTerms.push(searchQuery.trim());
    if (selectedOpportunityTitle) searchTerms.push(selectedOpportunityTitle);
    if (searchTerms.length > 0) {
      filters.search = searchTerms.join(" ");
    }
    
    return filters;
  }, [type, sector, location, status, riskLevel, minRate, selectedOpportunityTitle, searchQuery, currentPage]);

  const { opportunities, pagination, isLoading, isError } = useInvestmentOpportunities(apiFilters);

  // Fetch unique values for dropdowns from all opportunities
  const {
    uniqueSectors,
    uniqueTypes,
    uniqueLocations,
    uniqueStatuses,
    uniqueRiskLevels,
  } = useAllInvestmentOpportunitiesForDropdowns();

  // Fallback to filtered opportunities if dropdown data is not available yet
  const displaySectors = useMemo(() => {
    if (uniqueSectors.length > 0) return uniqueSectors;
    const sectors = new Set<string>();
    opportunities.forEach((opp) => {
      if (opp.sector) sectors.add(opp.sector);
    });
    return Array.from(sectors).sort();
  }, [uniqueSectors, opportunities]);

  const displayLocations = useMemo(() => {
    if (uniqueLocations.length > 0) return uniqueLocations;
    const locations = new Set<string>();
    opportunities.forEach((opp) => {
      if (opp.location) locations.add(opp.location);
    });
    return Array.from(locations).sort();
  }, [uniqueLocations, opportunities]);

  const displayTypes = useMemo(() => {
    if (uniqueTypes.length > 0) return uniqueTypes;
    const types = new Set<string>();
    opportunities.forEach((opp) => {
      if (opp.type) types.add(opp.type);
    });
    return Array.from(types).sort();
  }, [uniqueTypes, opportunities]);

  const totalPages = pagination?.totalPages || 1;

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
        <SectionHeader 
          title="Investment Opportunities" 
          subtitle="Explore available investment opportunities and start investing today" 
          className="mb-8" 
        />

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Input
            placeholder="Search opportunities by title, company, or sector..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-md"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7"
        >
          <Select
            options={[
              { label: "All opportunities", value: "all" },
              ...(isLoadingDropdown 
                ? [{ label: "Loading...", value: "loading", disabled: true }]
                : dropdownOpportunities.map((opp) => ({
                    label: opp.title,
                    value: opp.id,
                  }))
              ),
            ]}
            value={selectedOpportunity}
            onValueChange={(value) => {
              setSelectedOpportunity(value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { label: "All types", value: "all" },
              ...displayTypes.map((t) => ({ label: t, value: t })),
            ]}
            value={type}
            onValueChange={(value) => {
              setType(value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { label: "All sectors", value: "all" },
              ...displaySectors.map((s) => ({ label: s, value: s })),
            ]}
            value={sector}
            onValueChange={(value) => {
              setSector(value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { label: "All locations", value: "all" },
              ...displayLocations.map((l) => ({ label: l, value: l })),
            ]}
            value={location}
            onValueChange={(value) => {
              setLocation(value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { label: "All statuses", value: "all" },
              ...(uniqueStatuses.length > 0
                ? uniqueStatuses.map((s) => ({
                    label: s.charAt(0).toUpperCase() + s.slice(1),
                    value: s,
                  }))
                : [
                    { label: "Active", value: "active" },
                    { label: "Upcoming", value: "upcoming" },
                    { label: "Closed", value: "closed" },
                    { label: "Paused", value: "paused" },
                  ]),
            ]}
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { label: "All risk levels", value: "all" },
              ...(uniqueRiskLevels.length > 0
                ? uniqueRiskLevels.map((r) => ({ label: r, value: r }))
                : [
                    { label: "Low", value: "Low" },
                    { label: "Medium", value: "Medium" },
                    { label: "High", value: "High" },
                  ]),
            ]}
            value={riskLevel}
            onValueChange={(value) => {
              setRiskLevel(value);
              setCurrentPage(1);
            }}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Min. rate (%)"
            value={minRate}
            onChange={(e) => {
              setMinRate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12 text-zinc-500">Loading investment opportunities...</div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">Failed to load investment opportunities. Please try again.</div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No investment opportunities found matching your filters.
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {opportunities.map((opportunity) => (
                <motion.div key={opportunity.id} variants={fadeUp}>
                  <InvestmentOpportunityCard opportunity={opportunity} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

