"use client";

import { useState, useMemo } from "react";
import { useInvestmentOpportunities, useAllInvestmentOpportunitiesForDropdowns, useInvestmentOpportunitiesDropdown } from "@/hooks/swr/useInvestmentOpportunities";
import { InvestmentOpportunityCard } from "@/components/cards/InvestmentOpportunityCard";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";

export default function IssuesPage() {
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
  
  // Debug logging
  if (typeof window !== "undefined") {
    console.log("[Investment Opportunities] API Response:", {
      opportunities,
      pagination,
      isLoading,
      isError,
      error,
      count: opportunities?.length,
    });
  }
  
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Investment Opportunities
        </h1>
        <p className="text-lg text-zinc-400 font-light">
          Explore available bond offerings and investment opportunities
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search opportunities by title, company, or sector..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-md bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-8">
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
          className="bg-zinc-900/50 border-zinc-700 text-white"
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
          className="bg-zinc-900/50 border-zinc-700 text-white"
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
          className="bg-zinc-900/50 border-zinc-700 text-white"
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
          className="bg-zinc-900/50 border-zinc-700 text-white"
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
          className="bg-zinc-900/50 border-zinc-700 text-white"
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
          className="bg-zinc-900/50 border-zinc-700 text-white"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading investment opportunities...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-400">
          <p>Error loading investment opportunities</p>
          <p className="text-sm text-zinc-500 mt-2">{error?.message || "Please try again later"}</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No investment opportunities available at the moment.
        </div>
      ) : (
        <>
          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            animate="show"
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
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

