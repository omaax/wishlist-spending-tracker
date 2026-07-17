"use client";

import { usePurchaseHistory, useDeletePurchaseRecord } from "@/lib/query-hooks";
import { useCategories } from "@/lib/query-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trash2, ShoppingCart } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function PurchaseHistoryPage() {
  const { data: purchaseHistory = [] } = usePurchaseHistory();
  const { data: customCategories } = useCategories();
  const deleteRecord = useDeletePurchaseRecord();
  const categories = customCategories && customCategories.length > 0
    ? customCategories
    : DEFAULT_CATEGORIES;

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    if (!search) return purchaseHistory.sort((a, b) => b.purchasedAt - a.purchasedAt);
    const q = search.toLowerCase();
    return purchaseHistory
      .filter(
        (r) =>
          r.itemName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      )
      .sort((a, b) => b.purchasedAt - a.purchasedAt);
  }, [purchaseHistory, search]);

  const totalSpent = purchaseHistory.reduce((sum, r) => sum + r.price, 0);
  const getCategoryColor = (id: string) =>
    categories.find((c) => c.id === id)?.color ?? "#6b7280";
  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? id;

  const handleDelete = (id: string) => setDeleteTarget(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold">Purchase History</h1>
        <div className="text-lg font-semibold">
          Total: {formatCurrency(totalSpent)}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Purchases</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No purchase history yet</p>
              <p className="text-sm">
                Mark items as purchased to track your spending
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(record.category) }}
                    />
                    <div>
                      <p className="font-medium">{record.itemName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: getCategoryColor(record.category),
                            color: getCategoryColor(record.category),
                          }}
                        >
                          {getCategoryName(record.category)}
                        </Badge>
                        <span>{formatDate(record.purchasedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {formatCurrency(record.price)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Delete Record"
        description="Are you sure you want to delete this purchase record? This action cannot be undone."
        onConfirm={() => {
          if (deleteTarget) {
            deleteRecord.mutate(deleteTarget);
            toast.success("Record deleted");
          }
        }}
      />
    </div>
  );
}
