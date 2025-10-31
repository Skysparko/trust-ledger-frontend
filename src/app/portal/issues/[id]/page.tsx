"use client";

import { useParams, useRouter } from "next/navigation";
import { issuances } from "@/data/issuances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wind, Sun, MapPin, Calendar, Euro, TrendingUp } from "lucide-react";
import { useAppDispatch } from "@/store";
import { openSubscription } from "@/store/slices/ui";

export default function BondDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bondId = params.id as string;
  
  const bond = issuances.find((iss) => iss.id === bondId);

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
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Issues
      </Button>

      {/* Header Card */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                {bond.type === "Wind" ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                    <Wind className="h-6 w-6 text-blue-400" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                    <Sun className="h-6 w-6 text-amber-400" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-3xl font-bold text-white">{bond.title}</CardTitle>
                  <div className="mt-1 flex items-center gap-2 text-zinc-400">
                    <MapPin className="h-4 w-4" />
                    <span>{bond.location}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 px-6 py-4 text-center">
              <div className="text-4xl font-extrabold text-blue-400">{bond.rate}%</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
                Interest Rate
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Key Information */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
              Key Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Interest Rate</span>
              </div>
              <span className="font-bold text-white">{bond.rate}% per annum</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Term</span>
              </div>
              <span className="font-bold text-white">{bond.termMonths} months</span>
            </div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">Minimum Investment</span>
              </div>
              <span className="font-bold text-white">€{bond.minInvestment.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Investment Summary */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
              Investment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-800/20 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Project Type
              </div>
              <div className="mt-2 text-lg font-bold text-white">{bond.type} Energy</div>
            </div>
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-800/20 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Location
              </div>
              <div className="mt-2 text-lg font-bold text-white">{bond.location}</div>
            </div>
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-800/20 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Bond Structure
              </div>
              <div className="mt-2 text-lg font-bold text-white">Fixed Rate Bond</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
        <CardContent className="py-6">
          <Button
            onClick={() => dispatch(openSubscription({ issuance: bond.title }))}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
            size="lg"
          >
            Invest in this Bond
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

