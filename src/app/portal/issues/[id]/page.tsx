"use client";

import { useParams, useRouter } from "next/navigation";
import { issuances } from "@/data/issuances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wind, Sun, MapPin, Calendar, Euro, TrendingUp, Building2, Users, Shield, FileText, Clock, CheckCircle2, Info } from "lucide-react";
import { useAppDispatch } from "@/store";
import { openSubscription } from "@/store/slices/ui";
import { useMemo, useState, useEffect } from "react";
import { SubscriptionModal } from "@/components/portal/SubscriptionModal";

export default function BondDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bondId = params.id as string;
  
  const bond = issuances.find((iss) => iss.id === bondId);

  // Use actual data from bond
  const totalAmount = bond?.currentFunding || 0;
  const investorsCount = bond?.investorsCount || 0;
  const remainingAmount = bond ? bond.totalFundingTarget - bond.currentFunding : 0;

  const progressPercentage = useMemo(() => {
    if (!bond || bond.totalFundingTarget === 0) return 0;
    return Math.round(((bond.currentFunding / bond.totalFundingTarget) * 100));
  }, [bond]);

  if (!bond) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="border-zinc-800 bg-zinc-900/50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-400">Bond not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Opportunities
      </Button>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
        <div className="relative p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-xl ring-2 ${
                  bond.type === "Wind" 
                    ? "bg-blue-500/10 ring-blue-500/20" 
                    : "bg-amber-500/10 ring-amber-500/20"
                }`}>
                  {bond.type === "Wind" ? (
                    <Wind className="h-8 w-8 text-blue-400" />
                  ) : (
                    <Sun className="h-8 w-8 text-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
                    {bond.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{bond.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{bond.type} Energy Project</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-500/10 border border-blue-500/20 px-8 py-6 text-center backdrop-blur-sm">
              <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {bond.rate}%
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Annual Interest Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4 border-b border-zinc-800/50">
          <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
            Funding Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Funding Progress</span>
              <span className="font-semibold text-white">{progressPercentage}%</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-zinc-800/50">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-xs text-zinc-400 mb-1">Total Raised</div>
                <div className="text-lg font-bold text-white">€{bond.currentFunding.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-400 mb-1">Target</div>
                <div className="text-lg font-bold text-white">€{bond.totalFundingTarget.toLocaleString()}</div>
              </div>
            </div>
            {bond.endDate && (
              <div className="pt-3 border-t border-zinc-800/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Investment Period</span>
                  <span className="text-white font-medium">
                    Until {new Date(bond.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Information */}
          <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                Investment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    Interest Rate
                  </div>
                  <div className="text-2xl font-bold text-white">{bond.rate}%</div>
                  <div className="text-xs text-zinc-500">Per annum, fixed rate</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                    <Calendar className="h-4 w-4" />
                    Investment Term
                  </div>
                  <div className="text-2xl font-bold text-white">{bond.termMonths}</div>
                  <div className="text-xs text-zinc-500">Months ({bond.termMonths / 12} years)</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                    <Euro className="h-4 w-4" />
                    Minimum Investment
                  </div>
                  <div className="text-2xl font-bold text-white">€{bond.minInvestment.toLocaleString()}</div>
                  <div className="text-xs text-zinc-500">Per investor</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                    <Clock className="h-4 w-4" />
                    Payment Frequency
                  </div>
                  <div className="text-2xl font-bold text-white">{bond.paymentFrequency}</div>
                  <div className="text-xs text-zinc-500">Interest payments</div>
                </div>
                {bond.maxInvestment && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                      <Euro className="h-4 w-4" />
                      Maximum Investment
                    </div>
                    <div className="text-2xl font-bold text-white">€{bond.maxInvestment.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">Per investor</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                    <Shield className="h-4 w-4" />
                    Risk Level
                  </div>
                  <div className={`text-2xl font-bold ${
                    bond.riskLevel === "Low" ? "text-green-400" :
                    bond.riskLevel === "Medium" ? "text-amber-400" :
                    "text-red-400"
                  }`}>
                    {bond.riskLevel}
                  </div>
                  {bond.creditRating && (
                    <div className="text-xs text-zinc-500">Credit Rating: {bond.creditRating}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20">
                    <Building2 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                      Project Type
                    </div>
                    <div className="text-base font-semibold text-white">{bond.type} Energy Project</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Renewable {bond.type === "Wind" ? "wind" : "solar"} energy generation facility
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <div className="rounded-lg bg-amber-500/10 p-2 ring-1 ring-amber-500/20">
                    <MapPin className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                      Location
                    </div>
                    <div className="text-base font-semibold text-white">{bond.location}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Netherlands
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <div className="rounded-lg bg-green-500/10 p-2 ring-1 ring-green-500/20">
                    <Shield className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                      Bond Structure
                    </div>
                    <div className="text-base font-semibold text-white">{bond.bondStructure}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {bond.sector} - {bond.paymentFrequency} payments
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <div className="rounded-lg bg-purple-500/10 p-2 ring-1 ring-purple-500/20">
                    <Building2 className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                      Company
                    </div>
                    <div className="text-base font-semibold text-white">{bond.company}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Project owner and operator
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-1">
                      Description
                    </div>
                    <div className="text-sm text-zinc-300 leading-relaxed">
                      {bond.description}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-900/10 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2 ring-1 ring-amber-500/20">
                  <Info className="h-4 w-4 text-amber-400" />
                </div>
                <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                  Important Information
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
                <p>
                  • Investment returns are subject to market conditions and project performance. Past performance is not indicative of future results.
                </p>
                <p>
                  • Your capital is at risk. Please read the investment documentation carefully before making an investment decision.
                </p>
                <p>
                  • Interest payments will be made quarterly directly to your registered bank account or reinvested as per your preference.
                </p>
                <p>
                  • This bond is backed by the project assets and offers a fixed rate of return for the specified term.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                  <Users className="h-4 w-4" />
                  Total Investors
                </div>
                <div className="text-2xl font-bold text-white">{investorsCount.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  Average Investment
                </div>
                <div className="text-2xl font-bold text-white">€{investorsCount > 0 ? (totalAmount / investorsCount).toLocaleString(0) : '0'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-zinc-800/50 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.1em] text-zinc-300">
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50 transition-all text-left group">
                <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">Prospectus</div>
                  <div className="text-xs text-zinc-500">PDF • 2.4 MB</div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50 transition-all text-left group">
                <div className="rounded-lg bg-blue-500/10 p-2 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20">
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">Term Sheet</div>
                  <div className="text-xs text-zinc-500">PDF • 1.8 MB</div>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Invest Button */}
          <Button
            onClick={() => dispatch(openSubscription({ issuance: bond.title }))}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white hover:from-blue-500 hover:via-blue-400 hover:to-cyan-500 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 font-semibold py-6 text-lg"
            size="lg"
          >
            Invest Now
          </Button>
        </div>
      </div>

      <SubscriptionModal />
    </div>
  );
}

