import type { AppData, WishlistItem, Category, Budget, PurchaseRecord } from "./types";
import * as db from "./db";

export async function exportData(): Promise<AppData> {
  const [items, categories, budgets, purchaseHistory] = await Promise.all([
    db.getAllItems(),
    db.getAllCategories(),
    db.getAllBudgets(),
    db.getAllPurchaseHistory(),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    items,
    categories,
    budgets,
    purchaseHistory,
  };
}

export async function importData(data: AppData): Promise<void> {
  const items: WishlistItem[] = data.items || [];
  const categories: Category[] = data.categories || [];
  const budgets: Budget[] = data.budgets || [];
  const purchaseHistory: PurchaseRecord[] = data.purchaseHistory || [];
  await db.importAllData({ items, categories, budgets, purchaseHistory });
}

export function downloadJson(data: AppData, filename?: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `wishlist-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function uploadJson(file: File): Promise<AppData> {
  const text = await file.text();
  return JSON.parse(text) as AppData;
}
