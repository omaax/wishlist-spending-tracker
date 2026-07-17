"use client";

import { useMemo } from "react";
import { useItems, usePurchaseHistory } from "@/lib/query-hooks";
import { useCategories } from "@/lib/query-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsPage() {
  const { data: items = [] } = useItems();
  const { data: purchaseHistory = [] } = usePurchaseHistory();
  const { data: customCategories } = useCategories();
  const categories = customCategories && customCategories.length > 0
    ? customCategories
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
      .map((cat) => ({
        name: cat.name,
        value: items
          .filter((i) => i.category === cat.id && !i.isPurchased)
          .reduce((sum, i) => sum + (i.price ?? 0), 0),
        color: cat.color,
      }))
      .filter((c) => c.value > 0);
  }, [items, categories]);

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
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categorySpending}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={(props: { name?: string; percent?: number }) =>
                          `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {categorySpending.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => formatCurrency(Number(v ?? 0))}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={categoryCount}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Items Purchased">
                        {categoryCount.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wishlist Value by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryWishlistValue.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No items in wishlist
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryWishlistValue}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={(props: { name?: string; percent?: number }) =>
                          `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                        }
                      >
                        {categoryWishlistValue.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => formatCurrency(Number(v ?? 0))}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={categoryWishlistValue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(v) => formatCurrency(Number(v ?? 0))}
                      />
                      <Bar dataKey="value" name="Total Value">
                        {categoryWishlistValue.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip
                      formatter={(v) => formatCurrency(Number(v ?? 0))}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Spending"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
