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
import { useAdminPosts, useCreatePost, useUpdatePost, useDeletePost } from "@/hooks/swr/useAdmin";
import type { AdminPost } from "@/api/admin.api";
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

  const handleEdit = (item: Post) => {
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
        await updatePost({ id: editingItem.id, payload: formData });
      } else {
        await createPost({
          title: formData.title || "",
          content: formData.content || "",
          category: (formData.category as any) || "NEWS",
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
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
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

