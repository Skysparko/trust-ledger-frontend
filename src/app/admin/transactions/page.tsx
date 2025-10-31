"use client";

import { useState, useEffect } from "react";
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
import { getAdminTransactions } from "@/lib/mockApi";
import type { AdminTransaction } from "@/lib/mockApi";
import { Search, Download } from "lucide-react";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export default function AdminTransactionsPage() {
  const [items, setItems] = useState<AdminTransaction[]>([]);
  const [filteredItems, setFilteredItems] = useState<AdminTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const transactions = await getAdminTransactions();
    setItems(transactions);
    setFilteredItems(transactions);
  };

  useEffect(() => {
    let filtered = items.filter(
      (item) =>
        item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.issuanceTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter((item) => item.paymentMethod === paymentMethodFilter);
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentMethodFilter, items]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
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

  const totalAmount = filteredItems.reduce((sum, item) => sum + item.amount, 0);
  const confirmedAmount = filteredItems
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
            <div className="text-2xl font-bold">{filteredItems.length}</div>
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
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
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
              {paginatedItems.length === 0 ? (
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
                    <TableCell>{item.paymentMethod.replace("_", " ")}</TableCell>
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
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of{" "}
                {filteredItems.length} transactions
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

