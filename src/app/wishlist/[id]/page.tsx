"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useItem, useUpdateItem, useDeleteItem } from "@/lib/query-hooks";
import { WishlistForm } from "@/components/wishlist/wishlist-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Trash2 } from "lucide-react";
import type { WishlistItem } from "@/lib/types";
import { toast } from "sonner";

export default function EditWishlistItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: item, isLoading } = useItem(id);
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!item) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Item not found
      </div>
    );
  }

  const handleSave = (updated: WishlistItem) => {
    updateItem.mutate(updated, {
      onSuccess: () => router.push("/wishlist"),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Item</h1>
        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <WishlistForm
            initialData={item}
            onSave={handleSave}
            onCancel={() => router.push("/wishlist")}
          />
        </CardContent>
      </Card>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={() => {
          deleteItem.mutate(id, {
            onSuccess: () => {
              toast.success("Item deleted");
              router.push("/wishlist");
            },
          });
        }}
      />
    </div>
  );
}
