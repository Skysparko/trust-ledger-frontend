"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dummyAssets = [
  {
    id: 1,
    name: "Solar Energy Block #2024-001",
    type: "Energy Token",
    quantity: 150,
    value: 22500,
    dateAcquired: "2024-01-15"
  },
  {
    id: 2,
    name: "Wind Energy Block #2024-003",
    type: "Energy Token",
    quantity: 85,
    value: 12750,
    dateAcquired: "2024-02-20"
  },
  {
    id: 3,
    name: "Green Bond #GB-2024-045",
    type: "Bond",
    quantity: 50,
    value: 50000,
    dateAcquired: "2024-03-10"
  },
  {
    id: 4,
    name: "Hydro Energy Block #2024-007",
    type: "Energy Token",
    quantity: 200,
    value: 30000,
    dateAcquired: "2024-04-05"
  },
  {
    id: 5,
    name: "Carbon Credit Certificate #CC-2024-112",
    type: "Certificate",
    quantity: 120,
    value: 18000,
    dateAcquired: "2024-05-12"
  }
];

export default function OwnedAssetsPage() {
  const totalValue = dummyAssets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Owned Assets</h1>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
            Total Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-extrabold text-white">€ {totalValue.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
            Your Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Asset Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Value
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                    Date Acquired
                  </th>
                </tr>
              </thead>
              <tbody>
                {dummyAssets.map((asset) => (
                  <tr 
                    key={asset.id}
                    className="border-b border-zinc-800/30 last:border-0 transition-colors hover:bg-zinc-800/20"
                  >
                    <td className="px-6 py-4 font-medium text-white">{asset.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{asset.type}</td>
                    <td className="px-6 py-4 font-semibold text-white">{asset.quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-white">€ {asset.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(asset.dateAcquired).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
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

