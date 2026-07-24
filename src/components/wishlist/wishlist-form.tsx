"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { toast } from "sonner";
import { ImageUpload } from "./image-upload";
import { CategoryManager } from "@/components/ui/category-manager";
import type { WishlistItem, Priority } from "@/lib/types";
import { generateId, sortCategories } from "@/lib/utils";
import { PRIORITIES, DEFAULT_CATEGORIES } from "@/lib/constants";
import { useCategories } from "@/lib/query-hooks";

interface WishlistFormProps {
  initialData?: WishlistItem;
  onSave: (item: WishlistItem) => void;
  onCancel?: () => void;
}

const wishlistSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be under 100 characters"),
  price: z.string().refine((v) => v === "" || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0), "Price must be a valid positive number"),
  url: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  notes: z.string().max(400).optional(),
})

export function WishlistForm({ initialData, onSave, onCancel }: WishlistFormProps) {
  const router = useRouter();
  const { data: customCategories } = useCategories();
  const categories = sortCategories(customCategories && customCategories.length > 0
    ? customCategories
    : DEFAULT_CATEGORIES);

  const [name, setName] = useState(initialData?.name ?? "");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [category, setCategory] = useState(initialData?.category ?? categories[0]?.id ?? "other");
  const [priority, setPriority] = useState<Priority>(initialData?.priority ?? "medium");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [images, setImages] = useState<{ blob: string; filename: string }[]>(initialData?.images ?? []);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = wishlistSchema.safeParse({ name, price, url, notes });
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    setSaving(true);
    try {
      const now = Date.now();
      const priceHistory = initialData?.priceHistory ?? [];
      const priceNum = price ? parseFloat(price) : undefined;
      if (priceNum !== undefined && !isNaN(priceNum) && priceNum >= 0) {
        if (!initialData || initialData.price !== priceNum) {
          priceHistory.push({ price: priceNum, date: now });
        }
      }
      const item: WishlistItem = {
        id: initialData?.id ?? generateId(),
        name: name.trim(),
        url: url.trim() || undefined,
        price: priceNum,
        category,
        priority,
        notes: notes.trim() || undefined,
        images,
        isPurchased: initialData?.isPurchased ?? false,
        isFavorite: initialData?.isFavorite ?? false,
        createdAt: initialData?.createdAt ?? now,
        updatedAt: now,
        purchasedAt: initialData?.purchasedAt,
        priceHistory,
      };
      onSave(item);
      toast.success(initialData ? "Item updated" : "Item added");
      if (!initialData) {
        setName("");
        setUrl("");
        setPrice("");
        setCategory(categories[0]?.id ?? "other");
        setPriority("medium");
        setNotes("");
        setImages([]);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What do you want?"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex gap-2">
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger className="flex-1">
              <SelectValue>{(val) => categories.find((c) => c.id === val)?.name ?? val}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center rounded-lg border border-input bg-transparent hover:bg-muted text-sm font-medium h-8 px-2.5">
              +
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <CategoryManager />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Product URL</Label>
        <div className="flex gap-2">
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!url.trim() || fetchingImage}
            onClick={async () => {
              setFetchingImage(true);
              try {
                const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(url.trim())}`);
                const data = await res.json();

                if (data.title && !name.trim()) setName(data.title);
                if (data.price && !price) setPrice(data.price.replace(/[^0-9.]/g, ""));
                if (data.category) {
                  const match = categories.find(
                    (c) => c.name.toLowerCase() === data.category.toLowerCase()
                  );
                  if (match) setCategory(match.id);
                }

                if (data.images && data.images.length > 0) {
                  setImages((prev) => [...prev, ...data.images]);
                  toast.success(`${data.images.length} image${data.images.length > 1 ? "s" : ""} extracted from URL`);
                } else if (data.title || data.price || data.category) {
                  toast.success("Product info extracted from URL");
                } else {
                  toast.error("No product data found at this URL");
                }
              } catch {
                toast.error("Failed to fetch image from URL");
              } finally {
                setFetchingImage(false);
              }
            }}
          >
            {fetchingImage ? "Fetching..." : "Fetch Image"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUpload
          value={images}
          onChange={(imgs) => setImages(imgs)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => {
            const words = e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0;
            if (words <= 50) setNotes(e.target.value);
          }}
          placeholder="Any additional details... (max 50 words)"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : initialData ? "Update Item" : "Add Item"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
    </>
  );
}
