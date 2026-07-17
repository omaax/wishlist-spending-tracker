export type Priority = "low" | "medium" | "high";

export interface PriceEntry {
  price: number;
  date: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  url?: string;
  price?: number;
  category: string;
  priority: Priority;
  notes?: string;
  images?: { blob: string; filename: string }[];
  isPurchased: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  purchasedAt?: number;
  priceHistory: PriceEntry[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string;
}

export interface PurchaseRecord {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  price: number;
  purchasedAt: number;
}

export interface AppData {
  version: number;
  exportedAt: number;
  items: WishlistItem[];
  categories: Category[];
  budgets: Budget[];
  purchaseHistory: PurchaseRecord[];
}
