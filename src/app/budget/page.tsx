"use client";

import { useState, useMemo } from "react";
import { useBudgets, useAddBudget, useDeleteBudget, usePurchaseHistory } from "@/lib/query-hooks";
import { useCategories } from "@/lib/query-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, generateId, getCurrentMonth, getMonthLabel, sortCategories } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

export default function BudgetPage() {
  const { data: budgets = [] } = useBudgets();
  const { data: purchaseHistory = [] } = usePurchaseHistory();
  const { data: customCategories } = useCategories();
  const addBudget = useAddBudget();
  const deleteBudget = useDeleteBudget();
  const categories = sortCategories(customCategories && customCategories.length > 0
    ? customCategories
    : DEFAULT_CATEGORIES);

  const [newLimit, setNewLimit] = useState("");
  const [newCategory, setNewCategory] = useState(categories[0]?.id ?? "other");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const currentMonth = getCurrentMonth();

  const monthlySpending = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of purchaseHistory) {
      const month = new Date(r.purchasedAt).toISOString().slice(0, 7);
      if (month === currentMonth) {
        map.set(r.category, (map.get(r.category) ?? 0) + r.price);
      }
    }
    return map;
  }, [purchaseHistory, currentMonth]);

  const totalMonthlySpending = Array.from(monthlySpending.values()).reduce((a, b) => a + b, 0);
  const totalBudgetLimit = budgets.reduce((a, b) => a + b.limit, 0);

  const handleAddBudget = () => {
    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit <= 0) {
      toast.error("Please enter a valid limit");
      return;
    }
    addBudget.mutate({
      id: generateId(),
      category: newCategory,
      limit,
      month: currentMonth,
    });
    setNewLimit("");
    toast.success("Budget added");
  };

  const handleDeleteBudget = (id: string) => setDeleteTarget(id);

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;
  const getCategoryColor = (id: string) => categories.find((c) => c.id === id)?.color ?? "#6b7280";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Budget Planner</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudgetLimit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Spent This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlySpending)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.max(0, totalBudgetLimit - totalMonthlySpending))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{getMonthLabel(currentMonth)} Budgets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgets.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No budgets set for this month. Add a budget below.
            </p>
          ) : (
            budgets.map((budget) => {
              const spent = monthlySpending.get(budget.category) ?? 0;
              const percentage = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
              return (
                <div key={budget.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryColor(budget.category) }}
                      />
                      <span className="font-medium">{getCategoryName(budget.category)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setDeleteTarget(budget.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage > 90
                          ? "bg-destructive"
                          : percentage > 70
                          ? "bg-yellow-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={(v) => v && setNewCategory(v)}>
                <SelectTrigger className="w-[180px]">
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
            </div>
            <div className="space-y-1">
              <Label>Monthly Limit</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="0.00"
                className="w-[150px]"
              />
            </div>
            <Button onClick={handleAddBudget}>
              <Plus className="h-4 w-4 mr-1" />
              Add Budget
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        title="Delete Budget"
        description="Are you sure you want to remove this budget? This action cannot be undone."
        onConfirm={() => {
          if (deleteTarget) {
            deleteBudget.mutate(deleteTarget);
            toast.success("Budget removed");
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
