"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { issuances } from "@/data/issuances";
import { Wind, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function IssuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Issues</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {issuances.map((issuance, index) => (
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
                        {issuance.type === "Wind" ? (
                          <Wind className="h-5 w-5 text-blue-400" />
                        ) : (
                          <Sun className="h-5 w-5 text-amber-400" />
                        )}
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
                <CardContent>
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
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

