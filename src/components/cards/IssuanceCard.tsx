"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Issuance } from "@/data/issuances";

export function IssuanceCard({ issuance }: { issuance: Issuance }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-purple-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        <CardHeader>
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold sm:text-xl">{issuance.title}</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{issuance.type} • {issuance.location}</p>
            </div>
            <motion.div 
              className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {issuance.rate}%
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Rate</div>
              <div className="mt-1 text-lg font-bold">{issuance.rate}%</div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Term</div>
              <div className="mt-1 text-lg font-bold">{issuance.termMonths} mo</div>
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Min. investment</div>
              <div className="mt-1 text-lg font-bold">€ {issuance.minInvestment}</div>
            </div>
          </div>
          <Button asChild className="w-full shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30">
            <Link href={`/uitgiften/${issuance.id}`}>View details</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}


