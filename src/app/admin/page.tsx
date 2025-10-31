"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "@/lib/mockApi";
import type { AdminStats } from "@/lib/mockApi";
import { Users, TrendingUp, Euro, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      trend: "+12%",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Investments",
      value: stats.totalInvestments.toLocaleString(),
      icon: TrendingUp,
      trend: "+8%",
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Amount Raised",
      value: `€${(stats.amountRaised / 1000000).toFixed(1)}M`,
      icon: Euro,
      trend: "+15%",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Active Issuances",
      value: stats.activeIssuances.toString(),
      icon: FileText,
      trend: "0",
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.trend !== "0" && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {stat.trend} from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Use the navigation menu to manage issuances, projects, users, and more.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Last updated</span>
                <span className="font-medium">{format(new Date(), "PPp")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">System status</span>
                <span className="font-medium text-green-600 dark:text-green-400">All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

