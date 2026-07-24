"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useItems, useDeleteItem, useUpdateItem, useAddPurchaseRecord, useDeletePurchaseRecord, usePurchaseHistory } from "@/lib/query-hooks";
import { WishlistCard } from "@/components/wishlist/wishlist-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Plus, Search, Download, Upload } from "lucide-react";
import { SORT_OPTIONS, DEFAULT_CATEGORIES } from "@/lib/constants";
import { useCategories } from "@/lib/query-hooks";
import { exportData, downloadJson, uploadJson } from "@/lib/export-import";
import { importData } from "@/lib/export-import";
import { toast } from "sonner";
import type { WishlistItem, PurchaseRecord } from "@/lib/types";
import { generateId, sortCategories } from "@/lib/utils";

const purchasingInFlight = new Set<string>();

export default function WishlistPage() {
  const { data: items = [] } = useItems();
  const { data: customCategories } = useCategories();
  const deleteItem = useDeleteItem();
  const updateItem = useUpdateItem();
  const addPurchaseRecord = useAddPurchaseRecord();
  const deletePurchaseRecord = useDeletePurchaseRecord();
  const { data: purchaseHistory = [] } = usePurchaseHistory();
  const categories = sortCategories(customCategories && customCategories.length > 0
    ? customCategories
    : DEFAULT_CATEGORIES);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [purchasedFilter, setPurchasedFilter] = useState("pending");
  const [sort, setSort] = useState("createdAt-desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const calc = () => {
      const vh = window.innerHeight;
      const gridTop = gridRef.current?.getBoundingClientRect().top ?? 160;
      const available = vh - gridTop - 72;
      const cardH = 300;
      const rows = Math.max(1, Math.floor((available + 8) / (cardH + 8)));
      const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      setPageSize(rows * cols);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.notes?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((i) => i.category === categoryFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((i) => i.priority === priorityFilter);
    }

    if (purchasedFilter === "purchased") {
      result = result.filter((i) => i.isPurchased);
    } else if (purchasedFilter === "pending") {
      result = result.filter((i) => !i.isPurchased);
    }

    const [sortField, sortDir] = sort.split("-") as [string, string];
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") cmp = a.createdAt - b.createdAt;
      else if (sortField === "price") cmp = (a.price ?? 0) - (b.price ?? 0);
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "priority") {
        const order = { high: 3, medium: 2, low: 1 };
        cmp = (order[a.priority] ?? 0) - (order[b.priority] ?? 0);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [items, search, categoryFilter, priorityFilter, purchasedFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);

  const handleTogglePurchased = async (item: WishlistItem) => {
    if (purchasingInFlight.has(item.id)) return;
    purchasingInFlight.add(item.id);
    try {
      const now = Date.now();
      const existingRecord = purchaseHistory.find((r) => r.itemId === item.id);
      await updateItem.mutateAsync({
        ...item,
        isPurchased: !item.isPurchased,
        purchasedAt: item.isPurchased ? undefined : now,
      });
      if (item.isPurchased && existingRecord) {
        deletePurchaseRecord.mutate(existingRecord.id);
      } else if (!item.isPurchased && !existingRecord) {
        addPurchaseRecord.mutate({
          id: generateId(),
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          price: item.price ?? 0,
          purchasedAt: now,
        });
      }
    } finally {
      purchasingInFlight.delete(item.id);
    }
  };

  const handleDelete = (id: string) => setDeleteTarget(id);

  const handleExport = async () => {
    const data = await exportData();
    downloadJson(data);
    toast.success("Data exported");
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = await uploadJson(file);
        await importData(data);
        toast.success("Data imported successfully");
        window.location.reload();
      } catch {
        toast.error("Invalid file format");
      }
    };
    input.click();
  };

  return (
    <div className="flex flex-col min-h-0 flex-1 gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        <h1 className="text-3xl font-bold">Wishlist</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Link href="/wishlist/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <FilterDropdown
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          placeholder="Category"
          className="w-[140px]"
          options={[
            { value: "all", label: "All Categories" },
            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
        />
        <FilterDropdown
          value={priorityFilter}
          onValueChange={setPriorityFilter}
          placeholder="Priority"
          className="w-[130px]"
          options={[
            { value: "all", label: "All Priorities" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
          renderValue={(val) =>
            val === "all" ? "All Priorities" : val.charAt(0).toUpperCase() + val.slice(1)
          }
        />
        <FilterDropdown
          value={purchasedFilter}
          onValueChange={setPurchasedFilter}
          placeholder="Status"
          className="w-[140px]"
          options={[
            { value: "all", label: "All Items" },
            { value: "pending", label: "Pending" },
            { value: "purchased", label: "Purchased" },
          ]}
          renderValue={(val) =>
            val === "all" ? "All Items" : val.charAt(0).toUpperCase() + val.slice(1)
          }
        />
        <FilterDropdown
          value={sort}
          onValueChange={setSort}
          placeholder="Sort by"
          className="w-[160px]"
          options={SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
          renderValue={(val) =>
            SORT_OPTIONS.find((o) => o.value === val)?.label ?? val
          }
        />
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
          <p className="text-lg mb-2">No items found</p>
          <p className="text-sm mb-4">
            {items.length === 0
              ? "Start building your wishlist!"
              : "Try a different filter"}
          </p>
          {items.length === 0 && (
            <Link href="/wishlist/new">
              <Button>Add Your First Item</Button>
            </Link>
          )}
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-y-auto content-start">
          {paginatedItems.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onTogglePurchased={() => handleTogglePurchased(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {paginatedItems.length > 0 && (
        <div className="shrink-0">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={() => {
          if (deleteTarget) {
            deleteItem.mutate(deleteTarget);
            toast.success("Item deleted");
          }
        }}
      />
    </div>
  );
}
