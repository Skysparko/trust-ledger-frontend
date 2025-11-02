"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdminTransactions, useExportTransactions } from "@/hooks/swr/useAdmin";
import { Search, Download } from "lucide-react";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export default function AdminTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { transactions: filteredItems, isLoading } = useAdminTransactions({
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter.toUpperCase() : undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const { exportTransactions, isExporting } = useExportTransactions();

  const handleExport = async () => {
    try {
      const blob = await exportTransactions({ format: "csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export transactions:", error);
    }
  };

  // Ensure paginatedItems is always an array
  const paginatedItems = Array.isArray(filteredItems) ? filteredItems : [];
  const totalPages = Math.ceil(paginatedItems.length / ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "confirmed":
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      case "refunded":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const totalAmount = paginatedItems.reduce((sum, item) => sum + item.amount, 0);
  const confirmedAmount = paginatedItems
    .filter((item) => item.status === "confirmed")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          View and manage all platform transactions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paginatedItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Confirmed Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{confirmedAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              options={[
                { label: "All Status", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Confirmed", value: "confirmed" },
                { label: "Failed", value: "failed" },
                { label: "Refunded", value: "refunded" },
              ]}
              onValueChange={setStatusFilter}
              className="w-full sm:w-48"
            />
            <Select
              value={paymentMethodFilter}
              options={[
                { label: "All Methods", value: "all" },
                { label: "Bank Transfer", value: "bank_transfer" },
                { label: "Credit Card", value: "credit_card" },
                { label: "SEPA", value: "sepa" },
              ]}
              onValueChange={setPaymentMethodFilter}
              className="w-full sm:w-48"
            />
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Issuance</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Bonds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-zinc-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.userName}</div>
                        <div className="text-xs text-zinc-500">{item.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.issuanceTitle}</TableCell>
                    <TableCell className="font-medium">€{item.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>{item.paymentMethod?.replace("_", " ") || "-"}</TableCell>
                    <TableCell>{format(new Date(item.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{item.bonds || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-zinc-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, paginatedItems.length)} of{" "}
                {paginatedItems.length} transactions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

