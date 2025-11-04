"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserAssets } from "@/hooks/swr/useUser";

export default function OwnedAssetsPage() {
  const { assets, isLoading, isError, error } = useUserAssets();

  const totalValue = assets?.reduce((sum, asset) => sum + (asset.value ?? asset.totalValue ?? 0), 0) || 0;

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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="text-zinc-500">Loading assets...</div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="text-red-400">Error loading assets: {error?.message || "Unknown error"}</div>
                    </td>
                  </tr>
                ) : !assets || assets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="text-zinc-500">No assets found</div>
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr 
                      key={asset.id}
                      className="border-b border-zinc-800/30 last:border-0 transition-colors hover:bg-zinc-800/20"
                    >
                      <td className="px-6 py-4 font-medium text-white">{asset.name ?? asset.issuanceName ?? "N/A"}</td>
                      <td className="px-6 py-4 text-zinc-400">{asset.type ?? "Bond"}</td>
                      <td className="px-6 py-4 font-semibold text-white">{(asset.quantity ?? asset.bonds ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold text-white">€ {(asset.value ?? asset.totalValue ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-zinc-400">
                        {(() => {
                          const dateStr = asset.dateAcquired ?? asset.purchaseDate;
                          return dateStr ? new Date(dateStr).toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          }) : "N/A";
                        })()}
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

