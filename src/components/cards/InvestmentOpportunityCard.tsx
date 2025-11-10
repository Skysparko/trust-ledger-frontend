"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight, Users, Calendar, DollarSign } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import { hydrateFromStorage } from "@/store/slices/auth";
import type { InvestmentOpportunityListItem } from "@/api/investment-opportunities.api";

export function InvestmentOpportunityCard({ opportunity }: { opportunity: InvestmentOpportunityListItem }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const progressPercentage = useMemo(() => {
    if (!opportunity || opportunity.maxInvestment === 0) return 0;
    return Math.round(((opportunity.currentFunding / opportunity.maxInvestment!) * 100));
  }, [opportunity]);

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
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group relative h-full flex flex-col overflow-hidden border border-zinc-800/60 bg-zinc-900/95 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5">
        {/* Featured Badge - Top Right Corner */}
        {opportunity.isFeatured && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-zinc-900 border-0 shadow-md shadow-amber-500/20 text-[10px] font-bold px-2.5 py-0.5">
              Featured
            </Badge>
          </div>
        )}

        {/* Subtle accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="relative pb-5 pt-6">
          {/* Sector Badge */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2.5 py-1 border border-zinc-700/50">
              <TrendingUp className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                {opportunity.sector}
              </span>
            </div>
          </div>

          {/* Title and Company */}
          <div className="space-y-2 mb-4">
            <h3 className="text-lg font-bold leading-snug text-white line-clamp-2 group-hover:text-blue-100 transition-colors">
              {opportunity.title}
            </h3>
            <p className="text-sm text-zinc-400 flex items-center gap-1.5">
              <span>{opportunity.company}</span>
              <span className="text-zinc-600">•</span>
              <span>{opportunity.location}</span>
            </p>
          </div>

          {/* Prominent Rate Display */}
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {opportunity.rate}%
            </div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Annual Rate
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative flex-1 flex flex-col space-y-5 pb-6">
          {/* Key Metrics - Refined Design */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-lg bg-zinc-800/40 p-3 border border-zinc-700/30 hover:border-zinc-600/50 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="h-3 w-3 text-blue-400/70" />
                <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Rate</div>
              </div>
              <div className="text-base font-bold text-white">{opportunity.rate}%</div>
            </div>
            <div className="rounded-lg bg-zinc-800/40 p-3 border border-zinc-700/30 hover:border-zinc-600/50 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3 w-3 text-blue-400/70" />
                <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Term</div>
              </div>
              <div className="text-base font-bold text-white">{opportunity.termMonths} mo</div>
            </div>
            <div className="rounded-lg bg-zinc-800/40 p-3 border border-zinc-700/30 hover:border-zinc-600/50 transition-colors">
              <div className="flex items-center gap-1.5 mb-1.5">
                <DollarSign className="h-3 w-3 text-blue-400/70" />
                <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Min</div>
              </div>
              <div className="text-base font-bold text-white">${(opportunity.minInvestment / 1000).toFixed(0)}K</div>
            </div>
          </div>

          {/* Funding Progress - Enhanced */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Funding Progress</span>
              <span className="text-sm font-bold text-white">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800/60">
              <motion.div
                className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm shadow-blue-500/30"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(progressPercentage, 100)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>${(opportunity.currentFunding / 1000).toFixed(0)}K raised</span>
              <span>${(opportunity.maxInvestment! / 1000).toFixed(0)}K target</span>
            </div>
          </div>

          {/* Status, Risk, and Investors - Refined Layout */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge className={
              opportunity.status === "active" 
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] px-2.5 py-0.5 font-semibold" :
              opportunity.status === "upcoming" 
                ? "bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px] px-2.5 py-0.5 font-semibold" :
              opportunity.status === "closed" 
                ? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30 text-[10px] px-2.5 py-0.5 font-semibold" :
              "bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] px-2.5 py-0.5 font-semibold"
            }>
              {opportunity.status}
            </Badge>
            <Badge className={
              opportunity.riskLevel === "Low" 
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40 text-[10px] px-2.5 py-0.5 font-semibold" :
              opportunity.riskLevel === "Medium" 
                ? "bg-amber-500/10 text-amber-300 border-amber-500/40 text-[10px] px-2.5 py-0.5 font-semibold" :
              "bg-red-500/10 text-red-300 border-red-500/40 text-[10px] px-2.5 py-0.5 font-semibold"
            }>
              {opportunity.riskLevel} Risk
            </Badge>
            {opportunity.investorsCount > 0 && (
              <div className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400">
                <Users className="h-3 w-3" />
                <span className="font-medium">{opportunity.investorsCount}</span>
              </div>
            )}
          </div>

          {/* View Details Button - More Professional */}
          <Button 
            onClick={handleViewDetails}
            className="w-full mt-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 font-semibold py-2 text-sm group/btn border-0"
            size="default"
          >
            <span className="flex items-center justify-center gap-1.5">
              View details
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

