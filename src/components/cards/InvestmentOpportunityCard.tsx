"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import { hydrateFromStorage } from "@/store/slices/auth";
import type { InvestmentOpportunityListItem } from "@/api/investment-opportunities.api";

export function InvestmentOpportunityCard({ opportunity }: { opportunity: InvestmentOpportunityListItem }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const fundingProgress = opportunity.fundingProgress || 
    ((opportunity.currentFunding / opportunity.totalFundingTarget) * 100);

  // Ensure auth state is hydrated from storage
  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  const handleViewDetails = () => {
    if (!opportunity.id) {
      console.error("[InvestmentOpportunityCard] No ID available for opportunity:", opportunity);
      return;
    }
    // Route to portal if authenticated, otherwise to public page
    const url = isAuthenticated ? `/portal/issues/${opportunity.id}` : `/uitgiften/${opportunity.id}`;
    console.log("[InvestmentOpportunityCard] Navigating to:", url, "ID:", opportunity.id, "Authenticated:", isAuthenticated);
    router.push(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }} 
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20">
        {/* Hover gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {opportunity.sector}
                  </span>
                </div>
                {opportunity.isFeatured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 shadow-sm">
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold leading-tight text-white mb-2 line-clamp-2">
                {opportunity.title}
              </h3>
              <p className="text-sm text-zinc-400">
                {opportunity.company} • {opportunity.location}
              </p>
            </div>
            <motion.div 
              className="flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 px-4 py-2 text-center shadow-lg shadow-blue-500/30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl font-extrabold text-white">{opportunity.rate}%</div>
              <div className="text-[10px] font-medium text-white/90 uppercase tracking-wider">Rate</div>
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-zinc-800/30 p-3 border border-zinc-700/50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Rate</div>
              <div className="text-lg font-bold text-white">{opportunity.rate}%</div>
            </div>
            <div className="rounded-lg bg-zinc-800/30 p-3 border border-zinc-700/50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Term</div>
              <div className="text-lg font-bold text-white">{opportunity.termMonths} mo</div>
            </div>
            <div className="rounded-lg bg-zinc-800/30 p-3 border border-zinc-700/50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Min. invest</div>
              <div className="text-lg font-bold text-white">€{(opportunity.minInvestment / 1000).toFixed(0)}K</div>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-zinc-400">Funding Progress</span>
              <span className="font-semibold text-white">{fundingProgress.toFixed(1)}%</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(fundingProgress, 100)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                €{(opportunity.currentFunding / 1000).toFixed(0)}K raised
              </span>
              <span className="text-zinc-500">
                €{(opportunity.totalFundingTarget / 1000).toFixed(0)}K target
              </span>
            </div>
          </div>

          {/* Status and Risk Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={
              opportunity.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" :
              opportunity.status === "upcoming" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
              opportunity.status === "closed" ? "bg-gray-500/20 text-gray-400 border-gray-500/30" :
              "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
            }>
              {opportunity.status}
            </Badge>
            <Badge variant="outline" className={
              opportunity.riskLevel === "Low" ? "border-green-500/50 text-green-400 bg-green-500/10" :
              opportunity.riskLevel === "Medium" ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" :
              "border-red-500/50 text-red-400 bg-red-500/10"
            }>
              {opportunity.riskLevel} Risk
            </Badge>
            {opportunity.investorsCount > 0 && (
              <span className="ml-auto text-xs text-zinc-500">
                {opportunity.investorsCount} investors
              </span>
            )}
          </div>

          {/* View Details Button */}
          <Button 
            onClick={handleViewDetails}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white hover:from-blue-500 hover:via-blue-400 hover:to-cyan-500 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 font-semibold py-6 group/btn"
            size="lg"
          >
            <span className="flex items-center justify-center gap-2">
              View details
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

