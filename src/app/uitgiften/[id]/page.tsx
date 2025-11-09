"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, DollarSign, TrendingUp, Building2, Users, Shield, FileText, Clock, CheckCircle2, Info, Globe, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useInvestmentOpportunity } from "@/hooks/swr/useInvestmentOpportunities";
import { motion } from "framer-motion";

export default function InvestmentOpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params.id as string;
  
  const { opportunity, isLoading, isError, error } = useInvestmentOpportunity(opportunityId);

  // Use actual data from API
  const totalAmount = opportunity?.currentFunding || 0;
  const investorsCount = opportunity?.investorsCount || 0;
  const remainingAmount = opportunity ? opportunity.totalFundingTarget - opportunity.currentFunding : 0;

  const progressPercentage = useMemo(() => {
    if (!opportunity || opportunity.totalFundingTarget === 0) return 0;
    return Math.round(((opportunity.currentFunding / opportunity.totalFundingTarget) * 100));
  }, [opportunity]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="relative mx-auto max-w-7xl px-4 py-12">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6 border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">Loading investment opportunity...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !opportunity) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="relative mx-auto max-w-7xl px-4 py-12">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6 border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
            <CardContent className="py-12 text-center">
              <p className="text-red-500 dark:text-red-400 mb-2">Investment opportunity not found</p>
              {error && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{error.message || "Please try again later"}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Opportunities
        </Button>

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-white shadow-xl dark:border-zinc-800/50 dark:from-zinc-900/90 dark:via-zinc-900/80 dark:to-zinc-900/90"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
          <div className="relative p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl ring-2 bg-blue-500/10 ring-blue-500/20 dark:bg-blue-500/10 dark:ring-blue-500/20">
                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">
                      {opportunity.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{opportunity.sector}</span>
                      </div>
                      <Badge className={
                        opportunity.status === "active" ? "bg-green-500 text-white" :
                        opportunity.status === "upcoming" ? "bg-blue-500 text-white" :
                        opportunity.status === "closed" ? "bg-gray-500 text-white" :
                        "bg-yellow-500 text-white"
                      }>
                        {opportunity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-500/10 border border-blue-500/20 px-8 py-6 text-center backdrop-blur-sm dark:from-blue-500/20 dark:via-cyan-500/20 dark:to-blue-500/10">
                <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
                  {opportunity.rate}%
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Annual Interest Rate
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="mt-6 border-zinc-200 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900/90">
            <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                Funding Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Funding Progress</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{progressPercentage}%</span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800/50">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Total Raised</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">${opportunity.currentFunding.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Target</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white">${opportunity.totalFundingTarget.toLocaleString()}</div>
                  </div>
                </div>
                {opportunity.endDate && (
                  <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">Investment Period</span>
                      <span className="text-zinc-900 dark:text-white font-medium">
                        Until {new Date(opportunity.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-zinc-200 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900/90">
                <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                  <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                    Investment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        Interest Rate
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{opportunity.rate}%</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">Per annum, fixed rate</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                        <Calendar className="h-4 w-4" />
                        Investment Term
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{opportunity.termMonths}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">Months ({Math.round(opportunity.termMonths / 12 * 10) / 10} years)</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                        <DollarSign className="h-4 w-4" />
                        Price
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">${opportunity.minInvestment.toLocaleString()}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">Per investor</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                        <Clock className="h-4 w-4" />
                        Payment Frequency
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{opportunity.paymentFrequency}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500">Interest payments</div>
                    </div>
                    {opportunity.maxInvestment && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                          <DollarSign className="h-4 w-4" />
                          Total Offering
                        </div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">${opportunity.maxInvestment.toLocaleString()}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">Per investor</div>
                      </div>
                    )}
                    {opportunity.totalFundingTarget && opportunity.minInvestment && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                          <Building2 className="h-4 w-4" />
                          Available Bonds
                        </div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {Math.floor(opportunity.totalFundingTarget / opportunity.minInvestment).toLocaleString()}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">From Total Bonds</div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                        <Shield className="h-4 w-4" />
                        Risk Level
                      </div>
                      <div className={`text-2xl font-bold ${
                        opportunity.riskLevel === "Low" ? "text-green-600 dark:text-green-400" :
                        opportunity.riskLevel === "Medium" ? "text-amber-600 dark:text-amber-400" :
                        "text-red-600 dark:text-red-400"
                      }`}>
                        {opportunity.riskLevel}
                      </div>
                      {opportunity.creditRating && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">Credit Rating: {opportunity.creditRating}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Project Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-zinc-200 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900/90">
                <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                  <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50">
                      <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:ring-blue-500/20">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                          Project Type
                        </div>
                        <div className="text-base font-semibold text-zinc-900 dark:text-white">{opportunity.projectType || opportunity.type}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          {opportunity.sector} sector investment opportunity
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50">
                      <div className="rounded-lg bg-amber-500/10 p-2 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:ring-amber-500/20">
                        <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                          Location
                        </div>
                        <div className="text-base font-semibold text-zinc-900 dark:text-white">{opportunity.location}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          {opportunity.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50">
                      <div className="rounded-lg bg-green-500/10 p-2 ring-1 ring-green-500/20 dark:bg-green-500/10 dark:ring-green-500/20">
                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                          Bond Structure
                        </div>
                        <div className="text-base font-semibold text-zinc-900 dark:text-white">{opportunity.bondStructure || "Corporate Bond"}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          {opportunity.sector} - {opportunity.paymentFrequency} payments
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50">
                      <div className="rounded-lg bg-purple-500/10 p-2 ring-1 ring-purple-500/20 dark:bg-purple-500/10 dark:ring-purple-500/20">
                        <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                          Company
                        </div>
                        <div className="text-base font-semibold text-zinc-900 dark:text-white">{opportunity.company}</div>
                        {opportunity.companyWebsite && (
                          <a 
                            href={opportunity.companyWebsite} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1 flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            Visit website
                          </a>
                        )}
                        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          Project owner and operator
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50">
                      <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:ring-blue-500/20">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-1">
                          Description
                        </div>
                        <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                          {opportunity.description}
                        </div>
                        {opportunity.shortDescription && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-2 italic">
                            {opportunity.shortDescription}
                          </div>
                        )}
                        {opportunity.useOfFunds && (
                          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700/50">
                            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                              Use of Funds
                            </div>
                            <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {opportunity.useOfFunds}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Highlights */}
            {opportunity.keyHighlights && opportunity.keyHighlights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 via-white to-white shadow-xl dark:border-blue-500/20 dark:from-blue-900/10 dark:via-zinc-900/80 dark:to-zinc-900/90">
                  <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20 dark:bg-blue-500/10 dark:ring-blue-500/20">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                        Key Highlights
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {opportunity.keyHighlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Risk Factors */}
            {opportunity.riskFactors && opportunity.riskFactors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50 via-white to-white shadow-xl dark:border-amber-500/20 dark:from-amber-900/10 dark:via-zinc-900/80 dark:to-zinc-900/90">
                  <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-500/10 p-2 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:ring-amber-500/20">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                        Risk Factors
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {opportunity.riskFactors.map((risk, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Milestones */}
            {opportunity.milestones && opportunity.milestones.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="border-zinc-200 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900/90">
                  <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                    <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                      Project Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {opportunity.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            milestone.status === "completed" ? "bg-green-500" :
                            milestone.status === "upcoming" ? "bg-blue-500" :
                            "bg-zinc-400 dark:bg-zinc-500"
                          }`} />
                          <div className="flex-1 pb-4 border-l border-zinc-200 dark:border-zinc-700/50 pl-4">
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                              {new Date(milestone.date).toLocaleDateString("en-US", { 
                                month: "short", 
                                day: "numeric", 
                                year: "numeric" 
                              })}
                            </div>
                            <div className="text-sm text-zinc-900 dark:text-white">{milestone.description}</div>
                            <Badge className={`mt-2 ${
                              milestone.status === "completed" ? "bg-green-500 text-white" :
                              milestone.status === "upcoming" ? "bg-blue-500 text-white" :
                              "bg-zinc-500 text-white"
                            }`}>
                              {milestone.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* FAQ */}
            {opportunity.faq && opportunity.faq.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Card className="border-zinc-200 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900/90">
                  <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                    <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {opportunity.faq.map((faq, index) => (
                        <div key={index} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">{faq.question}</div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.answer}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Important Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50 via-white to-white shadow-xl dark:border-amber-500/20 dark:from-amber-900/10 dark:via-zinc-900/80 dark:to-zinc-900/90">
                <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-500/10 p-2 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:ring-amber-500/20">
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                      Important Information
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      • Investment returns are subject to market conditions and project performance. Past performance is not indicative of future results.
                    </p>
                    <p>
                      • Your capital is at risk. Please read the investment documentation carefully before making an investment decision.
                    </p>
                    <p>
                      • Interest payments will be made {opportunity.paymentFrequency.toLowerCase()} directly to your registered bank account or reinvested as per your preference.
                    </p>
                    <p>
                      • This investment opportunity is backed by the project assets and offers a fixed rate of return for the specified term.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-zinc-200 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900/90">
                <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                  <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                      <Users className="h-4 w-4" />
                      Total Investors
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">{investorsCount.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      Average Investment
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">${investorsCount > 0 ? (totalAmount / investorsCount).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0'}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-zinc-200 bg-white shadow-xl dark:border-zinc-800/50 dark:bg-zinc-900/90">
                <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800/50">
                  <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-600 dark:text-zinc-300">
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {opportunity.documents && opportunity.documents.length > 0 ? (
                    opportunity.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600/50 transition-all text-left group"
                      >
                        <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 dark:bg-blue-500/10 dark:ring-blue-500/20">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white">{doc.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-500">
                            {doc.type.toUpperCase()} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 text-sm">No documents available</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Invest Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white hover:from-blue-500 hover:via-blue-400 hover:to-cyan-500 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 font-semibold py-6 text-lg"
                size="lg"
                disabled={opportunity.status !== "active"}
              >
                {opportunity.status === "active" ? "Login to Invest" : opportunity.status === "upcoming" ? "Coming Soon" : "Closed"}
              </Button>
              {opportunity.status !== "active" && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-2">
                  {opportunity.status === "upcoming" && "This opportunity is not yet open for investment"}
                  {opportunity.status === "closed" && "This opportunity is no longer accepting investments"}
                  {opportunity.status === "paused" && "This opportunity is temporarily paused"}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

