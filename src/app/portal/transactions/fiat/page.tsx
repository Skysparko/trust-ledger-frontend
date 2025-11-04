"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserTransactions } from "@/hooks/swr/useUser";

export default function TransactionsFiatPage() {
  const { transactions, isLoading, isError, error } = useUserTransactions();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyTransactionId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Fiat Transactions</h1>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Currency
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-zinc-500">Loading transactions...</div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-red-400">Error loading transactions: {error?.message || "Unknown error"}</div>
                    </td>
                  </tr>
                ) : !transactions || transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-zinc-500">No transactions found</div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr 
                      key={transaction.id}
                      className="border-b border-zinc-800/30 last:border-0 transition-colors hover:bg-zinc-800/20"
                    >
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={
                          transaction.type === "deposit"
                            ? "inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400"
                            : transaction.type === "investment"
                            ? "inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400"
                            : transaction.type === "withdrawal"
                            ? "inline-flex items-center rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400"
                            : "inline-flex items-center rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400"
                        }>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-semibold ${transaction.type === "deposit" || transaction.type === "refund" ? "text-green-400" : "text-red-400"}`}>
                        {transaction.type === "deposit" || transaction.type === "refund" ? "+" : "-"}$ {Math.abs(transaction.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{transaction.currency}</td>
                      <td className="px-6 py-4">
                        <span className={
                          transaction.status === "confirmed" || transaction.status === "completed"
                            ? "inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400"
                            : transaction.status === "pending"
                            ? "inline-flex items-center rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400"
                            : transaction.status === "failed"
                            ? "inline-flex items-center rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400"
                            : "inline-flex items-center rounded-full bg-gray-500/20 px-3 py-1 text-xs font-medium text-gray-400"
                        }>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-zinc-400">{transaction.id}</span>
                          <button
                            onClick={() => copyTransactionId(transaction.id)}
                            className="text-zinc-400 hover:text-zinc-300 transition-colors p-1"
                            title="Copy transaction ID"
                          >
                            {copiedId === transaction.id ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

