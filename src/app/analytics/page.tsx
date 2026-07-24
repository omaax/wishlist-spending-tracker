"use client";

import { useMemo } from "react";
import { useItems, usePurchaseHistory, useCategories } from "@/lib/query-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  BarChart,
  LineChart,
  Line,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsPage() {
  const { data: items = [] } = useItems();
  const { data: purchaseHistory = [] } = usePurchaseHistory();
  const { data: customCategories } = useCategories();
  const categories = customCategories && customCategories.length > 0
    ? DEFAULT_CATEGORIES.map((def) => customCategories.find((c) => c.id === def.id) ?? def)
        .concat(customCategories.filter((c) => !DEFAULT_CATEGORIES.some((d) => d.id === c.id)))
    : DEFAULT_CATEGORIES;

  const categorySpending = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of purchaseHistory) {
      map.set(r.category, (map.get(r.category) ?? 0) + r.price);
    }
    return categories
      .map((cat) => ({
        name: cat.name,
        value: map.get(cat.id) ?? 0,
        color: cat.color,
        fill: cat.color,
      }))
      .filter((c) => c.value > 0);
  }, [purchaseHistory, categories]);

  const categoryCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of purchaseHistory) {
      map.set(r.category, (map.get(r.category) ?? 0) + 1);
    }
    return categories
      .map((cat) => ({
        name: cat.name,
        count: map.get(cat.id) ?? 0,
        color: cat.color,
        fill: cat.color,
      }))
      .filter((c) => c.count > 0);
  }, [purchaseHistory, categories]);

  const monthlyTrends = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of purchaseHistory) {
      const month = new Date(r.purchasedAt).toISOString().slice(0, 7);
      map.set(month, (map.get(month) ?? 0) + r.price);
    }
    return Array.from(map.entries())
      .map(([month, total]) => ({
        month,
        total,
        label: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [purchaseHistory]);

  const categoryWishlistValue = useMemo(() => {
    return categories
      .map((cat) => {
        const catItems = items.filter((i) => i.category === cat.id && !i.isPurchased);
        return {
          name: cat.name,
          count: catItems.length,
          value: catItems.reduce((sum, i) => sum + (i.price ?? 0), 0),
          color: cat.color,
          fill: cat.color,
        };
      })
      .filter((c) => c.count > 0);
  }, [items, categories]);

  const totalSpent = purchaseHistory.reduce((sum, r) => sum + r.price, 0);
  const totalWishlistValue = items
    .filter((i) => !i.isPurchased)
    .reduce((sum, i) => sum + (i.price ?? 0), 0);

  const spendingConfig = Object.fromEntries(
    categorySpending.map((d) => [d.name, { label: d.name, color: d.color }])
  );
  const countConfig = Object.fromEntries(
    categoryCount.map((d) => [d.name, { label: d.name, color: d.color }])
  );
  const wishlistConfig = Object.fromEntries(
    categoryWishlistValue.map((d) => [d.name, { label: d.name, color: d.color }])
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <Tabs defaultValue="spending">
        <TabsList>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="spending" className="space-y-6 mt-4">
          <div className="text-lg font-semibold">
            Total Spent: {formatCurrency(totalSpent)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categorySpending.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No purchase data yet
                  </p>
                ) : (
                  <ChartContainer config={spendingConfig} className="mx-auto aspect-square max-h-[350px]">
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(v) => formatCurrency(v)} />}
                      />
                      <Pie
                        data={categorySpending}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={120}
                      />
                      <ChartLegend
                        content={<ChartLegendContent />}
                      />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Items Purchased by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryCount.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No purchase data yet
                  </p>
                ) : (
                  <ChartContainer config={countConfig} className="h-[350px] w-full">
                    <BarChart data={categoryCount}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="count"
                        name="Items Purchased"
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props;
                          return <rect x={x} y={y} width={width} height={height} fill={payload.fill} rx={4} />;
                        }}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-6 mt-4">
          <div className="text-lg font-semibold">
            Total Value: {formatCurrency(totalWishlistValue)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist Items by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryWishlistValue.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No items in wishlist
                  </p>
                ) : (
                  <ChartContainer config={wishlistConfig} className="mx-auto aspect-square max-h-[350px]">
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <Pie
                        data={categoryWishlistValue}
                        dataKey="count"
                        nameKey="name"
                        outerRadius={120}
                      />
                      <ChartLegend
                        content={<ChartLegendContent />}
                      />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryWishlistValue.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No items in wishlist
                  </p>
                ) : (
                  <ChartContainer config={wishlistConfig} className="h-[350px] w-full">
                    <BarChart data={categoryWishlistValue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />
                      <Bar
                        dataKey="count"
                        name="Items"
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props;
                          return <rect x={x} y={y} width={width} height={height} fill={payload.fill} rx={4} />;
                        }}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrends.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No purchase data yet
                </p>
              ) : (
                <ChartContainer
                  config={{ total: { label: "Spending", color: "hsl(var(--primary))" } }}
                  className="h-[400px] w-full"
                >
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(v) => formatCurrency(v)} />}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-total)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
