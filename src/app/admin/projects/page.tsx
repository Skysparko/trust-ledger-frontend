"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { useAdminProjects, useAdminCreateProject, useAdminUpdateProject, useAdminDeleteProject } from "@/hooks/swr/useAdmin";
import type { AdminProject, CreateAdminProjectPayload } from "@/api/admin.api";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const validationSchema = Yup.object({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .required("Title is required"),
  location: Yup.string()
    .required("Location is required"),
  type: Yup.string()
    .optional(),
  status: Yup.string()
    .oneOf(["ACTIVE", "COMPLETED", "CANCELLED", "In development", "Live", "Completed"], "Invalid status")
    .required("Status is required"),
  description: Yup.string()
    .optional(),
});

export default function AdminProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminProject | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { projects: filteredItems, isLoading, mutate } = useAdminProjects({
    search: searchQuery || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const { createProject, isCreating } = useAdminCreateProject();
  const { updateProject, isUpdating } = useAdminUpdateProject();
  const { deleteProject, isDeleting } = useAdminDeleteProject();

  // Ensure paginatedItems is always an array
  const paginatedItems = Array.isArray(filteredItems) ? filteredItems : [];
  const totalPages = Math.ceil(paginatedItems.length / ITEMS_PER_PAGE);

  const getInitialValues = (item?: AdminProject | null): Partial<CreateAdminProjectPayload> => {
    if (item) {
      return {
        title: item.title || item.name || "",
        location: item.location || "",
        type: item.type || item.sector || "",
        status: item.status || "ACTIVE",
        description: item.description || "",
      };
    }
    return {
      title: "",
      location: "",
      type: "",
      status: "ACTIVE",
      description: "",
    };
  };

  const formik = useFormik<Partial<CreateAdminProjectPayload>>({
    initialValues: getInitialValues(),
    validationSchema,
    enableReinitialize: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (editingItem) {
          await updateProject({ id: editingItem.id, payload: values });
        } else {
          await createProject({
            title: values.title || "",
            name: values.title || "",
            description: values.description || "",
            location: values.location || "",
            type: values.type || "",
            sector: values.type || "",
            status: (values.status as any) || "ACTIVE",
          });
        }
        mutate();
        setIsDialogOpen(false);
        setEditingItem(null);
        formik.resetForm();
      } catch (error) {
        console.error("Failed to save project:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCreate = () => {
    setEditingItem(null);
    formik.resetForm({ values: getInitialValues(null) });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: AdminProject) => {
    setEditingItem(item);
    formik.resetForm({ values: getInitialValues(item) });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteProject({ id: itemToDelete });
      mutate();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
      throw error;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "ACTIVE":
      case "LIVE":
        return "bg-green-500/20 text-green-400 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30";
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
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formik.values.title || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p className="text-xs text-red-500">{formik.errors.title}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    name="type"
                    value={formik.values.type || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.type && formik.errors.type && (
                    <p className="text-xs text-red-500">{formik.errors.type}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formik.values.location || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.location && formik.errors.location && (
                    <p className="text-xs text-red-500">{formik.errors.location}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={formik.values.status || ""}
                    options={[
                      { label: "Active", value: "ACTIVE" },
                      { label: "Completed", value: "COMPLETED" },
                      { label: "Cancelled", value: "CANCELLED" },
                    ]}
                    onValueChange={(value) => formik.setFieldValue("status", value as any)}
                  />
                  {formik.touched.status && formik.errors.status && (
                    <p className="text-xs text-red-500">{formik.errors.status}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formik.values.description || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-xs text-red-500">{formik.errors.description}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating || formik.isSubmitting}>
                {isCreating || isUpdating || formik.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}

