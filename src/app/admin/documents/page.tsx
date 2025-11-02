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
import { Badge } from "@/components/ui/badge";
import { useAdminDocuments, useUploadDocument, useDeleteDocument } from "@/hooks/swr/useAdmin";
import { AdminApi } from "@/api/admin.api";
import { Upload, Download, Search, FileText, Trash2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AdminDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { documents: filteredItems, isLoading, mutate } = useAdminDocuments({
    search: searchQuery || undefined,
    category: undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const { uploadDocument, isUploading } = useUploadDocument();
  const { deleteDocument, isDeleting } = useDeleteDocument();

  // Ensure paginatedItems is always an array
  const paginatedItems = Array.isArray(filteredItems) ? filteredItems : [];
  const totalPages = Math.ceil(paginatedItems.length / ITEMS_PER_PAGE);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "OTHER");

    try {
      await uploadDocument(formData);
      mutate();
      e.target.value = "";
    } catch (error) {
      console.error("Failed to upload document:", error);
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const blob = await AdminApi.downloadDocument(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument({ id });
        mutate();
      } catch (error) {
        console.error("Failed to delete document:", error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "legal":
        return "bg-blue-500";
      case "financial":
        return "bg-green-500";
      case "project":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage platform documents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label>
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={isUploading}
            />
            <Button asChild disabled={isUploading}>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Document"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      {item.name}
                    </TableCell>
                    <TableCell>{item.type.toUpperCase()}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(item.size)}</TableCell>
                    <TableCell>{new Date(item.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{item.uploadedBy}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(item.id, item.name)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} disabled={isDeleting}>
                          <Trash2 className="h-4 w-4 text-red-600" />
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
                {filteredItems.length} documents
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

