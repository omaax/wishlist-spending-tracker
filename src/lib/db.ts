import { openDB, type IDBPDatabase } from "idb";
import { DB_NAME, DB_VERSION, DEFAULT_CATEGORIES } from "./constants";
import type { WishlistItem, Category, Budget, PurchaseRecord } from "./types";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("items")) {
          db.createObjectStore("items", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("categories")) {
          const catStore = db.createObjectStore("categories", { keyPath: "id" });
          for (const cat of DEFAULT_CATEGORIES) {
            catStore.put(cat);
          }
        }
        if (!db.objectStoreNames.contains("budgets")) {
          db.createObjectStore("budgets", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("purchaseHistory")) {
          db.createObjectStore("purchaseHistory", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllItems(): Promise<WishlistItem[]> {
  const db = await getDb();
  return db.getAll("items");
}

export async function getItem(id: string): Promise<WishlistItem | undefined> {
  const db = await getDb();
  return db.get("items", id);
}

export async function addItem(item: WishlistItem): Promise<void> {
  const db = await getDb();
  await db.put("items", item);
}

export async function updateItem(item: WishlistItem): Promise<void> {
  const db = await getDb();
  await db.put("items", item);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("items", id);
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  return db.getAll("categories");
}

export async function addCategory(category: Category): Promise<void> {
  const db = await getDb();
  await db.put("categories", category);
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDb();
  const allItems = await db.getAll("items");
  const toDelete = allItems.filter((i) => i.category === id);
  const tx = db.transaction(["categories", "items"], "readwrite");
  await tx.objectStore("categories").delete(id);
  for (const item of toDelete) {
    await tx.objectStore("items").delete(item.id);
  }
  await tx.done;
}

export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDb();
  return db.getAll("budgets");
}

export async function addBudget(budget: Budget): Promise<void> {
  const db = await getDb();
  await db.put("budgets", budget);
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("budgets", id);
}

export async function getAllPurchaseHistory(): Promise<PurchaseRecord[]> {
  const db = await getDb();
  return db.getAll("purchaseHistory");
}

export async function addPurchaseRecord(record: PurchaseRecord): Promise<void> {
  const db = await getDb();
  await db.put("purchaseHistory", record);
}

export async function deletePurchaseRecord(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("purchaseHistory", id);
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["items", "categories", "budgets", "purchaseHistory"], "readwrite");
  await Promise.all([
    tx.objectStore("items").clear(),
    tx.objectStore("categories").clear(),
    tx.objectStore("budgets").clear(),
    tx.objectStore("purchaseHistory").clear(),
  ]);
  const catStore = tx.objectStore("categories");
  for (const cat of DEFAULT_CATEGORIES) {
    catStore.put(cat);
  }
  await tx.done;
}

export async function importAllData(data: {
  items: WishlistItem[];
  categories: Category[];
  budgets: Budget[];
  purchaseHistory: PurchaseRecord[];
}): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["items", "categories", "budgets", "purchaseHistory"], "readwrite");
  await Promise.all([
    tx.objectStore("items").clear(),
    tx.objectStore("categories").clear(),
    tx.objectStore("budgets").clear(),
    tx.objectStore("purchaseHistory").clear(),
  ]);
  for (const item of data.items) await tx.objectStore("items").put(item);
  for (const cat of data.categories) await tx.objectStore("categories").put(cat);
  for (const budget of data.budgets) await tx.objectStore("budgets").put(budget);
  for (const record of data.purchaseHistory) await tx.objectStore("purchaseHistory").put(record);
  await tx.done;
}
