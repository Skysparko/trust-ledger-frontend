"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dummyTransactions = [
  {
    id: 1,
    date: "2024-05-20",
    type: "Deposit",
    amount: 10000,
    currency: "EUR",
    status: "completed",
    reference: "TXN-2024-001234"
  },
  {
    id: 2,
    date: "2024-05-18",
    type: "Investment",
    amount: -5000,
    currency: "EUR",
    status: "completed",
    reference: "TXN-2024-001189"
  },
  {
    id: 3,
    date: "2024-05-15",
    type: "Withdrawal",
    amount: -2000,
    currency: "EUR",
    status: "pending",
    reference: "TXN-2024-001156"
  },
  {
    id: 4,
    date: "2024-05-12",
    type: "Deposit",
    amount: 15000,
    currency: "EUR",
    status: "completed",
    reference: "TXN-2024-001098"
  },
  {
    id: 5,
    date: "2024-05-10",
    type: "Investment",
    amount: -8000,
    currency: "EUR",
    status: "completed",
    reference: "TXN-2024-001067"
  },
  {
    id: 6,
    date: "2024-05-08",
    type: "Deposit",
    amount: 5000,
    currency: "EUR",
    status: "completed",
    reference: "TXN-2024-001045"
  },
  {
    id: 7,
    date: "2024-05-05",
    type: "Investment",
    amount: -3000,
    currency: "EUR",
    status: "completed",
    reference: "TXN-2024-001023"
  },
  {
    id: 8,
    date: "2024-05-02",
    type: "Deposit",
    amount: 12000,
    currency: "EUR",
    status: "completed",
    reference: "TXN-2024-000987"
  }
];

export default function TransactionsFiatPage() {
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
                {dummyTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id}
                    className="border-b border-zinc-800/30 last:border-0 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        transaction.type === "Deposit"
                          ? "inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400"
                          : transaction.type === "Investment"
                          ? "inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400"
                          : "inline-flex items-center rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400"
                      }>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${transaction.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {transaction.amount >= 0 ? "+" : ""}€ {Math.abs(transaction.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{transaction.currency}</td>
                    <td className="px-6 py-4">
                      <span className={
                        transaction.status === "completed"
                          ? "inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400"
                          : transaction.status === "pending"
                          ? "inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400"
                          : "inline-flex items-center rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400"
                      }>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-400">{transaction.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

