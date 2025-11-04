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
import { DatePicker } from "@/components/ui/date-picker";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { useAdminWebinars, useCreateWebinar, useUpdateWebinar, useDeleteWebinar } from "@/hooks/swr/useAdmin";
import type { AdminWebinar, CreateAdminWebinarPayload } from "@/api/admin.api";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

// Helper function to validate URL
const isValidUrl = (url: string | undefined): boolean => {
  if (!url || url.trim() === "") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper function to convert date to ISO format
const formatDateToISO = (dateStr: string | undefined): string => {
  if (!dateStr) return new Date().toISOString();
  if (dateStr.includes('T')) return dateStr;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 10, 0, 0, 0));
  return date.toISOString();
};

// Helper function to convert ISO date to YYYY-MM-DD format
const formatDateFromISO = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
};

const validationSchema = Yup.object({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  date: Yup.string()
    .required("Date is required"),
  duration: Yup.number()
    .typeError("Duration must be a number")
    .min(1, "Duration must be at least 1 minute")
    .max(1440, "Duration cannot exceed 1440 minutes (24 hours)")
    .required("Duration is required"),
  link: Yup.string()
    .test("is-url", "Link must be a valid URL", (value) => {
      if (!value || value.trim() === "") return false;
      return isValidUrl(value);
    })
    .required("Link is required"),
  isActive: Yup.boolean()
    .optional(),
});

export default function AdminWebinarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminWebinar | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { webinars: filteredItems, isLoading, mutate } = useAdminWebinars({
    search: searchQuery || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const { createWebinar, isCreating } = useCreateWebinar();
  const { updateWebinar, isUpdating } = useUpdateWebinar();
  const { deleteWebinar, isDeleting } = useDeleteWebinar();

  // Ensure paginatedItems is always an array
  const paginatedItems = Array.isArray(filteredItems) ? filteredItems : [];
  const totalPages = Math.ceil(paginatedItems.length / ITEMS_PER_PAGE);

  const getInitialValues = (item?: AdminWebinar | null): Partial<CreateAdminWebinarPayload> => {
    if (item) {
      return {
        title: item.title || "",
        description: item.description || "",
        date: formatDateFromISO(item.date),
        duration: item.duration || 60,
        link: item.link || "",
        isActive: item.isActive ?? true,
      };
    }
    return {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      duration: 60,
      link: "",
      isActive: true,
    };
  };

  const formik = useFormik<Partial<CreateAdminWebinarPayload>>({
    initialValues: getInitialValues(),
    validationSchema,
    enableReinitialize: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const dateValue = formatDateToISO(values.date);
        
        if (editingItem) {
          await updateWebinar({ 
            id: editingItem.id, 
            payload: {
              title: values.title,
              description: values.description,
              date: dateValue,
              duration: values.duration,
              link: values.link,
              isActive: values.isActive,
            }
          });
        } else {
          await createWebinar({
            title: values.title!,
            description: values.description!,
            date: dateValue,
            duration: values.duration || 60,
            link: values.link!,
            isActive: values.isActive ?? true,
          });
        }
        mutate();
        setIsDialogOpen(false);
        setEditingItem(null);
        formik.resetForm();
      } catch (error) {
        console.error("Failed to save webinar:", error);
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

  const handleEdit = (item: AdminWebinar) => {
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
      await deleteWebinar({ id: itemToDelete });
      mutate();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete webinar:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webinars</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage platform webinars
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Webinar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search webinars..."
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
                <TableHead>Speaker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                    No webinars found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
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
                {filteredItems.length} webinars
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
            <DialogTitle>{editingItem ? "Edit Webinar" : "Create Webinar"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the webinar details" : "Add a new webinar"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    name="link"
                    value={formik.values.link || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.link && formik.errors.link && (
                    <p className="text-xs text-red-500">{formik.errors.link}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formik.values.duration || ""}
                    onChange={(e) => formik.setFieldValue("duration", parseInt(e.target.value) || undefined)}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.duration && formik.errors.duration && (
                    <p className="text-xs text-red-500">{formik.errors.duration}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  id="date"
                  value={formik.values.date || ""}
                  onChange={(value) => formik.setFieldValue("date", value)}
                  placeholder="Select a date"
                />
                {formik.touched.date && formik.errors.date && (
                  <p className="text-xs text-red-500">{formik.errors.date}</p>
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
        title="Delete Webinar"
        description="Are you sure you want to delete this webinar? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}

