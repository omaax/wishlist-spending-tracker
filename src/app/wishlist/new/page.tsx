"use client";

import { useRouter } from "next/navigation";
import { WishlistForm } from "@/components/wishlist/wishlist-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddItem } from "@/lib/query-hooks";
import type { WishlistItem } from "@/lib/types";

export default function NewWishlistItemPage() {
  const router = useRouter();
  const addItem = useAddItem();

  const handleSave = (item: WishlistItem) => {
    addItem.mutate(item, {
      onSuccess: () => router.push("/wishlist"),
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <WishlistForm
            onSave={handleSave}
            onCancel={() => router.push("/wishlist")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
