"use client";

import { useItems, usePurchaseHistory, useBudgets } from "@/lib/query-hooks";
import { useCategories } from "@/lib/query-hooks";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Star,
  Wallet,
  BarChart3,
} from "lucide-react";
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
  const favoriteItems = items.filter((i) => i.isFavorite);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Wishlist Value"
          value={formatCurrency(totalValue)}
          description={`${pendingItems.length} pending items`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Money Spent"
          value={formatCurrency(totalSpent)}
          description={`${purchasedItems.length} items purchased`}
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Average Item Price"
          value={items.length > 0 ? formatCurrency(totalValue / items.length) : "$0.00"}
          description={`Across ${items.length} items`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Favorites"
          value={favoriteItems.length.toString()}
          description="Pinned wishlist items"
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Monthly Spending"
          value={formatCurrency(monthlySpending)}
          description={
            currentBudget
              ? `${budgetProgress}% of $${currentBudget.limit} budget`
              : "No budget set"
          }
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title={mostExpensiveCategory ? mostExpensiveCategory.name : "Most Expensive"}
          value={
            mostExpensiveCategory
              ? formatCurrency(mostExpensiveCategory.value)
              : "-"
          }
          description={mostExpensiveCategory ? "Category total" : "No items yet"}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

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
      </div>
    </div>
  );
}
