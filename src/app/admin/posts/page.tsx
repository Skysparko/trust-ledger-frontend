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
import { DatePicker } from "@/components/ui/date-picker";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { useAdminPosts, useCreatePost, useUpdatePost, useDeletePost } from "@/hooks/swr/useAdmin";
import type { AdminPost, UpdateAdminPostPayload, CreateAdminPostPayload } from "@/api/admin.api";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

// Helper function to convert date to ISO format
const formatDateToISO = (dateStr: string | undefined): string | undefined => {
  if (!dateStr) return undefined;
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
  content: Yup.string()
    .min(10, "Content must be at least 10 characters")
    .required("Content is required"),
  category: Yup.string()
    .oneOf(["NEWS", "KNOWLEDGE"], "Category must be either NEWS or KNOWLEDGE")
    .required("Category is required"),
  date: Yup.string()
    .optional(),
  excerpt: Yup.string()
    .optional(),
  isPublished: Yup.boolean()
    .optional(),
  tags: Yup.array()
    .of(Yup.string())
    .optional(),
});

export default function AdminPostsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminPost | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { posts: filteredItems, isLoading, mutate } = useAdminPosts({
    search: searchQuery || undefined,
    category: undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const { createPost, isCreating } = useCreatePost();
  const { updatePost, isUpdating } = useUpdatePost();
  const { deletePost, isDeleting } = useDeletePost();

  // Ensure paginatedItems is always an array
  const paginatedItems = Array.isArray(filteredItems) ? filteredItems : [];
  const totalPages = Math.ceil(paginatedItems.length / ITEMS_PER_PAGE);

  const getInitialValues = (item?: AdminPost | null): Partial<CreateAdminPostPayload> => {
    if (item) {
      const normalizedCategory = item.category 
        ? (item.category.toUpperCase() as "NEWS" | "KNOWLEDGE")
        : "NEWS";
      return {
        title: item.title || "",
        content: item.content || "",
        category: normalizedCategory,
        date: formatDateFromISO(item.date),
        excerpt: item.excerpt || "",
        isPublished: item.isPublished ?? true,
        tags: item.tags || [],
      };
    }
    return {
      title: "",
      content: "",
      category: "NEWS",
      date: new Date().toISOString().split("T")[0],
      excerpt: "",
      isPublished: true,
      tags: [],
    };
  };

  const formik = useFormik<Partial<CreateAdminPostPayload>>({
    initialValues: getInitialValues(),
    validationSchema,
    enableReinitialize: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const dateValue = formatDateToISO(values.date);
        
        if (editingItem) {
          const payload: UpdateAdminPostPayload = {
            title: values.title,
            content: values.content,
            category: values.category,
            date: dateValue,
            excerpt: values.excerpt,
            isPublished: values.isPublished,
            tags: values.tags,
          };
          await updatePost({ id: editingItem.id, payload });
        } else {
          await createPost({
            title: values.title!,
            content: values.content!,
            category: values.category!,
            date: dateValue,
            excerpt: values.excerpt,
            isPublished: values.isPublished ?? true,
            tags: values.tags,
          });
        }
        mutate();
        setIsDialogOpen(false);
        setEditingItem(null);
        formik.resetForm();
      } catch (error) {
        console.error("Failed to save post:", error);
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

  const handleEdit = (item: AdminPost) => {
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
      await deletePost({ id: itemToDelete });
      mutate();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete post:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog/News Posts</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage blog and news posts
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search posts..."
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
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Excerpt</TableHead>
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
                    No posts found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.excerpt || item.content?.substring(0, 100) || "-"}</TableCell>
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
                {filteredItems.length} posts
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Post" : "Create Post"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the post details" : "Add a new blog or news post"}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={formik.values.category || ""}
                    options={[
                      { label: "News", value: "NEWS" },
                      { label: "Knowledge", value: "KNOWLEDGE" },
                    ]}
                    onValueChange={(value) => formik.setFieldValue("category", value as "NEWS" | "KNOWLEDGE")}
                  />
                  {formik.touched.category && formik.errors.category && (
                    <p className="text-xs text-red-500">{formik.errors.category}</p>
                  )}
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
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  className="w-full min-h-[80px] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  value={formik.values.excerpt || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Brief description of the post..."
                />
                {formik.touched.excerpt && formik.errors.excerpt && (
                  <p className="text-xs text-red-500">{formik.errors.excerpt}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  name="content"
                  className="w-full min-h-[100px] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  value={formik.values.content || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.content && formik.errors.content && (
                  <p className="text-xs text-red-500">{formik.errors.content}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formik.values.isPublished ?? true}
                  onChange={(e) => formik.setFieldValue("isPublished", e.target.checked)}
                  onBlur={formik.handleBlur}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Publish immediately
                </Label>
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
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}

