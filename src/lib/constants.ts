import type { Priority, Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "clothing", name: "Clothing", color: "#ef4444" },
  { id: "electronics", name: "Electronics", color: "#3b82f6" },
  { id: "games", name: "Games", color: "#8b5cf6" },
  { id: "food", name: "Food", color: "#f59e0b" },
  { id: "furniture", name: "Furniture", color: "#10b981" },
  { id: "cars", name: "Cars", color: "#ec4899" },
  { id: "travel", name: "Travel", color: "#06b6d4" },
  { id: "other", name: "Other", color: "#6b7280" },
];

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  { value: "high", label: "High", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
];

export const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest First" },
  { value: "createdAt-asc", label: "Oldest First" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "priority", label: "Priority" },
];

export const DB_NAME = "wishlist-app";
export const DB_VERSION = 1;
