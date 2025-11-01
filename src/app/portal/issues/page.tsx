"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { issuances } from "@/data/issuances";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function IssuesPage() {
  const openOpportunities = issuances.filter(iss => iss.status === "open");
  
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {openOpportunities.map((issuance, index) => (
          <motion.div
            key={issuance.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/portal/issues/${issuance.id}`}>
              <Card className="group h-full cursor-pointer border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-400" />
                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                          {issuance.type}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold text-white">{issuance.title}</CardTitle>
                      <p className="mt-1 text-sm text-zinc-400">{issuance.location}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 px-3 py-1.5">
                      <div className="text-lg font-bold text-blue-400">{issuance.rate}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Rate</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-800/50 pt-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Rate
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">{issuance.rate}%</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Term
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">{issuance.termMonths} mo</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Min
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">€{issuance.minInvestment}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-zinc-500">Funding Progress</span>
                      <span className="font-semibold text-white">
                        {Math.round((issuance.currentFunding / issuance.totalFundingTarget) * 100)}%
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-zinc-800/50">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${(issuance.currentFunding / issuance.totalFundingTarget) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
                      <span>€{(issuance.currentFunding / 1000).toFixed(0)}k / €{(issuance.totalFundingTarget / 1000).toFixed(0)}k</span>
                      <span>{issuance.investorsCount} investors</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

