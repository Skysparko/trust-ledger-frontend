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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdminProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/swr/useAdmin";
import type { AdminProject } from "@/api/admin.api";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AdminProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminProject | null>(null);
  const [formData, setFormData] = useState<Partial<AdminProject>>({});

  const { projects: filteredItems, isLoading, mutate } = useAdminProjects({
    search: searchQuery || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const { createProject, isCreating } = useCreateProject();
  const { updateProject, isUpdating } = useUpdateProject();
  const { deleteProject, isDeleting } = useDeleteProject();

  // Ensure paginatedItems is always an array
  const paginatedItems = Array.isArray(filteredItems) ? filteredItems : [];
  const totalPages = Math.ceil(paginatedItems.length / ITEMS_PER_PAGE);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleEdit = (item: AdminProject) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject({ id });
        mutate();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await updateProject({ id: editingItem.id, payload: formData });
      } else {
        await createProject({
          title: formData.title || formData.name || "",
          name: formData.title || formData.name || "",
          description: formData.description || "",
          location: formData.location || "",
          type: formData.type || formData.sector || "",
          sector: formData.type || formData.sector || "",
          status: (formData.status as any) || "ACTIVE",
        });
      }
      mutate();
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "LIVE":
        return "bg-green-500";
      case "COMPLETED":
        return "bg-gray-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage all platform projects
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search projects..."
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
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                    No projects found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title || item.name || "-"}</TableCell>
                    <TableCell>{item.type || item.sector || "-"}</TableCell>
                    <TableCell>{item.location || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
                {filteredItems.length} projects
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Project" : "Create Project"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the project details" : "Add a new project to the platform"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type || formData.sector || ""}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, sector: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={formData.status || ""}
                  options={[
                    { label: "Active", value: "ACTIVE" },
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Cancelled", value: "CANCELLED" },
                  ]}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

