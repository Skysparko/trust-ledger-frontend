"use client";

import { useState, useMemo } from "react";
import { useInvestmentOpportunities, useAllInvestmentOpportunitiesForDropdowns, useInvestmentOpportunitiesDropdown } from "@/hooks/swr/useInvestmentOpportunities";
import { InvestmentOpportunityCard } from "@/components/cards/InvestmentOpportunityCard";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { staggerContainer } from "@/lib/motion";

export default function UitgiftenPage() {
  const [status, setStatus] = useState<string>("all");
  const [sector, setSector] = useState<string>("all");
  const [riskLevel, setRiskLevel] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch unique values for dropdowns
  const {
    uniqueSectors,
    uniqueTypes,
    uniqueLocations,
    uniqueStatuses,
    uniqueRiskLevels,
  } = useAllInvestmentOpportunitiesForDropdowns();

  // Build dropdown API filters (only include status if selected)
  const dropdownFilters = useMemo(() => {
    const filters: any = {};
    
    // Only add status if it's not "all"
    if (status !== "all") {
      filters.status = status;
    }
    
    // Don't send filters to dropdown API if none are selected
    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [status]);

  // Fetch opportunities for dropdown based on status filter
  const { opportunities: dropdownOpportunities, isLoading: isLoadingDropdown } = useInvestmentOpportunitiesDropdown(dropdownFilters);

  // Get selected opportunity title for filtering
  const selectedOpportunityTitle = useMemo(() => {
    if (selectedOpportunity === "all") return null;
    const opp = dropdownOpportunities.find(o => o.id === selectedOpportunity);
    return opp?.title || null;
  }, [selectedOpportunity, dropdownOpportunities]);

  // Build API filters (only include selected filters, exclude "all" values)
  const apiFilters = useMemo(() => {
    const filters: any = {
      page: currentPage,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    
    if (status !== "all") filters.status = status;
    if (sector !== "all") filters.sector = sector;
    if (riskLevel !== "all") filters.riskLevel = riskLevel;
    if (location !== "all") filters.location = location;
    if (type !== "all") filters.type = type;
    
    // Combine search query and selected opportunity title
    const searchTerms: string[] = [];
    if (searchQuery.trim()) searchTerms.push(searchQuery.trim());
    if (selectedOpportunityTitle) searchTerms.push(selectedOpportunityTitle);
    if (searchTerms.length > 0) {
      filters.search = searchTerms.join(" ");
    }
    
    return filters;
  }, [status, sector, riskLevel, location, type, selectedOpportunityTitle, searchQuery, currentPage]);
  
  // Fetch investment opportunities from API with filters
  const { opportunities, pagination, isLoading, isError, error } = useInvestmentOpportunities(apiFilters);

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
        <SectionHeader title="Investment Opportunities" subtitle="Filter and explore active offerings" className="mb-8" />
        
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
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-8"
        >
          <Select
            options={[
              { label: "All opportunities", value: "all" },
              ...(isLoadingDropdown 
                ? [{ label: "Loading...", value: "loading" }]
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
              { label: "All sectors", value: "all" },
              ...uniqueSectors.map((s) => ({ label: s, value: s })),
            ]}
            value={sector}
            onValueChange={(value) => {
              setSector(value);
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
          <Select
            options={[
              { label: "All locations", value: "all" },
              ...uniqueLocations.map((l) => ({ label: l, value: l })),
            ]}
            value={location}
            onValueChange={(value) => {
              setLocation(value);
              setCurrentPage(1);
            }}
          />
          <Select
            options={[
              { label: "All types", value: "all" },
              ...uniqueTypes.map((t) => ({ label: t, value: t })),
            ]}
            value={type}
            onValueChange={(value) => {
              setType(value);
              setCurrentPage(1);
            }}
          />
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">Loading investment opportunities...</div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500 dark:text-red-400">
            <p>Error loading investment opportunities</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{error?.message || "Please try again later"}</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            No investment opportunities available at the moment.
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {opportunities.map((opportunity) => (
                <InvestmentOpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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


