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
import { DatePicker } from "@/components/ui/date-picker";
import { useAdminPosts, useCreatePost, useUpdatePost, useDeletePost } from "@/hooks/swr/useAdmin";
import type { AdminPost, UpdateAdminPostPayload } from "@/api/admin.api";
import { Plus, Edit, Trash2, Search } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function AdminPostsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminPost | null>(null);
  const [formData, setFormData] = useState<Partial<AdminPost>>({});

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

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ date: new Date().toISOString().split("T")[0] });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: AdminPost) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost({ id });
        mutate();
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        // Transform formData to match UpdateAdminPostPayload type
        const payload: UpdateAdminPostPayload = {};
        if (formData.title) payload.title = formData.title;
        if (formData.content) payload.content = formData.content;
        if (formData.category) {
          // Normalize category to uppercase
          const normalizedCategory = formData.category.toUpperCase();
          if (normalizedCategory === "NEWS" || normalizedCategory === "KNOWLEDGE") {
            payload.category = normalizedCategory as "NEWS" | "KNOWLEDGE";
          }
        }
        if (formData.isPublished !== undefined) payload.isPublished = formData.isPublished;
        if (formData.tags) payload.tags = formData.tags;
        if (formData.excerpt) payload.excerpt = formData.excerpt;
        if (formData.date) {
          // Convert date to ISO format if needed
          if (formData.date.includes('T')) {
            payload.date = formData.date;
          } else {
            const [year, month, day] = formData.date.split('-').map(Number);
            const date = new Date(Date.UTC(year, month - 1, day, 10, 0, 0, 0));
            payload.date = date.toISOString();
          }
        }
        await updatePost({ id: editingItem.id, payload });
      } else {
        // Convert date to ISO string format if provided
        let dateValue: string | undefined;
        if (formData.date) {
          // If date is already in ISO format, use it; otherwise convert
          if (formData.date.includes('T')) {
            dateValue = formData.date;
          } else {
            // Convert "yyyy-MM-dd" format to ISO string with time
            // Parse as UTC to avoid timezone issues
            const [year, month, day] = formData.date.split('-').map(Number);
            const date = new Date(Date.UTC(year, month - 1, day, 10, 0, 0, 0));
            dateValue = date.toISOString();
          }
        }
        
        await createPost({
          title: formData.title || "",
          content: formData.content || "",
          category: (formData.category as any) || "NEWS",
          date: dateValue,
          excerpt: formData.excerpt,
          isPublished: formData.isPublished ?? true,
          tags: formData.tags,
        });
      }
      mutate();
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error("Failed to save post:", error);
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
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={formData.category || ""}
                  options={[
                    { label: "News", value: "NEWS" },
                    { label: "Knowledge", value: "KNOWLEDGE" },
                  ]}
                  onValueChange={(value) => setFormData({ ...formData, category: value as AdminPost["category"] })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  id="date"
                  value={formData.date || ""}
                  onChange={(value) => setFormData({ ...formData, date: value })}
                  placeholder="Select a date"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                className="w-full min-h-[80px] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                value={formData.excerpt || ""}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the post..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                className="w-full min-h-[100px] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished ?? true}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publish immediately
              </Label>
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

