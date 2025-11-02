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
import { useAdminUsers, useUpdateUserKycStatus, useUpdateUserStatus } from "@/hooks/swr/useAdmin";
import type { AdminUserRecord } from "@/api/admin.api";
import { Search, CheckCircle2, XCircle, Ban, UserCheck } from "lucide-react";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { users: items, isLoading, mutate } = useAdminUsers({
    search: searchQuery || undefined,
    kycStatus: kycFilter !== "all" ? (kycFilter.toLowerCase() as any) : undefined,
    isActive: statusFilter !== "all" ? statusFilter === "active" : undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const { updateUserKycStatus } = useUpdateUserKycStatus();
  const { updateUserStatus } = useUpdateUserStatus();

  // Ensure items is always an array
  const filteredItems = Array.isArray(items) ? items : [];

  // Remove client-side filtering since API handles it
  // Note: API handles pagination, so we use all items for now
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItemsForDisplay = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleKycApprove = async (id: string) => {
    try {
      await updateUserKycStatus({ id, payload: { status: "approved" } });
      mutate();
    } catch (error) {
      console.error("Failed to approve KYC:", error);
    }
  };

  const handleKycReject = async (id: string) => {
    try {
      await updateUserKycStatus({ id, payload: { status: "rejected" } });
      mutate();
    } catch (error) {
      console.error("Failed to reject KYC:", error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateUserStatus({ id, payload: { isActive: !currentStatus } });
      mutate();
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage platform users and KYC approvals
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={kycFilter}
              options={[
                { label: "All KYC Status", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
              onValueChange={setKycFilter}
              className="w-full sm:w-48"
            />
            <Select
              value={statusFilter}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              onValueChange={setStatusFilter}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItemsForDisplay.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItemsForDisplay.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      <Badge className={getKycStatusColor(item.kycStatus.toLowerCase())}>
                        {item.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={item.isActive ? "bg-green-500" : "bg-gray-500"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(item.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {item.kycStatus === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleKycApprove(item.id)}
                              title="Approve KYC"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleKycReject(item.id)}
                              title="Reject KYC"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(item.id, item.isActive)}
                          title={item.isActive ? "Deactivate" : "Activate"}
                        >
                          {item.isActive ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
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
                {filteredItems.length} users
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

