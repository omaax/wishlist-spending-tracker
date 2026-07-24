"use client";

import { useItems, usePurchaseHistory, useBudgets } from "@/lib/query-hooks";
import { useCategories } from "@/lib/query-hooks";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { CategoryManager } from "@/components/ui/category-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { data: items = [] } = useItems();
  const { data: purchaseHistory = [] } = usePurchaseHistory();
  const { data: budgets = [] } = useBudgets();
  const { data: customCategories } = useCategories();
  const categories = customCategories && customCategories.length > 0
    ? DEFAULT_CATEGORIES.map((def) => customCategories.find((c) => c.id === def.id) ?? def)
        .concat(customCategories.filter((c) => !DEFAULT_CATEGORIES.some((d) => d.id === c.id)))
    : DEFAULT_CATEGORIES;

  const totalValue = items.reduce((sum, i) => sum + (i.price ?? 0), 0);
  const totalSpent = purchaseHistory.reduce((sum, r) => sum + r.price, 0);
  const purchasedItems = items.filter((i) => i.isPurchased);
  const pendingItems = items.filter((i) => !i.isPurchased);

  const categoryTotals = categories
    .map((cat) => ({
      name: cat.name,
      value: items
        .filter((i) => i.category === cat.id && !i.isPurchased)
        .reduce((sum, i) => sum + (i.price ?? 0), 0),
      color: cat.color,
      fill: cat.color,
    }))
    .filter((c) => c.value > 0);

  const mostExpensiveCategory = categoryTotals.length > 0
    ? categoryTotals.reduce((max, c) => (c.value > max.value ? c : max))
    : null;

  const categoryPurchaseCount = categories
    .map((cat) => ({
      name: cat.name,
      count: purchaseHistory.filter((r) => r.category === cat.id).length,
    }))
    .filter((c) => c.count > 0);

  const mostPurchasedCategory = categoryPurchaseCount.length > 0
    ? categoryPurchaseCount.reduce((max, c) => (c.count > max.count ? c : max))
    : null;

  const currentMonth = getCurrentMonth();
  const monthlySpending = purchaseHistory
    .filter((r) => r.purchasedAt.toString().startsWith(currentMonth) ||
      new Date(r.purchasedAt).toISOString().slice(0, 7) === currentMonth)
    .reduce((sum, r) => sum + r.price, 0);

  const currentBudget = budgets.find((b) => b.month === currentMonth);
  const budgetProgress = currentBudget
    ? Math.round((monthlySpending / currentBudget.limit) * 100)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/wishlist/new">
          <Button>Add Item</Button>
        </Link>
      </div>

      <StatsCards
        totalValue={totalValue}
        pendingItemsCount={pendingItems.length}
        totalSpent={totalSpent}
        purchasedItemsCount={purchasedItems.length}
        itemsCount={items.length}
        categoriesCount={categories.length}
        monthlySpending={monthlySpending}
        budgetLabel={currentBudget ? `${budgetProgress}% of $${currentBudget.limit} budget` : "No budget set"}
        mostExpensiveCategoryName={mostExpensiveCategory?.name ?? ""}
        mostExpensiveCategoryValue={mostExpensiveCategory?.value ?? 0}
        hasData={mostExpensiveCategory !== null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={categoryTotals} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Items</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No items yet. Start adding to your wishlist!
              </p>
            ) : (
              <div className="space-y-2">
                {items
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isPurchased ? "bg-green-500" : "bg-primary"
                          }`}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(item.price ?? 0)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryManager />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
